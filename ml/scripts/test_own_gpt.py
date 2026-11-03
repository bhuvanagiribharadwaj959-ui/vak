import os
import math
import warnings
from dotenv import load_dotenv
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import GPT2TokenizerFast
from huggingface_hub import hf_hub_download

warnings.filterwarnings("ignore")

# -----------------------------------------------------------------------------
# Optimized GPT-2 Model Architecture with PyTorch SDPA (Flash Attention)
# -----------------------------------------------------------------------------

class CausalSelfAttention(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        assert cfg['n_embd'] % cfg['n_head'] == 0
        self.n_head = cfg['n_head']
        self.n_embd = cfg['n_embd']
        self.head_dim = cfg['n_embd'] // cfg['n_head']
        self.c_attn = nn.Linear(cfg['n_embd'], 3 * cfg['n_embd'], bias=cfg.get('bias', True))
        self.c_proj = nn.Linear(cfg['n_embd'], cfg['n_embd'], bias=cfg.get('bias', True))
        self.attn_drop = cfg.get('dropout', 0.0)
        self.resid_drop = nn.Dropout(cfg.get('dropout', 0.0))

    def forward(self, x):
        B, T, C = x.size()
        q, k, v = self.c_attn(x).split(self.n_embd, dim=2)
        q = q.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        k = k.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        v = v.view(B, T, self.n_head, self.head_dim).transpose(1, 2)
        
        # PyTorch SDPA Flash Attention kernel
        y = F.scaled_dot_product_attention(
            q, k, v,
            attn_mask=None,
            dropout_p=self.attn_drop if self.training else 0.0,
            is_causal=True
        )
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        return self.resid_drop(self.c_proj(y))


class MLP(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.c_fc   = nn.Linear(cfg['n_embd'], 4 * cfg['n_embd'], bias=cfg.get('bias', True))
        self.gelu   = nn.GELU()
        self.c_proj = nn.Linear(4 * cfg['n_embd'], cfg['n_embd'], bias=cfg.get('bias', True))
        self.drop   = nn.Dropout(cfg.get('dropout', 0.0))

    def forward(self, x):
        return self.drop(self.c_proj(self.gelu(self.c_fc(x))))


class Block(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.ln1  = nn.LayerNorm(cfg['n_embd'])
        self.attn = CausalSelfAttention(cfg)
        self.ln2  = nn.LayerNorm(cfg['n_embd'])
        self.mlp  = MLP(cfg)

    def forward(self, x):
        x = x + self.attn(self.ln1(x))
        x = x + self.mlp(self.ln2(x))
        return x


class GPT(nn.Module):
    def __init__(self, cfg):
        super().__init__()
        self.cfg = cfg
        self.transformer = nn.ModuleDict(dict(
            wte  = nn.Embedding(cfg['vocab_size'], cfg['n_embd']),
            wpe  = nn.Embedding(cfg['context_length'], cfg['n_embd']),
            drop = nn.Dropout(cfg.get('dropout', 0.0)),
            h    = nn.ModuleList([Block(cfg) for _ in range(cfg['n_layer'])]),
            ln_f = nn.LayerNorm(cfg['n_embd']),
        ))
        self.lm_head = nn.Linear(cfg['n_embd'], cfg['vocab_size'], bias=False)
        self.transformer.wte.weight = self.lm_head.weight  # Weight tying

    def forward(self, idx):
        B, T = idx.size()
        pos = torch.arange(0, T, dtype=torch.long, device=idx.device)
        x = self.transformer.drop(self.transformer.wte(idx) + self.transformer.wpe(pos))
        for block in self.transformer.h:
            x = block(x)
        x = self.transformer.ln_f(x)
        logits = self.lm_head(x[:, [-1], :])
        return logits

    @torch.no_grad()
    def generate(self, idx, max_new_tokens=200, temperature=0.8, top_k=50):
        for _ in range(max_new_tokens):
            idx_crop = idx if idx.size(1) <= self.cfg['context_length'] else idx[:, -self.cfg['context_length']:]
            logits = self(idx_crop)
            logits = logits[:, -1, :] / temperature
            if top_k is not None:
                v, _ = torch.topk(logits, min(top_k, logits.size(-1)))
                logits[logits < v[:, [-1]]] = float('-inf')
            probs = F.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)
            idx = torch.cat((idx, idx_next), dim=1)
        return idx


# -----------------------------------------------------------------------------
# Main Generation Script
# -----------------------------------------------------------------------------

def generate_text(model, tokenizer, device, prompt, max_tokens=200, temperature=0.8, top_k=50):
    raw_model = model.module if hasattr(model, 'module') else model
    raw_model.eval()
    tokens = tokenizer.encode(prompt)
    idx = torch.tensor([tokens], dtype=torch.long, device=device)
    with torch.no_grad():
        out = raw_model.generate(idx, max_new_tokens=max_tokens, temperature=temperature, top_k=top_k)
    return tokenizer.decode(out[0].tolist())


def main():
    load_dotenv()
    hf_token = os.getenv("hf") or os.getenv("HF_TOKEN")
    
    repo_id = "blaze1234567/gpt2"
    filename = "hourly_ckpt_A.pt"
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Device: {device}")
    print(f"Fetching '{filename}' from Hugging Face repository '{repo_id}'...")
    
    # Download checkpoint from HF Hub
    try:
        ckpt_path = hf_hub_download(repo_id=repo_id, filename=filename, token=hf_token)
        ckpt = torch.load(ckpt_path, map_location='cpu')
    except Exception as e:
        print(f"Error downloading checkpoint: {e}")
        return

    cfg = ckpt.get('cfg', {'n_layer': 12, 'n_head': 12, 'n_embd': 768, 'context_length': 1024, 'vocab_size': 50257})
    print(f"Checkpoint loaded! Step: {ckpt.get('global_step', '?')} | Epoch: {ckpt.get('epoch', '?')}")
    
    # Initialize model and load weights
    model = GPT(cfg).to(device)
    state_dict = ckpt['model'] if isinstance(ckpt, dict) and 'model' in ckpt else ckpt
    model.load_state_dict(state_dict, strict=False)
    model.eval()
    
    tokenizer = GPT2TokenizerFast.from_pretrained('gpt2')
    
    # 1. Benchmark Prompts (Matches exact output formatting)
    default_prompts = [
        "The meaning of life is",
    ]
    
    print("\nRunning Benchmark Prompts:\n")
    for prompt in default_prompts:
        print("=" * 60)
        print(f"PROMPT: {prompt}")
        print("=" * 60)
        generated = generate_text(model, tokenizer, device, prompt, max_tokens=200, temperature=0.8, top_k=50)
        print(generated)
        print()

    # 2. Interactive Testing Loop
    print("=" * 60)
    print("Interactive Prompt Mode (type 'exit' or 'quit' to end)")
    print("=" * 60 + "\n")
    
    while True:
        try:
            prompt = input("Enter Prompt (or 'exit'): ").strip()
            if not prompt:
                continue
            if prompt.lower() in ['exit', 'quit']:
                print("Exiting. Goodbye!")
                break
            
            print("\nGenerating...")
            output = generate_text(model, tokenizer, device, prompt, max_tokens=200, temperature=0.8, top_k=50)
            print("-" * 60)
            print(output)
            print("-" * 60 + "\n")
        except KeyboardInterrupt:
            print("\nExiting. Goodbye!")
            break

if __name__ == "__main__":
    main()
