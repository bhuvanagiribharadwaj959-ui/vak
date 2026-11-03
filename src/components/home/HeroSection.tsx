'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [count, setCount] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const targetVal = 500;
            const duration = 1600;
            const startTime = performance.now();

            const updateCounter = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOutProgress = 1 - (1 - progress) * (1 - progress);
              const currentCount = Math.floor(easeOutProgress * targetVal);

              setCount(currentCount);

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                setCount(targetVal);
              }
            };

            requestAnimationFrame(updateCounter);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero-section" id="hero">
      <div className="hero-grid">
        {/* Left Hero Column: Typography & CTAs */}
        <div className="hero-content">
          {/* Top Pill Badge */}
          <div className="hero-badge">
            <span className="badge-tag">NEW</span>
            <span className="badge-text">Flat 40% off for all users</span>
          </div>

          {/* Hero Headline */}
          <h1 className="hero-headline">
            <span className="headline-light">Design basics with</span>
            <span className="headline-bold">principles and laws.</span>
          </h1>

          {/* Hero Subheading */}
          <p className="hero-subhead">
            A studio-grade showcase of foundational Transformer architectures, 124M GPT language modeling, and instruction-tuned neural intelligence.
          </p>

          {/* Hero Action Buttons */}
          <div className="hero-cta-group">
            <Link href="/chat" className="btn-visit-store" id="hero-btn-store">
              Launch AI Chat
            </Link>
            <Link href="/#architecture" className="btn-explore" id="hero-btn-explore">
              explore.
            </Link>
          </div>

          {/* Social Proof Block */}
          <div className="hero-social-proof" ref={counterRef}>
            <div className="proof-metrics">
              <span className="metric-number">{count}K</span>
              <span className="metric-label">worldwide users</span>
            </div>

            <div className="proof-avatars" aria-label="Worldwide community members">
              <div className="avatar-item" title="Community member Alex">
                <img src="/assets/avatar-1.jpg" alt="Community member portrait 1" />
              </div>
              <div className="avatar-item" title="Community member Sophia">
                <img src="/assets/avatar-2.jpg" alt="Community member portrait 2" />
              </div>
              <div className="avatar-item" title="Community member Elena">
                <img src="/assets/avatar-3.jpg" alt="Community member portrait 3" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero Column: 3D Iridescent Flower */}
        <div className="hero-visual">
          <div className="hero-visual-glow" aria-hidden="true" />
          <div className="hero-image-wrapper">
            <img
              src="/assets/hero.png"
              alt="3D iridescent ribbed flower ribbon artwork"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
