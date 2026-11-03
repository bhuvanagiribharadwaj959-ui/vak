/**
 * CHILL GUY — Modern Interactive UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
      const isOpen = navMenu.classList.contains('mobile-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside or link
    document.querySelectorAll('.nav-item-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }

  // 3. Count up animation for 500K Worldwide Users
  const counterEl = document.querySelector('.metric-number');
  if (counterEl) {
    let hasAnimated = false;
    const targetVal = 500;

    const animateCount = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const duration = 1600;
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quad
        const easeOutProgress = 1 - (1 - progress) * (1 - progress);
        const currentCount = Math.floor(easeOutProgress * targetVal);

        counterEl.textContent = `${currentCount}K`;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counterEl.textContent = `${targetVal}K`;
        }
      };

      requestAnimationFrame(updateCounter);
    };

    // Intersection observer for counter
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount();
        }
      });
    }, { threshold: 0.5 });

    observer.observe(counterEl);
  }

  // 4. Modals (Register & Visit Store)
  const registerModal = document.getElementById('modal-register');
  const storeModal = document.getElementById('modal-store');

  const openModal = (modal) => {
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeModal = (modal) => {
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  // Triggers
  document.querySelectorAll('[data-open-modal="register"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(registerModal);
    });
  });

  document.querySelectorAll('[data-open-modal="store"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(storeModal);
    });
  });

  // Close buttons & overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.modal-close')) {
        closeModal(overlay);
      }
    });
  });

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(registerModal);
      closeModal(storeModal);
    }
  });

  // Form submit handles
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Welcome to Chill Guy! ✓';
        submitBtn.style.background = '#10b981';
        submitBtn.style.color = '#ffffff';
        setTimeout(() => {
          closeModal(registerModal);
          submitBtn.textContent = 'Complete Registration';
          submitBtn.style.background = '';
          submitBtn.style.color = '';
          registerForm.reset();
        }, 1200);
      }
    });
  }

  // 5. Interactive 3D tilt effect on image cards
  const cards = document.querySelectorAll('.section-card-frame');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // 6. Subtle mouse parallax on hero flower
  const heroVisual = document.querySelector('.hero-image-wrapper');
  if (heroVisual) {
    window.addEventListener('mousemove', (e) => {
      const moveX = (e.clientX - window.innerWidth / 2) * 0.015;
      const moveY = (e.clientY - window.innerHeight / 2) * 0.015;
      heroVisual.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  }

  // 7. Newsletter form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      if (btn) {
        btn.textContent = 'Subscribed ✓';
        btn.style.background = '#10b981';
        setTimeout(() => {
          btn.textContent = 'Join';
          btn.style.background = '';
          newsletterForm.reset();
        }, 2000);
      }
    });
  }
});
