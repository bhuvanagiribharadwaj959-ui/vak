// =============================================================================
// Vak AI — Model 2: GPT-2 124M Qualitative Comparator & Benchmark Controller
// Faithfully driven by eval_results.json
// =============================================================================

import { EVAL_DATA } from './eval-data.js';

let activePromptIndex = 0;
let activeDecodingMode = "sampling_t08_topk50"; // Default to interesting sampling mode

export function initGptComparator() {
  const promptChipsContainer = document.getElementById("gpt-prompt-chips");
  const activePromptTextElem = document.getElementById("active-prompt-text");
  const customTerminalBody = document.getElementById("custom-terminal-body");
  const openaiTerminalBody = document.getElementById("openai-terminal-body");
  const customFooterInfo = document.getElementById("custom-terminal-footer");
  const openaiFooterInfo = document.getElementById("openai-terminal-footer");
  
  const modeToggleSampling = document.getElementById("btn-mode-sampling");
  const modeToggleGreedy = document.getElementById("btn-mode-greedy");

  if (!promptChipsContainer || !customTerminalBody) return;

  // Render Prompt Chips
  promptChipsContainer.innerHTML = "";
  EVAL_DATA.qualitative.forEach((item, index) => {
    const chip = document.createElement("button");
    chip.className = `prompt-chip ${index === activePromptIndex ? "active" : ""}`;
    chip.innerHTML = `<span class="chip-cat">${item.category}</span> "${item.prompt.slice(0, 24)}..."`;
    chip.addEventListener("click", () => {
      activePromptIndex = index;
      document.querySelectorAll(".prompt-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      renderActiveGeneration();
    });
    promptChipsContainer.appendChild(chip);
  });

  // Decoding Mode Toggles
  if (modeToggleSampling && modeToggleGreedy) {
    modeToggleSampling.addEventListener("click", () => {
      activeDecodingMode = "sampling_t08_topk50";
      modeToggleSampling.classList.add("active");
      modeToggleGreedy.classList.remove("active");
      renderActiveGeneration();
    });

    modeToggleGreedy.addEventListener("click", () => {
      activeDecodingMode = "greedy";
      modeToggleGreedy.classList.add("active");
      modeToggleSampling.classList.remove("active");
      renderActiveGeneration();
    });
  }

  // Initial Render
  renderActiveGeneration();
  animateBenchmarkBars();

  function renderActiveGeneration() {
    const currentItem = EVAL_DATA.qualitative[activePromptIndex];
    if (!currentItem) return;

    if (activePromptTextElem) {
      activePromptTextElem.textContent = currentItem.prompt;
    }

    const customText = currentItem.generations.custom[activeDecodingMode];
    const openaiText = currentItem.generations.openai[activeDecodingMode];

    // Smooth update with fade
    customTerminalBody.style.opacity = "0.4";
    openaiTerminalBody.style.opacity = "0.4";

    setTimeout(() => {
      customTerminalBody.textContent = customText;
      openaiTerminalBody.textContent = openaiText;

      const customWordCount = customText.trim().split(/\s+/).length;
      const openaiWordCount = openaiText.trim().split(/\s+/).length;

      const isRepetitive = (text) => {
        const sentences = text.split(/[.\n]+/).map(s => s.trim()).filter(Boolean);
        const unique = new Set(sentences);
        return sentences.length > 3 && unique.size < sentences.length * 0.6;
      };

      const customRep = isRepetitive(customText);
      const openaiRep = isRepetitive(openaiText);

      if (customFooterInfo) {
        customFooterInfo.innerHTML = `
          <span>Tokens: ~${Math.round(customWordCount * 1.3)}</span>
          <span>${customRep ? "⚠️ Looping (ArgMax attractor)" : "✓ Variational diversity"}</span>
        `;
      }

      if (openaiFooterInfo) {
        openaiFooterInfo.innerHTML = `
          <span>Tokens: ~${Math.round(openaiWordCount * 1.3)}</span>
          <span>${openaiRep ? "⚠️ Looping (ArgMax attractor)" : "✓ Baseline exploration"}</span>
        `;
      }

      customTerminalBody.style.opacity = "1";
      openaiTerminalBody.style.opacity = "1";
    }, 120);
  }

  function animateBenchmarkBars() {
    // Fill animated bars based on eval_results.json
    const bars = [
      { id: "bar-owt-custom", width: "94.6%" },
      { id: "bar-owt-openai", width: "100%" },
      { id: "bar-hella-custom", width: "98.5%" },
      { id: "bar-hella-openai", width: "100%" },
      { id: "bar-lambada-custom", width: "63.1%" },
      { id: "bar-lambada-openai", width: "100%" }
    ];

    setTimeout(() => {
      bars.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) el.style.width = item.width;
      });
    }, 300);
  }
}
