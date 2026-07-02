import os
import warnings
from dotenv import load_dotenv
import torch
from huggingface_hub import hf_hub_download
from transformers import AutoTokenizer, AutoModelForCausalLM

# Suppress some warnings from transformers for a cleaner terminal
warnings.filterwarnings("ignore")

def main():
    # Load environment variables from .env
    load_dotenv()
    
    # The token is stored as 'hf' in the .env file
    hf_token = os.getenv("hf") 
    if not hf_token:
        print("Error: Could not find 'hf' token in .env file.")
        return

    repo_id = "blaze1234567/gpt2"
    checkpoint_file = "hourly_ckpt_A.pt" # Using this checkpoint from the hub
    
    print(f"Downloading/Locating model checkpoint from '{repo_id}'...")
    print("This might take a few minutes if downloading for the first time...\n")
    
    try:
        # Load the base gpt2 tokenizer and model skeleton
        tokenizer = AutoTokenizer.from_pretrained("gpt2", token=hf_token)
        model = AutoModelForCausalLM.from_pretrained("gpt2", token=hf_token)
        
        # Download the specific checkpoint .pt file from the huggingface repo
        checkpoint_path = hf_hub_download(repo_id=repo_id, filename=checkpoint_file, token=hf_token)
        
        # Load the custom trained weights into the model
        print("Loading your trained weights into the model...")
        ckpt = torch.load(checkpoint_path, map_location="cpu")
        
        # The model weights are stored under the 'model' key in the checkpoint dictionary
        state_dict = ckpt['model'] if isinstance(ckpt, dict) and 'model' in ckpt else ckpt
        
        # Hugging Face GPT-2 uses Conv1D layers which expect transposed weights (in, out) 
        # compared to standard PyTorch nn.Linear layers (out, in).
        # We automatically transpose any 2D weights that have reversed shapes.
        # Also, we fix naming differences (ln1 -> ln_1, ln2 -> ln_2)
        hf_state_dict = model.state_dict()
        new_state_dict = {}
        for k, v in state_dict.items():
            # Remove any unwanted prefixes like '_orig_mod.' if the model was compiled
            clean_k = k.replace('_orig_mod.', '')
            
            # Map ln1 to ln_1 and ln2 to ln_2
            clean_k = clean_k.replace('.ln1.', '.ln_1.').replace('.ln2.', '.ln_2.')
            
            if clean_k in hf_state_dict:
                ckpt_shape = v.shape
                hf_shape = hf_state_dict[clean_k].shape
                if ckpt_shape != hf_shape and len(ckpt_shape) == 2 and ckpt_shape == (hf_shape[1], hf_shape[0]):
                    new_state_dict[clean_k] = v.t()
                else:
                    new_state_dict[clean_k] = v
            else:
                new_state_dict[clean_k] = v
                
        # Some training loops tie the lm_head to the word embeddings and don't save lm_head.
        # If it's missing, copy it over so the model doesn't generate pure random noise.
        if 'lm_head.weight' not in new_state_dict and 'transformer.wte.weight' in new_state_dict:
            new_state_dict['lm_head.weight'] = new_state_dict['transformer.wte.weight']
            
        model.load_state_dict(new_state_dict, strict=False)
        
        # IMPORTANT: Set model to eval mode to disable dropout
        model.eval()
        
        # Set pad token if not set to avoid warnings
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Print training info from checkpoint
        if isinstance(ckpt, dict):
            epoch = ckpt.get('epoch', '?')
            step = ckpt.get('global_step', '?')
            cfg = ckpt.get('cfg', {})
            print(f"  Checkpoint: epoch {epoch}, step {step}")
            print(f"  Architecture: {cfg.get('n_layer', '?')} layers, {cfg.get('n_head', '?')} heads, {cfg.get('n_embd', '?')} dim")
            
        print("="*50)
        print("Model loaded successfully!")
        print("Type 'quit' or 'exit' to end the conversation.")
        print("Type '/sample' to toggle between greedy and sampling mode.")
        print("="*50 + "\n")
        
        use_sampling = False  # Start with greedy for most coherent output
        
        while True:
            user_input = input("You: ")
            
            if user_input.strip().lower() in ['quit', 'exit']:
                print("Ending chat. Goodbye!")
                break
            
            if user_input.strip().lower() == '/sample':
                use_sampling = not use_sampling
                mode = "sampling (creative)" if use_sampling else "greedy (deterministic)"
                print(f"  Switched to {mode} mode.\n")
                continue
                
            if not user_input.strip():
                continue
                
            # Encode user input
            inputs = tokenizer(user_input, return_tensors="pt")
            
            # Generate response (no gradients needed for inference)
            with torch.no_grad():
                if use_sampling:
                    outputs = model.generate(
                        inputs.input_ids,
                        attention_mask=inputs.attention_mask,
                        max_new_tokens=150,
                        num_return_sequences=1,
                        pad_token_id=tokenizer.eos_token_id,
                        do_sample=True,
                        temperature=0.8,
                        top_k=40,
                        top_p=0.9,
                    )
                else:
                    # Greedy decoding — most coherent output
                    outputs = model.generate(
                        inputs.input_ids,
                        attention_mask=inputs.attention_mask,
                        max_new_tokens=150,
                        num_return_sequences=1,
                        pad_token_id=tokenizer.eos_token_id,
                        do_sample=False,
                    )
            
            # Decode the response
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # For Causal LMs (like GPT-2), the input prompt is included in the output.
            # We strip out the original input to only show the model's new generated text.
            if response.startswith(user_input):
                response = response[len(user_input):].strip()
                
            print(f"\nModel: {response}\n")
            
    except Exception as e:
        print(f"\nAn error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
