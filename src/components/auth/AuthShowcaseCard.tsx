interface AuthShowcaseCardProps {
  type: 'login' | 'signup';
}

export default function AuthShowcaseCard({ type }: AuthShowcaseCardProps) {
  return (
    <div className="auth-showcase-card">
      <div className="frame-top-bar" style={{ width: '100%' }}>
        <div className="window-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="frame-label">
          {type === 'login' ? 'CHILL_GUY // AUTHENTICATED_SESSION' : 'CHILL_GUY // REGISTRATION_PERKS'}
        </span>
      </div>

      {/* 3D Neural Showcase Video */}
      <div className="auth-showcase-visual">
        <video
          src="/assets/gemini_generated_video_5695651d.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="auth-showcase-video"
        />
      </div>

      {type === 'login' ? (
        <p className="auth-quote">
          &ldquo;Master effortless aesthetics with an unbothered mindset. Craft software that speaks for itself.&rdquo;
        </p>
      ) : (
        <>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
            Everything you need to craft excellence
          </h3>
          <div className="signup-perks">
            <div className="perk-item">
              <span className="perk-icon">✓</span>
              <span>Full PyTorch & SafeTensors 124M GPT Checkpoints</span>
            </div>
            <div className="perk-item">
              <span className="perk-icon">✓</span>
              <span>120+ Curated Design Tokens & Figma Architecture Kits</span>
            </div>
            <div className="perk-item">
              <span className="perk-icon">✓</span>
              <span>Flagship Qwen 3.9B Instruction-Tuned Persona Access</span>
            </div>
          </div>
        </>
      )}

      {/* Community Avatars Pill */}
      <div className="auth-community-pill" style={type === 'signup' ? { marginTop: 14 } : undefined}>
        <div className="proof-avatars">
          <div className="avatar-item" style={{ width: 36, height: 36 }}>
            <img src="/assets/avatar-1.jpg" alt="User 1" />
          </div>
          <div className="avatar-item" style={{ width: 36, height: 36 }}>
            <img src="/assets/avatar-2.jpg" alt="User 2" />
          </div>
          <div className="avatar-item" style={{ width: 36, height: 36 }}>
            <img src="/assets/avatar-3.jpg" alt="User 3" />
          </div>
        </div>
        <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {type === 'login' ? (
            <>Joined by <strong>500K+</strong> creators worldwide</>
          ) : (
            <>Rated <strong>4.9/5</strong> by 500K+ creators</>
          )}
        </span>
      </div>
    </div>
  );
}
