// =============================================================================
// Vak AI — Section 4: Academic Research Paper BibTeX & Clipboard Utilities
// =============================================================================

export function initPaperBibtex() {
  const copyBtn = document.getElementById("btn-copy-bibtex");
  const bibtexCodeElem = document.getElementById("bibtex-code-block");

  if (copyBtn && bibtexCodeElem) {
    copyBtn.addEventListener("click", () => {
      const codeText = bibtexCodeElem.textContent;
      navigator.clipboard.writeText(codeText).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `✓ Copied Citation!`;
        copyBtn.style.backgroundColor = "var(--paper-accent-blue)";
        copyBtn.style.color = "#FFFFFF";

        showToast("BibTeX citation copied to clipboard!");

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.backgroundColor = "";
          copyBtn.style.color = "";
        }, 2200);
      }).catch(err => {
        console.error("Clipboard copy failed:", err);
      });
    });
  }
}

export function showToast(message) {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span style="font-size: 1.1rem;">✨</span>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
