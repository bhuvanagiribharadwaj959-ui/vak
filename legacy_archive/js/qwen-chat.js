// =============================================================================
// Vak AI — Model 3: Flagship Qwen 2.5 (3B) Chat Simulator & Streaming Engine
// Persona 1: Vak Gen-Z Unbothered (from test_qwen_chat.py)
// Persona 2: Base Qwen 2.5 3B Instruct
// =============================================================================

let activePersona = "genz"; // 'genz' or 'base'
let isStreaming = false;

const KNOWLEDGE_BASE = {
  genz: {
    "explain flash attention like i'm 15": 
      "aight listen up 😭 regular attention keeps writing everything to slow GPU memory (HBM) like a boomer writing paper checks. Flash Attention is basically doing all the matrix math directly inside SRAM fast cache without ever bouncing back and forth. No cap, it’s 3x-5x faster and cuts memory from O(N²) to O(N). Straight up genius engineering fr fr 🗿🔥",
    "roast my coding habits": 
      "bro commits directly to main at 3 AM with message 'pls work final final v2' 💀 zero unit tests, 47 console.logs left in production, and thinks closing the laptop fixes memory leaks. you’re cooked fr fr, but we move 💅😮‍💨",
    "why does greedy decoding loop?": 
      "greedy decoding is just picking argmax(P(w)) every single step with zero randomness. so once the model lands on a high-probability bigram loop like 'the capital of France is the capital of...', it gets trapped in an inescapable mathematical attractor. lowkey skill issue, that's why top-k sampling is goated 🤝",
    "tell me about vak ai labs": 
      "Vak AI is built different no cap. We literally trained a Seq2Seq English-Telugu transformer from scratch, pre-trained a 124M GPT model for 100+ hours matching OpenAI's loss within 1.8%, and now we’re fine-tuning Qwen 2.5 3B with LoRA. Pure engineering, no fluff 🫡🔥"
  },
  base: {
    "explain flash attention like i'm 15": 
      "FlashAttention (Dao et al., 2022) is an IO-aware exact attention algorithm. Standard attention computes S = QK^T and P = softmax(S) by materializing intermediate N x N matrices in high-bandwidth memory (HBM). FlashAttention utilizes tiling to split Q, K, V blocks into fast SRAM cache and recomputes softmax incrementally via online normalization, drastically reducing memory bandwidth bottlenecks.",
    "roast my coding habits": 
      "Analysis indicates several potential software antipatterns: lacking CI/CD pipelines, omitting regression test suites, manual branch management without semantic versioning, and deploying unprofiled memory allocations to production environments.",
    "why does greedy decoding loop?": 
      "Greedy decoding selects the deterministic token with maximal conditional probability at each timestep: y_t = argmax P(y_t | y_<t). Small language models suffer from probability mass concentration on frequent repetitive n-grams, leading to cyclical local maxima loops. Temperature sampling and Top-P (nucleus) sampling introduce stochasticity to circumvent these basins of attraction.",
    "tell me about vak ai labs": 
      "Vak AI Labs is an independent AI systems research initiative. Core artifacts include a Seq2Seq Transformer for Indic languages built from first principles, an autoregressive 124M parameter language model pretrained over 100+ hours evaluated across WikiText, OpenWebText, HellaSwag, and LAMBADA, and an instruction-tuned Qwen 2.5 3B parameter model."
  }
};

