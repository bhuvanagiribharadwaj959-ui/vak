"""
mythology-test.py -- Chat with the fine-tuned GPT-2 Mythology model.
Fetches the model from: https://huggingface.co/blaze1234567/gpt2
"""

import os
import warnings
warnings.filterwarnings("ignore")

import torch
from dotenv import load_dotenv
from huggingface_hub import hf_hub_download
from transformers import GPT2LMHeadModel, GPT2Tokenizer

BANNER = """
============================================================
     GPT-2 Mythology Story Generator
     Fine-tuned on Ramayana, Mahabharata & World Folklore
============================================================
  Commands:
    /sample    -- toggle greedy / sampling mode
    /temp 0.9  -- set temperature (sampling only)
    /tokens N  -- set max new tokens (default 200)
    /rep 1.3   -- set repetition penalty
    /story     -- generate with a random myth prompt
    quit       -- exit
============================================================
"""

SAMPLE_PROMPTS = [
    "Once there lived a king named Dasharatha who",
    "In the great battle of Kurukshetra, Arjuna",
    "The sage Vyasa sat beneath the ancient tree and",
    "Long ago, in a kingdom beyond the mountains,",
    "The demon king Ravana looked upon the golden city of Lanka and",
    "When the gods churned the ocean of milk,",
    "The princess was cursed by a powerful rishi to",
    "In the forest of Dandaka, the exiled prince",
]


def load_mythology_model(hf_token):
    """Download and load the fine-tuned mythology model from HuggingFace."""
    repo_id = "blaze1234567/gpt2"

    # Authenticate FIRST for faster download rates
    from huggingface_hub import login
    try:
        login(token=hf_token, add_to_git_credential=False)
        print("[OK] Authenticated with HuggingFace Hub")
    except Exception:
        pass

    print("[..] Loading base GPT-2 tokenizer (from cache)...")
    tokenizer = GPT2Tokenizer.from_pretrained("gpt2", token=hf_token)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Strategy: Load base GPT-2 from local cache (fast), then download
    # ONLY the .pt checkpoint weights and apply them.
    # This avoids downloading the huge model.safetensors file.
    print("[..] Loading base GPT-2 model (from cache)...")
    model = GPT2LMHeadModel.from_pretrained("gpt2", token=hf_token)

    # Try downloading the mythology checkpoint (.pt file with just the weights)
    ckpt_files = [
        "gpt2-mythology/mythology_checkpoint.pt",
        "mythology_checkpoint.pt",
        "gpt2-mythology.pt",
        "hourly_ckpt_A.pt",
    ]

    for ckpt_name in ckpt_files:
        try:
            print(f"[..] Downloading checkpoint: {ckpt_name}...")
            ckpt_path = hf_hub_download(
                repo_id=repo_id,
                filename=ckpt_name,
                token=hf_token,
            )
            print("     Downloaded. Loading weights...")
            ckpt = torch.load(ckpt_path, map_location="cpu", weights_only=False)

            state_dict = ckpt.get("model", ckpt) if isinstance(ckpt, dict) else ckpt

            # Fix key naming and Conv1D transpose issues
            hf_sd = model.state_dict()
            new_sd = {}
            for k, v in state_dict.items():
                ck = k.replace("_orig_mod.", "").replace(".ln1.", ".ln_1.").replace(".ln2.", ".ln_2.")
                if ck in hf_sd:
                    if v.shape != hf_sd[ck].shape and len(v.shape) == 2 and v.shape == (hf_sd[ck].shape[1], hf_sd[ck].shape[0]):
                        new_sd[ck] = v.t()
                    else:
                        new_sd[ck] = v
                else:
                    new_sd[ck] = v

            if "lm_head.weight" not in new_sd and "transformer.wte.weight" in new_sd:
                new_sd["lm_head.weight"] = new_sd["transformer.wte.weight"]

            model.load_state_dict(new_sd, strict=False)
            model.eval()

            if isinstance(ckpt, dict):
                epoch = ckpt.get("epoch", "?")
                step = ckpt.get("global_step", "?")
                loss = ckpt.get("best_val_loss", ckpt.get("val_loss", "?"))
                print(f"     Checkpoint: epoch {epoch}, step {step}, val_loss {loss}")

            print(f"[OK] Loaded mythology weights from: {ckpt_name}")
            return model, tokenizer
        except Exception as e:
            print(f"     {ckpt_name} skipped: {e}")
            continue

    # Last resort: try loading the full save_pretrained model from subfolder
    try:
        print("[..] Fallback: downloading full HF model (this may take a while)...")
        model = GPT2LMHeadModel.from_pretrained(
            repo_id,
            subfolder="gpt2-mythology",
            token=hf_token,
        )
        model.eval()
        print("[OK] Loaded as HuggingFace model (save_pretrained format)")
        return model, tokenizer
    except Exception:
        pass

    raise RuntimeError(
        "Could not find mythology model in the HF repo.\n"
        "Please run mythology-finetuning.ipynb first to train and upload the model."
    )


