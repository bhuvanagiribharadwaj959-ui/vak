import os
import math
import time
import json
import random
import sys
import gc
import warnings
import torch
import torch.nn as nn
import torch.nn.functional as F
from tqdm import tqdm
from transformers import GPT2LMHeadModel, GPT2TokenizerFast, logging as tf_logging
from datasets import load_dataset
from test_own_gpt import GPT

warnings.filterwarnings("ignore")
tf_logging.set_verbosity_error()

# Limit PyTorch CPU threads to 4 to reduce thread allocation memory overhead
torch.set_num_threads(min(4, os.cpu_count() or 4))

def clear_memory():
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

def print_flush(*args, **kwargs):
    print(*args, **kwargs, flush=True)

def set_seed(seed=42):
    random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)

def encode_truncated(tokenizer, text, max_len=1024):
    return tokenizer.encode(text, truncation=True, max_length=max_len)

def load_my_model(ckpt_path, device):
    print_flush(f"Loading custom model checkpoint from '{ckpt_path}'...")
    ckpt = torch.load(ckpt_path, map_location='cpu')
    cfg = ckpt.get('cfg', {'n_layer': 12, 'n_head': 12, 'n_embd': 768, 'context_length': 1024, 'vocab_size': 50257})
    model = GPT(cfg).to(device)
    state_dict = ckpt['model'] if isinstance(ckpt, dict) and 'model' in ckpt else ckpt
    model.load_state_dict(state_dict, strict=False)
    model.eval()
    step = ckpt.get('global_step', 'N/A')
    epoch = ckpt.get('epoch', 'N/A')
    print_flush(f"Custom model loaded! Step: {step} | Epoch: {epoch}")
    return model, cfg, step, epoch

def load_openai_gpt2(device):
    print_flush("Loading OpenAI official GPT-2 (124M) model...")
    model = GPT2LMHeadModel.from_pretrained('gpt2').to(device)
    model.eval()
    print_flush("OpenAI GPT-2 loaded successfully!")
    return model

@torch.no_grad()
def get_sequence_logits(model, input_ids):
    if input_ids.size(1) > 1024:
        input_ids = input_ids[:, :1024]
        
    if isinstance(model, GPT2LMHeadModel):
        return model(input_ids).logits
    else:
        B, T = input_ids.size()
        pos = torch.arange(0, T, dtype=torch.long, device=input_ids.device)
        x = model.transformer.drop(model.transformer.wte(input_ids) + model.transformer.wpe(pos))
        for block in model.transformer.h:
            x = block(x)
        x = model.transformer.ln_f(x)
        logits = model.lm_head(x)
        return logits

@torch.no_grad()
def generate_text_unified(model, tokenizer, device, prompt, max_new_tokens=80, temperature=0.8, top_k=50, greedy=False):
    tokens = encode_truncated(tokenizer, prompt, max_len=1000)
    idx = torch.tensor([tokens], dtype=torch.long, device=device)
    
    if greedy:
        temperature = 1.0
        top_k = 1
        
    for _ in range(max_new_tokens):
        idx_crop = idx if idx.size(1) <= 1024 else idx[:, -1024:]
        logits = get_sequence_logits(model, idx_crop)
        logits = logits[:, -1, :] / max(temperature, 1e-5)
        
        if top_k is not None and top_k > 0:
            v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
            logits[logits < v[:, [-1]]] = float('-inf')
            
        probs = F.softmax(logits, dim=-1)
        if greedy:
            idx_next = torch.argmax(probs, dim=-1, keepdim=True)
        else:
            idx_next = torch.multinomial(probs, num_samples=1)
            
        idx = torch.cat((idx, idx_next), dim=1)
        if idx_next.item() == tokenizer.eos_token_id:
            break
            
    return tokenizer.decode(idx[0].tolist(), skip_special_tokens=True)

