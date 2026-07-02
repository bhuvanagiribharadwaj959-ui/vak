import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN || "YOUR_HF_TOKEN");

async function main() {
  try {
    const res = await hf.textGeneration({
      model: "blaze1234567/gpt2",
      inputs: "Hello, my name is",
      parameters: { max_new_tokens: 10 }
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