def generate(model, tokenizer, prompt, max_new_tokens=200, do_sample=True,
             temperature=0.8, top_k=50, top_p=0.9, repetition_penalty=1.3):
    """Generate text from a prompt."""
    inputs = tokenizer(prompt, return_tensors="pt")
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            attention_mask=inputs.attention_mask,
            max_new_tokens=max_new_tokens,
            do_sample=do_sample,
            temperature=temperature if do_sample else 1.0,
            top_k=top_k if do_sample else 0,
            top_p=top_p if do_sample else 1.0,
            repetition_penalty=repetition_penalty,
            no_repeat_ngram_size=3,
            pad_token_id=tokenizer.eos_token_id,
        )
    text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    if text.startswith(prompt):
        text = text[len(prompt):]
    return text.strip()


def main():
    load_dotenv()
    hf_token = os.getenv("hf")
    if not hf_token:
        print("[ERROR] No 'hf' token found in .env file.")
        return

    model, tokenizer = load_mythology_model(hf_token)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"Model: {total_params / 1e6:.1f}M parameters")
    print(BANNER)

    # Settings
    use_sampling = True
    temperature = 0.8
    max_new_tokens = 200
    rep_penalty = 1.3

    import random

    while True:
        try:
            user_input = input("You: ")
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        stripped = user_input.strip().lower()

        if stripped in ("quit", "exit"):
            print("Goodbye!")
            break
        if stripped == "/sample":
            use_sampling = not use_sampling
            mode = "sampling (creative)" if use_sampling else "greedy (deterministic)"
            print(f"  -> Switched to {mode}\n")
            continue
        if stripped.startswith("/temp"):
            try:
                temperature = float(stripped.split()[1])
                print(f"  -> Temperature = {temperature}\n")
            except (IndexError, ValueError):
                print("  -> Usage: /temp 0.9\n")
            continue
        if stripped.startswith("/tokens"):
            try:
                max_new_tokens = int(stripped.split()[1])
                print(f"  -> Max tokens = {max_new_tokens}\n")
            except (IndexError, ValueError):
                print("  -> Usage: /tokens 200\n")
            continue
        if stripped.startswith("/rep"):
            try:
                rep_penalty = float(stripped.split()[1])
                print(f"  -> Repetition penalty = {rep_penalty}\n")
            except (IndexError, ValueError):
                print("  -> Usage: /rep 1.3\n")
            continue
        if stripped == "/story":
            prompt = random.choice(SAMPLE_PROMPTS)
            print(f"  Prompt: \"{prompt}\"\n")
            response = generate(model, tokenizer, prompt, max_new_tokens,
                                use_sampling, temperature, repetition_penalty=rep_penalty)
            print(f"Story:\n{prompt}{response}\n")
            continue
        if not user_input.strip():
            continue

        response = generate(model, tokenizer, user_input, max_new_tokens,
                            use_sampling, temperature, repetition_penalty=rep_penalty)
        print(f"\nMythology GPT-2: {response}\n")


if __name__ == "__main__":
    main()