# -----------------------------------------------------------------------------
# Evaluation Metric 1: Batched Validation Loss & Perplexity
# -----------------------------------------------------------------------------
@torch.no_grad()
def eval_corpus_perplexity(model, tokenizer, dataset_text_list, device, desc="Corpus PPL", max_samples=100, ctx_len=1024, batch_size=2):
    all_tokens = []
    for text in dataset_text_list[:max_samples]:
        if text.strip():
            tokens = encode_truncated(tokenizer, text, max_len=1024) + [tokenizer.eos_token_id]
            all_tokens.extend(tokens)
            
    num_chunks = len(all_tokens) // ctx_len
    if num_chunks == 0:
        return float('inf'), float('inf')
        
    all_tokens = all_tokens[:num_chunks * ctx_len]
    tokens_tensor = torch.tensor(all_tokens, dtype=torch.long, device=device).view(num_chunks, ctx_len)
    
    total_loss = 0.0
    total_tokens = 0
    
    for i in tqdm(range(0, num_chunks, batch_size), desc=desc):
        batch = tokens_tensor[i:i+batch_size]
        input_ids = batch[:, :-1].contiguous()
        targets = batch[:, 1:].contiguous()
        
        logits = get_sequence_logits(model, input_ids)
        loss = F.cross_entropy(logits.reshape(-1, logits.size(-1)), targets.reshape(-1), reduction='sum')
        
        total_loss += loss.item()
        total_tokens += targets.numel()
        clear_memory()
        
    avg_loss = total_loss / total_tokens
    perplexity = math.exp(avg_loss)
    clear_memory()
    return avg_loss, perplexity

# -----------------------------------------------------------------------------
# Evaluation Metric 2: Batched HellaSwag Evaluation
# -----------------------------------------------------------------------------
@torch.no_grad()
def eval_hellaswag(model, tokenizer, dataset, device, max_examples=200, batch_examples=1):
    correct_raw = 0
    correct_norm = 0
    total = 0
    
    examples = list(dataset)[:max_examples]
    loss_fn = nn.CrossEntropyLoss(reduction='none')
    pad_id = tokenizer.eos_token_id
    
    for b_idx in tqdm(range(0, len(examples), batch_examples), desc="HellaSwag Eval"):
        chunk_examples = examples[b_idx : b_idx + batch_examples]
        
        # Prepare list of 4 candidate endings per example
        flat_full_tokens = []
        flat_ctx_lens = []
        labels = []
        
        for ex in chunk_examples:
            ctx = ex['ctx_a'] + " " + ex['ctx_b'].capitalize()
            endings = ex['endings']
            labels.append(int(ex['label']))
            ctx_t = encode_truncated(tokenizer, ctx, max_len=500)
            
            for end in endings:
                full_t = encode_truncated(tokenizer, ctx + " " + end, max_len=1000)
                flat_full_tokens.append(full_t)
                flat_ctx_lens.append(len(ctx_t))
                
        max_len = min(max(len(t) for t in flat_full_tokens), 1024)
        N = len(flat_full_tokens) # B * 4
        
        input_batch = torch.full((N, max_len - 1), pad_id, dtype=torch.long, device=device)
        target_batch = torch.full((N, max_len - 1), pad_id, dtype=torch.long, device=device)
        
        for k in range(N):
            t_ids = flat_full_tokens[k][:max_len]
            seq_len = len(t_ids)
            if seq_len > 1:
                input_batch[k, :seq_len - 1] = torch.tensor(t_ids[:-1], dtype=torch.long, device=device)
                target_batch[k, :seq_len - 1] = torch.tensor(t_ids[1:], dtype=torch.long, device=device)
                
        logits = get_sequence_logits(model, input_batch)
        token_losses = loss_fn(logits.reshape(-1, logits.size(-1)), target_batch.reshape(-1)).reshape(N, max_len - 1)
        
        # Process results per example
        for e_idx in range(len(chunk_examples)):
            label = labels[e_idx]
            ending_losses = []
            ending_norm_losses = []
            
            for opt in range(4):
                k = e_idx * 4 + opt
                t_ids = flat_full_tokens[k][:max_len]
                seq_len = len(t_ids)
                ctx_len = flat_ctx_lens[k]
                
                target_start = min(ctx_len, seq_len - 1)
                target_end = seq_len - 1
                
                e_losses = token_losses[k, target_start - 1 : target_end]
                sum_l = e_losses.sum().item()
                num_t = max(e_losses.numel(), 1)
                norm_l = sum_l / num_t
                
                ending_losses.append(sum_l)
                ending_norm_losses.append(norm_l)
                
            pred_raw = int(torch.argmin(torch.tensor(ending_losses)).item())
            pred_norm = int(torch.argmin(torch.tensor(ending_norm_losses)).item())
            
            if pred_raw == label:
                correct_raw += 1
            if pred_norm == label:
                correct_norm += 1
            total += 1
        
        clear_memory()
            
    acc_raw = (correct_raw / total) * 100.0
    acc_norm = (correct_norm / total) * 100.0
    clear_memory()
    return acc_raw, acc_norm, total

