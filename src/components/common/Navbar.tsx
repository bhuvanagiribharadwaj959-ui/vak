'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="app-container nav-inner">
        {/* Brand Logo: .chillguy */}
        <Link href="/" className="brand-link" id="brand-logo" aria-label="Chill Guy Home">
          <span className="brand-dot">.</span>
          <span className="brand-text">chillguy</span>
        </Link>

        {/* Clean Modern Navigation Links */}
        <nav aria-label="Primary Navigation">
          <ul className={`nav-menu ${mobileOpen ? 'mobile-open' : ''}`}>
            <li>
              <Link 
                href="/" 
                className={`nav-item-link ${pathname === '/' ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/chat" 
                className={`nav-item-link ${pathname === '/chat' ? 'active' : ''}`}
                style={{ color: '#38bdf8', fontWeight: 700 }}
                onClick={() => setMobileOpen(false)}
              >
                Studio AI
              </Link>
            </li>
            <li>
              <Link 
                href="/#architecture" 
                className="nav-item-link"
                onClick={() => setMobileOpen(false)}
              >
                Architecture
              </Link>
            </li>
            <li>
              <Link 
                href="/#gpt124m" 
                className="nav-item-link"
                onClick={() => setMobileOpen(false)}
              >
                GPT-124M
              </Link>
            </li>
            <li>
              <Link 
                href="/#qwen" 
                className="nav-item-link"
                onClick={() => setMobileOpen(false)}
              >
                Qwen 3.9B
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right Action Buttons: Log In & Sign Up */}
        <div className="nav-actions">
          <Link href="/login" className="nav-link-login" id="btn-nav-login">
            Log In
          </Link>
          <Link href="/signup" className="btn-register" id="btn-nav-signup">
            Sign Up
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-toggle"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
