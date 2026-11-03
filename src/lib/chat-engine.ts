export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelId?: string;
  latency?: string;
  tokenCount?: number;
}

const TRANSLATION_MAP: Record<string, { telugu: string; phonetic: string; tokens: string[] }> = {
  "knowledge is supreme power": {
    telugu: "జ్ఞానమే అత్యున్నత మహాశక్తి.",
    phonetic: "Jnānamē atyunnata mahāśakti.",
    tokens: ["జ్ఞానమే", "అత్యున్నత", "మహాశక్తి"],
  },
  "knowledge is power": {
    telugu: "జ్ఞానమే మహాబలం.",
    phonetic: "Jnānamē mahābalam.",
    tokens: ["జ్ఞానమే", "మహా", "బలం"],
  },
  "artificial intelligence is changing the future of humanity": {
    telugu: "కృత్రిమ మేధస్సు మానవాళి భవిష్యత్తును మారుస్తోంది.",
    phonetic: "Kṛtrima mēdhassu mānavāḷi bhaviṣyattunu mārustōndi.",
    tokens: ["కృత్రిమ", "మేధస్సు", "మానవాళి", "భవిష్యత్తును", "మారుస్తోంది"],
  },
  "welcome to our studio, how are you doing today?": {
    telugu: "మా స్టూడియోకి స్వాగతం, ఈరోజు మీరు ఎలా ఉన్నారు?",
    phonetic: "Mā sṭūḍiyōki svāgataṁ, īrōju mīru elā unnāru?",
    tokens: ["మా", "స్టూడియోకి", "స్వాగతం", "ఈరోజు", "మీరు", "ఎలా", "ఉన్నారు?"],
  },
  "attention is all you need for sequence translation": {
    telugu: "క్రమ అనువాదం కోసం ఏకాగ్రత (Attention) మాత్రమే అవసరం.",
    phonetic: "Krama anuvādaṁ kōsaṁ ēkāgrata mātramē avasaraṁ.",
    tokens: ["క్రమ", "అనువాదం", "కోసం", "ఏకాగ్రత", "అవసరం"],
  },
};

export async function generateSimulatedResponse(
  userPrompt: string,
  modelId: string
): Promise<{ text: string; latency: string; tokenCount: number }> {
  const cleanPrompt = userPrompt.trim().toLowerCase().replace(/^translate:\s*/i, '');

  if (modelId === 'translator') {
    const matched = Object.entries(TRANSLATION_MAP).find(([key]) =>
      cleanPrompt.includes(key) || key.includes(cleanPrompt)
    );

    if (matched) {
      const data = matched[1];
      return {
        text: `**Target Translation (Telugu):**\n### ${data.telugu}\n\n**Phonetic Transliteration:**\n*${data.phonetic}*\n\n**Sub-word BPE Tokens:**\n\`${data.tokens.join(' • ')}\`\n\n*Encoded via 6-layer Bidirectional Transformer Encoder & Autoregressive Decoder with Cross-Attention.*`,
        latency: '18ms',
        tokenCount: 42,
      };
    }

    return {
      text: `**Target Translation (Telugu):**\n### ఈ వాక్యం విజయవంతంగా అనువదించబడింది.\n\n**Phonetic Transliteration:**\n*Ī vākyaṁ vijayavantangā anuvadiñcabaḍindi.*\n\n**Indic BPE Breakdown:**\n\`ఈ • వాక్యం • విజయవంతంగా • అనువదించబడింది\`\n\n*Confidence Score: 0.968 • BLEU Benchmark: 34.2*`,
      latency: '22ms',
      tokenCount: 38,
    };
  }

  if (modelId === 'gpt124m') {
    if (cleanPrompt.includes('flash attention') || cleanPrompt.includes('pytorch') || cleanPrompt.includes('attention')) {
      return {
        text: `Here is the canonical PyTorch implementation of Causal Self-Attention matching our 124M checkpoint:\n\n\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F

class CausalSelfAttention(nn.Module):
    def __init__(self, d_model=768, n_head=12, block_size=1024):
        super().__init__()
        assert d_model % n_head == 0
        self.c_attn = nn.Linear(d_model, 3 * d_model)
        self.c_proj = nn.Linear(d_model, d_model)
        self.n_head = n_head
        self.d_model = d_model
        
    def forward(self, x):
        B, T, C = x.size() # Batch, Time, Channels
        q, k, v = self.c_attn(x).split(self.d_model, dim=2)
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        
        # Flash Attention 2 accelerated kernel
        y = F.scaled_dot_product_attention(q, k, v, is_causal=True)
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        return self.c_proj(y)
\`\`\`\n\n**Telemetry:**\n- Parameters: 124,439,808 dense weights\n- Context Window: 1024 tokens with learned positional embeddings\n- Pretraining Loss: 1.42 cross-entropy`,
        latency: '26ms',
        tokenCount: 164,
      };
    }

    return {
      text: `**GPT-124M Pretrained Autoregressive Analysis:**\n\nFrom an architectural perspective, language modeling operates as next-token categorical distribution estimation:\n\n$$P(x_1, x_2, ..., x_T) = \\prod_{t=1}^T P(x_t \\mid x_{<t})$$\n\nOur custom 124M model uses **Pre-LayerNorm cascades**, **GELU non-linearities**, and **Cosine Learning Rate Annealing** across 100+ GPU hours on canonical benchmark datasets.\n\nWould you like to inspect the perplexity curves, layer-wise attention entropy, or generation sampling hyperparameters?`,
      latency: '28ms',
      tokenCount: 92,
    };
  }

  // qwen_chill (Default)
  if (cleanPrompt.includes('roast') || cleanPrompt.includes('commit') || cleanPrompt.includes('habits')) {
    return {
      text: `Let me guess: you pushed straight to main at 3:14 AM with the commit message \`"fix bug final v2 for real this time"\`, your test suite was bypassed with \`--no-verify\`, and you went to sleep pretending CI would just figure it out.\n\nTake a deep breath. Revert the hasty commit, write one clean unit test, hydrate, and stay chill. Code written under panic always creates tomorrow's tech debt.`,
      latency: '34ms',
      tokenCount: 78,
    };
  }

  if (cleanPrompt.includes('flash attention')) {
    return {
      text: `Imagine you're solving a 1,000-piece puzzle. Instead of carrying every single piece back and forth between the kitchen table and the storage closet (High Bandwidth Memory to SRAM), Flash Attention brings a few pieces right next to you, solves that cluster on the fly, and only writes back the final result.\n\n**The takeaway:** Zero memory IO bottlenecks, quadratic memory becomes linear in practice, and you save GPU watts while staying completely unbothered.`,
      latency: '32ms',
      tokenCount: 88,
    };
  }

  return {
    text: `System architecture is all about keeping things clean and unbothered.\n\nRegarding **"${userPrompt}"**: the key is decoupling state transitions from presentation, keeping deterministic data pipelines, and avoiding unnecessary abstractions until performance metrics demand them.\n\nEverything is stable and running smoothly. What part of the system would you like to build next?`,
    latency: '35ms',
    tokenCount: 65,
  };
}
