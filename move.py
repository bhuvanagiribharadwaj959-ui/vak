import os
from huggingface_hub import HfApi, CommitOperationCopy, CommitOperationDelete

api = HfApi(token=os.environ.get("HF_TOKEN", "YOUR_HF_TOKEN")) # Make sure your token is passed correctly

repo_id = "blaze1234567/gpt2"
files_to_move = [
    "config.json",
    "generation_config.json",
    "model.safetensors",
    "mythology_checkpoint.pt",
    "tokenizer.json",
    "tokenizer_config.json"
]

# Build a list of copy and delete operations for each file
operations = []
for file_name in files_to_move:
    # 1. Copy file from subfolder to the root
    operations.append(
        CommitOperationCopy(
            src_path_in_repo=f"gpt2-mythology/{file_name}",
            path_in_repo=file_name
        )
    )
    # 2. Delete the original file inside the subfolder
    operations.append(
        CommitOperationDelete(
            path_in_repo=f"gpt2-mythology/{file_name}"
        )
    )

# Push all the move operations in one single commit
print("Moving files on the Hugging Face server...")
api.create_commit(
    repo_id=repo_id,
    operations=operations,
    commit_message="Move files out of gpt2-mythology folder to the root",
    repo_type="model"
)

print("All files moved to the root folder successfully!")