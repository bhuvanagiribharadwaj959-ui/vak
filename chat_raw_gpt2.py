"""
chat_raw_gpt2.py  –  Chat with the vanilla, pretrained GPT-2 (no fine-tuning).
Use this to see baseline performance before fine-tuning.
"""

import warnings
warnings.filterwarnings("ignore")

import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

BANNER = """
╔══════════════════════════════════════════════════╗
║          🧠  RAW GPT-2 (124M) Chat  🧠          ║
╠══════════════════════════════════════════════════╣
║  This is the PRETRAINED GPT-2 with NO fine-tune ║
║  Commands:                                       ║
║    /sample   – toggle greedy ↔ sampling mode     ║
║    /temp 0.9 – set temperature (sampling only)   ║
║    /tokens N – set max new tokens (default 150)  ║
║    quit      – exit                              ║
╚══════════════════════════════════════════════════╝
"""

def main():
    print("\n⏳ Loading raw pretrained GPT-2 (124M)...")
    
    tokenizer = AutoTokenizer.from_pretrained("gpt2")
    model = AutoModelForCausalLM.from_pretrained("gpt2")
    model.eval()

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    print(f"✅ Model loaded — {total_params / 1e6:.1f}M parameters")
    print(BANNER)

    # Defaults
    use_sampling = False
    temperature = 0.8
    max_new_tokens = 150

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
            print(f"  ↪ Switched to {mode} mode.\n")
            continue

        if stripped.startswith("/temp"):
            try:
                temperature = float(stripped.split()[1])
                print(f"  ↪ Temperature set to {temperature}\n")
            except (IndexError, ValueError):
                print("  ↪ Usage: /temp 0.9\n")
            continue

        if stripped.startswith("/tokens"):
            try:
                max_new_tokens = int(stripped.split()[1])
                print(f"  ↪ Max new tokens set to {max_new_tokens}\n")
            except (IndexError, ValueError):
                print("  ↪ Usage: /tokens 200\n")
            continue

        if not user_input.strip():
            continue

        # Tokenize
        inputs = tokenizer(user_input, return_tensors="pt")

        # Generate
        with torch.no_grad():
            gen_kwargs = dict(
                input_ids=inputs.input_ids,
                attention_mask=inputs.attention_mask,
                max_new_tokens=max_new_tokens,
                num_return_sequences=1,
                pad_token_id=tokenizer.eos_token_id,
            )
            if use_sampling:
                gen_kwargs.update(
                    do_sample=True,
                    temperature=temperature,
                    top_k=40,
                    top_p=0.9,
                )
            else:
                gen_kwargs["do_sample"] = False

            outputs = model.generate(**gen_kwargs)

        # Decode — strip the prompt portion
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if response.startswith(user_input):
            response = response[len(user_input):].strip()

        print(f"\nGPT-2 (raw): {response}\n")


if __name__ == "__main__":
    main()
