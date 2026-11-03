'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Calculate password strength
  let strengthScore = 0;
  if (password.length >= 6) strengthScore++;
  if (password.length >= 10) strengthScore++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strengthScore++;
  if (/[^A-Za-z0-9]/.test(password)) strengthScore++;

  const strengthColors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const strengthLabels = ['Too weak', 'Moderate', 'Strong', 'Rock Solid ✓'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        localStorage.setItem('user_name', name.trim());
      } catch {
        // Ignore
      }
    }
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        router.push('/chat');
      }, 800);
    }, 900);
  };

  return (
    <div className="auth-card">
      <div className="auth-badge">
        <span>●</span>
        <span>EXCLUSIVE ACCESS • 40% OFF ACTIVE</span>
      </div>

      <h1 className="auth-title">
        <span className="headline-light">Create your account,</span>
        <span className="headline-bold">stay completely chill.</span>
      </h1>

      <p className="auth-subtitle">
        Join over 500,000 creators, developers, and studios worldwide using the Chill Guy neural suite.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Full Name Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">
            Full Name
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="signup-name"
              className="form-input"
              placeholder="e.g. Satoshi Nakamoto"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">
            Email Address
          </label>
          <div className="input-wrapper">
            <input
              type="email"
              id="signup-email"
              className="form-input"
              placeholder="name@domain.com"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Password Input + Interactive Strength Meter */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="signup-password">
              Password
            </label>
            <span
              className="strength-label"
              style={{
                color:
                  password.length === 0
                    ? 'var(--text-muted)'
                    : strengthColors[strengthScore - 1] || '#ef4444',
              }}
            >
              {password.length === 0
                ? 'Enter 8+ characters'
                : strengthLabels[strengthScore - 1] || 'Too weak'}
            </span>
          </div>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="signup-password"
              className="form-input"
              placeholder="••••••••••••"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn-toggle-pwd"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Password Strength Visual Bar */}
          <div className="strength-meter">
            <div className="strength-bars">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="strength-bar"
                  style={{
                    backgroundColor:
                      idx < strengthScore
                        ? strengthColors[strengthScore - 1]
                        : 'rgba(255, 255, 255, 0.08)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Terms & Conditions Checkbox */}
        <label className="form-checkbox-row">
          <input type="checkbox" className="custom-checkbox" required defaultChecked />
          <span>
            I agree to the <span className="form-link">Terms of Service</span> and{' '}
            <span className="form-link">Privacy Policy</span>
          </span>
        </label>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-auth-submit"
          id="btn-signup-submit"
          disabled={status !== 'idle'}
          style={
            status === 'success'
              ? { background: '#10b981', color: '#ffffff' }
              : undefined
          }
        >
          {status === 'loading'
            ? 'Creating Account...'
            : status === 'success'
            ? 'Account Created! Redirecting... ✓'
            : 'Create Free Account (Save 40%)'}
        </button>

        {/* Divider */}
        <div className="auth-divider">or sign up with</div>

        {/* Social Signup Grid */}
        <div className="social-auth-grid">
          <button
            type="button"
            className="btn-social"
            onClick={() => router.push('/chat')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            className="btn-social"
            onClick={() => router.push('/chat')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>

          <button
            type="button"
            className="btn-social"
            onClick={() => router.push('/chat')}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.76 1.04-1.82.93-2.88-.9.04-1.99.6-2.64 1.36-.57.66-.99 1.74-.86 2.77 1 .08 2.03-.54 2.57-1.25z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Switch Link */}
        <p className="auth-switch-text">
          Already registered?{' '}
          <Link href="/login">Log in to your account →</Link>
        </p>
      </form>
    </div>
  );
}