# -----------------------------------------------------------------------------
# Evaluation Metric 3: LAMBADA Evaluation
# -----------------------------------------------------------------------------
@torch.no_grad()
def eval_lambada(model, tokenizer, dataset, device, max_examples=200):
    correct = 0
    total = 0
    total_target_loss = 0.0
    total_target_tokens = 0
    loss_fn = nn.CrossEntropyLoss(reduction='none')
    
    examples = list(dataset)[:max_examples]
    
    for example in tqdm(examples, desc="LAMBADA Eval"):
        text = example['text'].strip()
        words = text.split()
        if len(words) < 2:
            continue
            
        prompt_text = " ".join(words[:-1])
        prompt_tokens = encode_truncated(tokenizer, prompt_text, max_len=1000)
        full_tokens = encode_truncated(tokenizer, text, max_len=1024)
        
        if len(full_tokens) <= len(prompt_tokens):
            continue
            
        input_ids = torch.tensor([full_tokens[:-1]], dtype=torch.long, device=device)
        targets = torch.tensor([full_tokens[1:]], dtype=torch.long, device=device)
        
        logits = get_sequence_logits(model, input_ids)
        
        target_start = len(prompt_tokens)
        target_token_ids = full_tokens[target_start:]
        
        pred_tokens = []
        for p in range(target_start - 1, len(full_tokens) - 1):
            pred_id = torch.argmax(logits[0, p, :]).item()
            pred_tokens.append(pred_id)
            
        if pred_tokens == target_token_ids:
            correct += 1
            
        token_losses = loss_fn(logits.reshape(-1, logits.size(-1)), targets.reshape(-1))
        target_losses = token_losses[target_start - 1:]
        
        total_target_loss += target_losses.sum().item()
        total_target_tokens += target_losses.numel()
        total += 1
        
    acc = (correct / max(total, 1)) * 100.0
    avg_target_loss = total_target_loss / max(total_target_tokens, 1)
    ppl = math.exp(avg_target_loss)
    return acc, ppl, total

