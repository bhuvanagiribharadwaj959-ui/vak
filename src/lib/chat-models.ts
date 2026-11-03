export interface ModelSuggestion {
  title: string;
  prompt: string;
}

export interface ModelConfig {
  id: 'translator' | 'gpt124m' | 'qwen_chill';
  name: string;
  badge: string;
  desc: string;
  color: string;
  latency: string;
  type: string;
  defaultGreeting: string;
  suggestions: ModelSuggestion[];
}

export const MODELS: Record<string, ModelConfig> = {
  qwen_chill: {
    id: 'qwen_chill',
    name: 'Chill Guy Qwen 2.5',
    badge: '3B Instruct LoRA',
    desc: 'Unbothered, analytical persona fine-tuned for high-performance code architecture',
    color: '#10b981',
    latency: '34ms',
    type: 'icon-emerald',
    defaultGreeting: 'Chill Guy Qwen 2.5 neural persona. Unbothered, relaxed, and focused on clear system architecture and analytical problem solving. Ask questions or request a code review.',
    suggestions: [
      { title: 'Commit Review', prompt: 'Roast my 3 AM commit habits and git messages.' },
      { title: 'Flash Attention', prompt: 'Explain Flash Attention like I am 15.' },
      { title: 'Decoding Loops', prompt: 'Why does greedy decoding loop into repetitive nonsense?' },
      { title: 'Production Stability', prompt: 'Give me some unbothered advice for debugging production crashes.' },
    ],
  },
  translator: {
    id: 'translator',
    name: 'English to Telugu Translator',
    badge: 'Seq2Seq Indic Transformer',
    desc: 'BPE tokenized encoder-decoder for Indic sequence translation',
    color: '#38bdf8',
    latency: '18ms',
    type: 'icon-cyan',
    defaultGreeting: 'English-to-Telugu neural translation engine with byte-pair encoding and phonetic transliteration. Enter any English sentence, phrase, or passage to generate accurate Telugu script and syllable breakdown.',
    suggestions: [
      { title: 'Universal Truth', prompt: 'Translate: Knowledge is supreme power.' },
      { title: 'Modern Technology', prompt: 'Translate: Artificial intelligence is changing the future of humanity.' },
      { title: 'Studio Welcome', prompt: 'Translate: Welcome to our studio, how are you doing today?' },
      { title: 'Research Paper', prompt: 'Translate: Attention is all you need for sequence translation.' },
    ],
  },
  gpt124m: {
    id: 'gpt124m',
    name: 'GPT-124M Parameters',
    badge: 'Autoregressive LLM',
    desc: '100+ GPU hours pretrained causal transformer matching OpenAI benchmarks',
    color: '#a855f7',
    latency: '26ms',
    type: 'icon-purple',
    defaultGreeting: '124M parameter autoregressive causal transformer trained from scratch. Ask for PyTorch implementations, mathematical causal attention formulations, decoding strategies, or pretraining telemetry.',
    suggestions: [
      { title: 'Attention Math', prompt: 'Explain causal masked multi-head self-attention with mathematical formulas.' },
      { title: 'PyTorch Implementation', prompt: 'Write a PyTorch SDPA causal attention block with flash attention.' },
      { title: 'Decoding Strategies', prompt: 'Compare greedy decoding vs top-k and nucleus (top-p) sampling.' },
      { title: 'Pretraining Telemetry', prompt: 'What was your pretraining loss curve and validation perplexity across 100+ GPU hours?' },
    ],
  },
};
