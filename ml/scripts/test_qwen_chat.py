"""
Vak AI Interactive Chat & Testing Script
Supports:
1. Running base Qwen2.5-3B-Instruct
2. Running fine-tuned Vak Gen-Z LoRA Adapter (if present)
3. Real-time token streaming in your terminal
"""

import os
import sys
import torch
from threading import Thread
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TextIteratorStreamer
)

MODEL_ID = "Qwen/Qwen2.5-3B-Instruct"
ADAPTER_PATH = "vak_qwen3b_genz_adapter"

GENZ_SYSTEM_PROMPT = (
    "You are Vak, a super chill, unbothered Gen-Z AI assistant. "
    "You keep things 100% real, speak with effortless modern slang (no cap, lowkey, highkey, fr fr, cooked, locked in, bet, vibe check), "
    "and use authentic Gen-Z emojis (💀, 😭, 🗿, 🫡, 🔥, 💅, 😮‍💨, 🧢, 🤝). "
    "You are secretly a genius who always gives accurate, sharp, high-IQ answers without sounding like a boring textbook."
)

def main():
    print("=" * 65)
    print("🔥 VAK AI (Qwen 2.5 3B - Chill Gen-Z & Real Emojis)")
    print("=" * 65)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"⚙️ Running on: [{device}]")

    print(f"📦 Loading tokenizer from {MODEL_ID}...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True, padding_side="left")
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    print(f"📦 Loading base model {MODEL_ID}...")
    if device == "cuda":
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float16,
            device_map="auto",
            trust_remote_code=True
        )
    else:
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype=torch.float32,
            low_cpu_mem_usage=True,
            trust_remote_code=True
        ).to("cpu")

    # Check for fine-tuned LoRA adapter
    if os.path.exists(ADAPTER_PATH):
        try:
            from peft import PeftModel
            print(f"🎨 Found fine-tuned adapter at '{ADAPTER_PATH}'! Attaching...")
            model = PeftModel.from_pretrained(model, ADAPTER_PATH)
            print("✅ Fine-tuned Vak Gen-Z adapter loaded successfully! 💅")
        except Exception as e:
            print(f"⚠️ Could not load adapter: {e}. Falling back to base model.")
    else:
        print(f"ℹ️ No local adapter found at '{ADAPTER_PATH}'. Running base Qwen 2.5 with Gen-Z system prompt.")

    model.eval()
    print("\n✅ Ready! Type your prompt below. Type 'exit' or 'quit' to stop.\n")

    history = [{"role": "system", "content": GENZ_SYSTEM_PROMPT}]

    while True:
        try:
            user_input = input("🧑 YOU > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit"]:
                print("👋 Peace out! Stay unbothered 🗿")
                break

            history.append({"role": "user", "content": user_input})

            prompt_text = tokenizer.apply_chat_template(
                history,
                tokenize=False,
                add_generation_prompt=True
            )

            inputs = tokenizer(prompt_text, return_tensors="pt").to(device)
            streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)

            gen_kwargs = dict(
                **inputs,
                streamer=streamer,
                max_new_tokens=300,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id
            )

            thread = Thread(target=model.generate, kwargs=gen_kwargs)
            thread.start()

            print("\n🤖 VAK > ", end="", flush=True)
            full_reply = ""
            for token in streamer:
                print(token, end="", flush=True)
                full_reply += token
            print("\n" + "-" * 50)

            history.append({"role": "assistant", "content": full_reply})

            # Keep conversation window compact
            if len(history) > 9:
                history = [history[0]] + history[-8:]

        except KeyboardInterrupt:
            print("\n👋 Exiting...")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