# -----------------------------------------------------------------------------
# Main Evaluation Runner
# -----------------------------------------------------------------------------
def main():
    set_seed(42)
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print_flush(f"Running evaluation on device: {device} with {torch.get_num_threads()} CPU threads.")
    
    ckpt_path = "model/hourly_ckpt_A.pt"
    if not os.path.exists(ckpt_path):
        print_flush(f"Error: {ckpt_path} not found!")
        return
        
    tokenizer = GPT2TokenizerFast.from_pretrained('gpt2')
    my_model, my_cfg, my_step, my_epoch = load_my_model(ckpt_path, device)
    openai_model = load_openai_gpt2(device)
    
    models = {
        "Custom GPT-124M (my-model)": my_model,
        "OpenAI GPT-2 (124M base)": openai_model
    }
    
    results = {}
    
    print_flush("\n" + "="*80)
    print_flush(" 1. QUANTITATIVE METRICS: VALIDATION LOSS & PERPLEXITY")
    print_flush("="*80)
    
    print_flush("Loading validation datasets...")
    ds_wt2 = load_dataset('salesforce/wikitext', 'wikitext-2-raw-v1', split='validation')
    wt2_texts = [x['text'] for x in ds_wt2 if x['text'].strip()]
    
    ds_wt103 = load_dataset('salesforce/wikitext', 'wikitext-103-raw-v1', split='validation')
    wt103_texts = [x['text'] for x in ds_wt103 if x['text'].strip()]
    
    ds_owt = load_dataset('Skylion007/openwebtext', split='train', streaming=True)
    owt_texts = []
    for i, ex in enumerate(ds_owt):
        if i >= 40:
            break
        if ex['text'].strip():
            owt_texts.append(ex['text'])
            
    print_flush(f"Loaded datasets: WikiText-2 ({len(wt2_texts)} lines), WikiText-103 ({len(wt103_texts)} lines), OpenWebText slice ({len(owt_texts)} docs)")
    
    perplexities = {}
    for model_name, model_obj in models.items():
        print_flush(f"\nEvaluating Validation Perplexity for: {model_name}...")
        l_wt2, p_wt2 = eval_corpus_perplexity(model_obj, tokenizer, wt2_texts, device, desc=f"{model_name} [WT-2]", max_samples=100, batch_size=2)
        l_wt103, p_wt103 = eval_corpus_perplexity(model_obj, tokenizer, wt103_texts, device, desc=f"{model_name} [WT-103]", max_samples=100, batch_size=2)
        l_owt, p_owt = eval_corpus_perplexity(model_obj, tokenizer, owt_texts, device, desc=f"{model_name} [OWT]", max_samples=40, batch_size=2)
        
        perplexities[model_name] = {
            "WikiText-2": {"loss": round(l_wt2, 4), "ppl": round(p_wt2, 2)},
            "WikiText-103": {"loss": round(l_wt103, 4), "ppl": round(p_wt103, 2)},
            "OpenWebText Slice": {"loss": round(l_owt, 4), "ppl": round(p_owt, 2)}
        }
        print_flush(f"  -> WikiText-2: Loss = {l_wt2:.4f} | Perplexity = {p_wt2:.2f}")
        print_flush(f"  -> WikiText-103: Loss = {l_wt103:.4f} | Perplexity = {p_wt103:.2f}")
        print_flush(f"  -> OpenWebText Slice: Loss = {l_owt:.4f} | Perplexity = {p_owt:.2f}")
        
    results["Perplexity"] = perplexities
    
    print_flush("\n" + "="*80)
    print_flush(" 2. STANDARD BENCHMARK EVALUATIONS (HellaSwag & LAMBADA)")
    print_flush("="*80)
    
    print_flush("Loading HellaSwag & LAMBADA datasets...")
    ds_hs = load_dataset('Rowan/hellaswag', split='validation')
    ds_lam = load_dataset('eleutherai/lambada_openai', split='test')
    
    benchmarks = {}
    eval_num_samples = 200
    
    for model_name, model_obj in models.items():
        print_flush(f"\nEvaluating HellaSwag ({eval_num_samples} samples) for: {model_name}...")
        hs_raw, hs_norm, hs_count = eval_hellaswag(model_obj, tokenizer, ds_hs, device, max_examples=eval_num_samples, batch_examples=1)
        print_flush(f"  -> HellaSwag Raw Acc: {hs_raw:.2f}% | Norm Acc: {hs_norm:.2f}% (N={hs_count})")
        
        print_flush(f"\nEvaluating LAMBADA ({eval_num_samples} samples) for: {model_name}...")
        lam_acc, lam_ppl, lam_count = eval_lambada(model_obj, tokenizer, ds_lam, device, max_examples=eval_num_samples)
        print_flush(f"  -> LAMBADA Acc: {lam_acc:.2f}% | Target PPL: {lam_ppl:.2f} (N={lam_count})")
        
        benchmarks[model_name] = {
            "HellaSwag Raw Acc (%)": round(hs_raw, 2),
            "HellaSwag Norm Acc (%)": round(hs_norm, 2),
            "LAMBADA Acc (%)": round(lam_acc, 2),
            "LAMBADA Target PPL": round(lam_ppl, 2)
        }
        
    results["Benchmarks"] = benchmarks
    
    print_flush("\n" + "="*80)
    print_flush(" 3. QUALITATIVE GENERATION COMPARISON")
    print_flush("="*80)
    
    test_prompts = [
        "The meaning of life is",
        "In a distant galaxy, the last star",
        "Artificial intelligence will",
        "def fibonacci(n):",
        "Question: What is the capital of France? Answer:",
        "The solar system consists of eight planets, which are"
    ]
    
    qualitative = []
    
    for idx, prompt in enumerate(test_prompts, 1):
        print_flush(f"\nPrompt {idx}: '{prompt}'")
        prompt_res = {"prompt": prompt, "generations": {}}
        
        for model_name, model_obj in models.items():
            set_seed(42)
            gen_greedy = generate_text_unified(model_obj, tokenizer, device, prompt, max_new_tokens=80, greedy=True)
            
            set_seed(42)
            gen_sample = generate_text_unified(model_obj, tokenizer, device, prompt, max_new_tokens=80, temperature=0.8, top_k=50, greedy=False)
            
            prompt_res["generations"][model_name] = {
                "greedy": gen_greedy,
                "sampling_t0.8_topk50": gen_sample
            }
            
            print_flush(f"  [{model_name}] (Greedy):\n    {gen_greedy[:150]}...")
            print_flush(f"  [{model_name}] (Sampling):\n    {gen_sample[:150]}...")
            
        qualitative.append(prompt_res)
        
    results["Qualitative"] = qualitative
    
    with open("eval_results.json", "w") as f:
        json.dump(results, f, indent=2)
    print_flush("\nEvaluation results saved to 'eval_results.json'!")

if __name__ == "__main__":
    main()
