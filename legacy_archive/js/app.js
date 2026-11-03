// =============================================================================
// Vak AI Neural Suite — Master Application Orchestrator
// =============================================================================

import { initTranslatorDemo } from './translator-demo.js';
import { initGptComparator } from './gpt-comparator.js';
import { initQwenChat } from './qwen-chat.js';
import { initPaperBibtex, showToast } from './paper-bibtex.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initializing Vak AI Neural Systems Suite...");

  // 1. Initialize Subsystem Controllers
  try {
    initTranslatorDemo();
    initGptComparator();
    initQwenChat();
    initPaperBibtex();
  } catch (err) {
    console.error("Error during component initialization:", err);
  }

  // 2. Sticky Glassmorphic Navbar & Active Scrollspy
  const nav = document.querySelector(".studio-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("section[id]");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }

    // Scrollspy
    let currentId = "";
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentId}`) {
        link.classList.add("active");
      }
    });
  });

  // 3. Animated Hero Statistics Counters
  animateCounter("stat-hours", 100, "+");
  animateCounter("stat-params", 124, "M");
  animateCounter("stat-loss", 3.079, "");

  function animateCounter(id, target, suffix = "") {
    const el = document.getElementById(id);
    if (!el) return;

    let start = 0;
    const duration = 1600;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      if (target % 1 !== 0) {
        // Float target
        const current = (easeProgress * target).toFixed(3);
        el.innerHTML = `${current}<span class="stat-unit">${suffix}</span>`;
      } else {
        const current = Math.floor(easeProgress * target);
        el.innerHTML = `${current}<span class="stat-unit">${suffix}</span>`;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // 4. Smooth Anchor Link Scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElem = document.querySelector(targetId);
      if (targetElem) {
        e.preventDefault();
        targetElem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // 5. Welcome Toast Notification
  setTimeout(() => {
    showToast("Vak Neural Suite Loaded • 3 Foundational Models Online");
  }, 1200);
});
