import os
import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from tqdm import tqdm
from transformers import GPT2TokenizerFast
from datasets import load_dataset
from test_own_gpt import GPT

def load_base_model(ckpt_path, device):
    print(f"Loading base model checkpoint from '{ckpt_path}'...")
    ckpt = torch.load(ckpt_path, map_location='cpu')
    cfg = ckpt.get('cfg', {'n_layer': 12, 'n_head': 12, 'n_embd': 768, 'context_length': 1024, 'vocab_size': 50257})
    model = GPT(cfg).to(device)
    state_dict = ckpt['model'] if isinstance(ckpt, dict) and 'model' in ckpt else ckpt
    model.load_state_dict(state_dict, strict=False)
    return model, cfg

def get_sequence_logits(model, input_ids):
    B, T = input_ids.size()
    pos = torch.arange(0, T, dtype=torch.long, device=input_ids.device)
    x = model.transformer.drop(model.transformer.wte(input_ids) + model.transformer.wpe(pos))
    for block in model.transformer.h:
        x = block(x)
    x = model.transformer.ln_f(x)
    logits = model.lm_head(x)
    return logits

def format_chat_messages(messages):
    """
    Formats chat messages into standard User / Assistant text.
    """
    text = ""
    for msg in messages:
        role = "User" if msg['role'] == 'user' else "Assistant"
        content = msg['content'].strip()
        text += f"{role}: {content}\n"
    return text

def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Running Chat Fine-Tuning (SFT) on device: {device}")

    ckpt_path = "model/hourly_ckpt_A.pt"
    if not os.path.exists(ckpt_path):
        print(f"Error: {ckpt_path} not found!")
        return

    tokenizer = GPT2TokenizerFast.from_pretrained('gpt2')
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model, cfg = load_base_model(ckpt_path, device)

    print("\nLoading chat dataset 'HuggingFaceH4/ultrachat_200k'...")
    dataset = load_dataset("HuggingFaceH4/ultrachat_200k", split="train_sft[:5000]")

    formatted_chats = []
    for item in dataset:
        formatted_str = format_chat_messages(item['messages'])
        if formatted_str.strip():
            formatted_chats.append(formatted_str)

    print(f"Prepared {len(formatted_chats)} multi-turn chat dialogues.")

    # Fine-tuning parameters
    learning_rate = 2e-5  # Low learning rate for fine-tuning
    batch_size = 2       # Small batch size to preserve RAM
    grad_accum = 4
    epochs = 1

    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=0.01)

    print(f"\nStarting Supervised Fine-Tuning for {epochs} epoch(s)...")
    model.train()

    global_step = 0
    total_items = len(formatted_chats)

    for epoch in range(epochs):
        running_loss = 0.0
        pbar = tqdm(range(0, total_items, batch_size), desc=f"Epoch {epoch+1}/{epochs}")

        for i in pbar:
            batch_texts = formatted_chats[i : i + batch_size]
            
            encodings = tokenizer(
                batch_texts,
                padding=True,
                truncation=True,
                max_length=1024,
                return_tensors="pt"
            )

            input_ids = encodings['input_ids'].to(device)
            if input_ids.size(1) < 2:
                continue

            inputs = input_ids[:, :-1].contiguous()
            targets = input_ids[:, 1:].contiguous()

            logits = get_sequence_logits(model, inputs)
            
            # Mask out padding token loss
            loss_fn = nn.CrossEntropyLoss(ignore_index=tokenizer.pad_token_id)
            loss = loss_fn(logits.view(-1, logits.size(-1)), targets.view(-1))
            
            loss_scaled = loss / grad_accum
            loss_scaled.backward()

            running_loss += loss.item()

            if (i // batch_size + 1) % grad_accum == 0:
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
                optimizer.zero_grad()
                global_step += 1
                avg_loss = running_loss / grad_accum
                pbar.set_postfix({"loss": f"{avg_loss:.4f}", "step": global_step})
                running_loss = 0.0

    save_path = "model/gpt2_chat_sft.pt"
    os.makedirs("model", exist_ok=True)
    torch.save({
        'model': model.state_dict(),
        'cfg': cfg,
        'global_step': global_step
    }, save_path)

    print(f"\nChat Fine-Tuned Model successfully saved to '{save_path}'!")

if __name__ == "__main__":
    main()
