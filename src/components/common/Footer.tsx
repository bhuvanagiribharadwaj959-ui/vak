'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer">
      <div className="app-container">
        <div className="footer-top">
          {/* Col 1: Brand Info */}
          <div className="footer-brand">
            <Link href="/" className="brand-link" aria-label="Chill Guy Home">
              <span className="brand-dot">.</span>
              <span className="brand-text">chillguy</span>
            </Link>
            <p className="footer-desc">
              Studio-grade aesthetics, effortless compositions, and systematic design principles for modern digital experiences.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h3 className="footer-col-title">Navigation</h3>
            <ul className="footer-links">
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/chat" className="footer-link" style={{ color: '#38bdf8', fontWeight: 600 }}>Studio AI</Link></li>
              <li><Link href="/#architecture" className="footer-link">Architecture</Link></li>
              <li><Link href="/#gpt124m" className="footer-link">GPT-124M</Link></li>
              <li><Link href="/#qwen" className="footer-link">Qwen 3.9B</Link></li>
            </ul>
          </div>

          {/* Col 3: Resources & Account */}
          <div>
            <h3 className="footer-col-title">Account & Portal</h3>
            <ul className="footer-links">
              <li><Link href="/login" className="footer-link">Log In</Link></li>
              <li><Link href="/signup" className="footer-link">Create Account</Link></li>
              <li><Link href="/signup" className="footer-link">Pretrained Weights</Link></li>
              <li><Link href="/#architecture" className="footer-link">Model Documentation</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h3 className="footer-col-title">Stay Inspired</h3>
            <p className="footer-desc" style={{ marginBottom: 14 }}>
              Receive curated design principles, model checkpoints, and releases straight to your inbox.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="you@domain.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                />
                <button type="submit" className="btn-newsletter-submit">
                  {subscribed ? 'Joined ✓' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Chill Guy Studio. All rights reserved. Crafted with principles and laws.</p>
          <div className="social-links">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X / Twitter">𝕏</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">GitHub</a>
            <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Dribbble">Dribbble</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Discord">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
