// =============================================================================
// Vak AI — Model 1: English-to-Telugu Seq2Seq Translator Demo & Attention Matrix
// =============================================================================

export const TRANSLATION_PRESETS = [
  {
    id: "preset-1",
    label: "Knowledge is power",
    english: "Knowledge is power.",
    telugu: "జ్ఞానమే మహాబలం.",
    phonetic: "Jnānamē mahābalam.",
    tokensEn: ["Knowledge", "is", "power", "."],
    tokensTe: ["జ్ఞానమే", "మహా", "బలం", "."]
  },
  {
    id: "preset-2",
    label: "AI transforms the world",
    english: "Artificial intelligence transforms the future of humanity.",
    telugu: "కృత్రిమ మేధస్సు మానవాళి భవిష్యత్తును మారుస్తుంది.",
    phonetic: "Kṛtrima mēdhassu mānavāḷi bhaviṣyattunu mārustundi.",
    tokensEn: ["Artificial", "intelligence", "transforms", "humanity", "future", "."],
    tokensTe: ["కృత్రిమ", "మేధస్సు", "మానవాళి", "భవిష్యత్తును", "మారుస్తుంది", "."]
  },
  {
    id: "preset-3",
    label: "Attention is all you need",
    english: "Attention is all you need for sequence translation.",
    telugu: "క్రమ అనువాదం కోసం ఏకాగ్రత మాత్రమే అవసరం.",
    phonetic: "Krama anuvādaṁ kōsaṁ ēkāgrata mātramē avasaraṁ.",
    tokensEn: ["Attention", "is", "all", "needed", "translation", "."],
    tokensTe: ["క్రమ", "అనువాదం", "కోసం", "ఏకాగ్రత", "అవసరం", "."]
  },
  {
    id: "preset-4",
    label: "Stars in galaxy",
    english: "In a distant galaxy, the stars shine brightly.",
    telugu: "సుదూర గెలాక్సీలో నక్షత్రాలు ప్రకాశవంతంగా మెరుస్తాయి.",
    phonetic: "Sudūra gelāksīlō nakṣatrālu prakāśavantaṅgā merustāyi.",
    tokensEn: ["In", "distant", "galaxy", "stars", "shine", "."],
    tokensTe: ["సుదూర", "గెలాక్సీలో", "నక్షత్రాలు", "మెరుస్తాయి", "."]
  }
];

export function initTranslatorDemo() {
  const inputElem = document.getElementById("translator-input");
  const outputScriptElem = document.getElementById("target-script-text");
  const outputPhoneticElem = document.getElementById("target-phonetic-text");
  const presetsContainer = document.getElementById("translator-presets");
  const matrixContainer = document.getElementById("attention-matrix-grid");

  if (!inputElem || !outputScriptElem) return;

  // Render Preset Buttons
  presetsContainer.innerHTML = "";
  TRANSLATION_PRESETS.forEach((preset, index) => {
    const btn = document.createElement("button");
    btn.className = `btn-preset ${index === 0 ? "active" : ""}`;
    btn.textContent = preset.label;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".btn-preset").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadPreset(preset);
    });
    presetsContainer.appendChild(btn);
  });

  // Load Initial Preset
  loadPreset(TRANSLATION_PRESETS[0]);

  // Realtime Input Handler
  inputElem.addEventListener("input", () => {
    const val = inputElem.value.trim().toLowerCase();
    const matched = TRANSLATION_PRESETS.find(p => p.english.toLowerCase().includes(val) || val.includes(p.english.toLowerCase().slice(0, 8)));
    
    if (matched) {
      outputScriptElem.textContent = matched.telugu;
      outputPhoneticElem.textContent = matched.phonetic;
      renderAttentionMatrix(matched.tokensEn, matched.tokensTe);
    } else if (val.length === 0) {
      outputScriptElem.textContent = "—";
      outputPhoneticElem.textContent = "Enter English text above to simulate decoding...";
      if (matrixContainer) matrixContainer.innerHTML = "";
    } else {
      // Dynamic simulated translation for custom input
      simulateCustomTranslation(val);
    }
  });

  function loadPreset(preset) {
    inputElem.value = preset.english;
    outputScriptElem.textContent = preset.telugu;
    outputPhoneticElem.textContent = preset.phonetic;
    renderAttentionMatrix(preset.tokensEn, preset.tokensTe);
  }

  function simulateCustomTranslation(text) {
    // Generate pseudo Telugu translation using vocabulary heuristics
    outputScriptElem.innerHTML = `<span style="opacity: 0.85;">అనువాదం రూపొందుతోంది...</span>`;
    outputPhoneticElem.textContent = "Transliterating and beam decoding tokens...";
    
    setTimeout(() => {
      const words = text.split(/\s+/).filter(Boolean);
      const teluguTokens = words.map(w => {
        if (w.length <= 3) return "మరియు";
        if (w.length <= 5) return "జ్ఞానం";
        return "భవిష్యత్తు";
      });
      const generated = teluguTokens.join(" ") + " సాధించబడుతుంది.";
      outputScriptElem.textContent = generated;
      outputPhoneticElem.textContent = "Beam decoded with top-1 beam probability: 0.942";
      renderAttentionMatrix(words.slice(0, 6), teluguTokens.slice(0, 6));
    }, 280);
  }

  function renderAttentionMatrix(tokensEn, tokensTe) {
    if (!matrixContainer) return;
    matrixContainer.innerHTML = "";
    
    const rows = tokensTe.length;
    const cols = tokensEn.length;
    matrixContainer.style.gridTemplateColumns = `repeat(${cols}, 38px)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // High attention on diagonal and semantic alignments
        let weight = (r === c) ? 0.85 : Math.max(0.08, 0.95 - Math.abs(r - c) * 0.35 + (Math.sin(r * c) * 0.1));
        weight = Math.min(0.98, Math.max(0.04, weight));

        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        cell.style.backgroundColor = `rgba(139, 92, 246, ${weight.toFixed(2)})`;
        cell.title = `Enc Token: "${tokensEn[c]}" → Dec Token: "${tokensTe[r]}" (Weight: ${(weight * 100).toFixed(0)}%)`;
        cell.textContent = Math.round(weight * 9);
        matrixContainer.appendChild(cell);
      }
    }
  }

  // Interactive Architecture Hotspot Inspector
  document.querySelectorAll(".arch-tag-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".arch-tag-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const targetStep = pill.getAttribute("data-target-step");
      if (targetStep) {
        const stepElem = document.getElementById(targetStep);
        if (stepElem) {
          stepElem.scrollIntoView({ behavior: "smooth", block: "center" });
          stepElem.style.borderColor = "var(--accent-cyan)";
          stepElem.style.boxShadow = "var(--shadow-glow-cyan)";
          setTimeout(() => {
            stepElem.style.borderColor = "";
            stepElem.style.boxShadow = "";
          }, 1800);
        }
      }
    });
  });
}
