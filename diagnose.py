"""Diagnose exactly what's happening with checkpoint weight loading."""
import os, torch
from dotenv import load_dotenv
from huggingface_hub import hf_hub_download
from transformers import AutoModelForCausalLM

load_dotenv()
hf_token = os.getenv("hf")

# Load checkpoint
ckpt_path = hf_hub_download(repo_id="blaze1234567/gpt2", filename="hourly_ckpt_A.pt", token=hf_token)
ckpt = torch.load(ckpt_path, map_location="cpu")
ckpt_state = ckpt["model"]

# Load HF model
hf_model = AutoModelForCausalLM.from_pretrained("gpt2")
hf_state = hf_model.state_dict()

print("=" * 60)
print("CHECKPOINT KEYS (your trained model):")
print("=" * 60)
for k, v in sorted(ckpt_state.items()):
    print(f"  {k:55s} {str(v.shape):20s} {v.dtype}")

print("\n" + "=" * 60)
print("HF GPT-2 KEYS (target model):")
print("=" * 60)
for k, v in sorted(hf_state.items()):
    print(f"  {k:55s} {str(v.shape):20s} {v.dtype}")

# Now try the mapping
print("\n" + "=" * 60)
print("MAPPING ANALYSIS:")
print("=" * 60)

mapped = 0
skipped = 0
missing = 0

for k, v in sorted(ckpt_state.items()):
    clean_k = k.replace('_orig_mod.', '').replace('.ln1.', '.ln_1.').replace('.ln2.', '.ln_2.')
    if clean_k in hf_state:
        if v.shape == hf_state[clean_k].shape:
            print(f"  OK      {k} -> {clean_k}")
            mapped += 1
        elif len(v.shape) == 2 and v.shape == (hf_state[clean_k].shape[1], hf_state[clean_k].shape[0]):
            print(f"  TRANSP  {k} {v.shape} -> {clean_k} {hf_state[clean_k].shape}")
            mapped += 1
        else:
            print(f"  MISMATCH {k} {v.shape} vs {clean_k} {hf_state[clean_k].shape}")
            skipped += 1
    else:
        print(f"  SKIP    {k} (no match in HF)")
        skipped += 1

for k in sorted(hf_state.keys()):
    found = False
    for ck in ckpt_state.keys():
        clean_ck = ck.replace('_orig_mod.', '').replace('.ln1.', '.ln_1.').replace('.ln2.', '.ln_2.')
        if clean_ck == k:
            found = True
            break
    if not found:
        if k == 'lm_head.weight':
            print(f"  TIED    {k} (will copy from wte)")
        else:
            print(f"  MISSING {k} (NOT in checkpoint!)")
            missing += 1

print(f"\nSummary: mapped={mapped}, skipped={skipped}, missing_from_ckpt={missing}")
print(f"Total HF keys: {len(hf_state)}, Total ckpt keys: {len(ckpt_state)}")

# Also check the config saved in checkpoint
if 'cfg' in ckpt:
    print(f"\nCheckpoint config: {ckpt['cfg']}")