export function initQwenChat() {
  const messagesArea = document.getElementById("chat-messages");
  const inputField = document.getElementById("chat-input");
  const sendBtn = document.getElementById("btn-chat-send");
  const suggestionsContainer = document.getElementById("chat-suggestions");
  
  const personaGenzBtn = document.getElementById("btn-persona-genz");
  const personaBaseBtn = document.getElementById("btn-persona-base");

  if (!messagesArea || !inputField || !sendBtn) return;

  // Persona Switches
  if (personaGenzBtn && personaBaseBtn) {
    personaGenzBtn.addEventListener("click", () => {
      activePersona = "genz";
      personaGenzBtn.classList.add("active");
      personaBaseBtn.classList.remove("active", "base-mode");
      updateTelemetryPersona("Vak Gen-Z Adapter (LoRA)");
      appendSystemNotice("Switched persona to: Vak Gen-Z Unbothered (Chill, slang, authentic emojis) 💅");
    });

    personaBaseBtn.addEventListener("click", () => {
      activePersona = "base";
      personaBaseBtn.classList.add("active", "base-mode");
      personaGenzBtn.classList.remove("active");
      updateTelemetryPersona("Qwen 2.5 3B Base (Instruct)");
      appendSystemNotice("Switched persona to: Base Qwen 2.5 3B (Analytical & Formal)");
    });
  }

  // Quick Prompt Suggestions
  const suggestions = [
    "explain flash attention like i'm 15",
    "why does greedy decoding loop?",
    "roast my coding habits",
    "tell me about vak ai labs"
  ];

  if (suggestionsContainer) {
    suggestionsContainer.innerHTML = "";
    suggestions.forEach(text => {
      const btn = document.createElement("button");
      btn.className = "btn-suggest-chip";
      btn.textContent = text;
      btn.addEventListener("click", () => {
        inputField.value = text;
        handleSend();
      });
      suggestionsContainer.appendChild(btn);
    });
  }

  // Send Event Handlers
  sendBtn.addEventListener("click", handleSend);
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  function handleSend() {
    const text = inputField.value.trim();
    if (!text || isStreaming) return;

    inputField.value = "";
    appendMessage("user", text);

    // AI Response Generation
    isStreaming = true;
    sendBtn.disabled = true;

    setTimeout(() => {
      generateAiResponse(text);
    }, 250);
  }

  function appendMessage(role, content) {
    const row = document.createElement("div");
    row.className = `chat-bubble-row ${role === "user" ? "user-row" : "ai-row"}`;

    const avatar = document.createElement("div");
    avatar.className = `avatar-badge ${role === "user" ? "user-avatar" : "ai-avatar"}`;
    avatar.textContent = role === "user" ? "🧑" : (activePersona === "genz" ? "🔥" : "🤖");

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = content;

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesArea.appendChild(row);
    messagesArea.scrollTop = messagesArea.scrollHeight;
    return bubble;
  }

  function appendSystemNotice(text) {
    const row = document.createElement("div");
    row.style.textAlign = "center";
    row.style.fontSize = "0.76rem";
    row.style.fontFamily = "var(--font-mono)";
    row.style.color = "var(--text-muted)";
    row.style.padding = "4px 0";
    row.textContent = text;
    messagesArea.appendChild(row);
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }

  function generateAiResponse(userPrompt) {
    const lower = userPrompt.toLowerCase().trim();
    let reply = "";

    // Search knowledge base
    const currentKB = KNOWLEDGE_BASE[activePersona];
    for (const [key, val] of Object.entries(currentKB)) {
      if (lower.includes(key) || key.includes(lower)) {
        reply = val;
        break;
      }
    }

    if (!reply) {
      if (activePersona === "genz") {
        reply = `bro asked "${userPrompt}" 💀 lowkey that's deep. from a neural scaling perspective, we're currently fine-tuning our LoRA weights on 200k UltraChat samples so my response buffer is locked in. no cap, check the architecture tab above to see the math 🫡💅`;
      } else {
        reply = `Regarding "${userPrompt}": In the context of autoregressive language modeling, token generation depends on the parameterization of the causal attention layers and vocabulary projection. Vak AI's fine-tuning pipeline optimizes cross-entropy loss over conversational dialogues to maximize instruction compliance.`;
      }
    }

    // Stream characters
    const bubble = appendMessage("ai", "");
    bubble.classList.add("streaming-cursor");
    let charIndex = 0;

    const interval = setInterval(() => {
      bubble.textContent = reply.slice(0, charIndex + 1);
      charIndex++;
      messagesArea.scrollTop = messagesArea.scrollHeight;

      if (charIndex >= reply.length) {
        clearInterval(interval);
        bubble.classList.remove("streaming-cursor");
        isStreaming = false;
        sendBtn.disabled = false;
      }
    }, 18);
  }

  function updateTelemetryPersona(label) {
    const el = document.getElementById("telemetry-active-model");
    if (el) el.textContent = label;
  }
}
