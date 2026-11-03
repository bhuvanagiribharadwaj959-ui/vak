import Link from 'next/link';

export default function ArchitectureSection() {
  return (
    <section className="feature-section section--image-right" id="architecture">
      <div className="section-grid">
        {/* Section 1 Content (Left) */}
        <div className="section-content">
          <div className="section-tag">
            <span>01</span>
            <span>/</span>
            <span>Foundational Architecture</span>
          </div>

          <h2 className="section-title">
            First-Principles Transformers, Effortlessly Engineered
          </h2>

          <p className="section-description">
            The foundation of modern machine intelligence starts with pure architectural clarity.
            By balancing multi-head self-attention mechanisms, scaled dot-product routines, and positional
            encodings, Sequence-to-Sequence models achieve effortless translation with zero friction.
          </p>

          <ul className="feature-list">
            <li className="feature-list-item">
              <span className="feature-icon">✓</span>
              <span><strong>Encoder-Decoder Pipeline:</strong> Scaled dot-product multi-head cross-attention.</span>
            </li>
            <li className="feature-list-item">
              <span className="feature-icon">✓</span>
              <span><strong>Residual Normalization:</strong> LayerNorm cascades with zero gradient vanishing.</span>
            </li>
            <li className="feature-list-item">
              <span className="feature-icon">✓</span>
              <span><strong>Indic Translation Benchmark:</strong> Sub-word BPE tokenization trained from scratch.</span>
            </li>
          </ul>

          <Link href="/#gpt124m" className="btn-section-cta">
            <span>Next: Explore GPT-124M</span>
            <span>→</span>
          </Link>
        </div>

        {/* Section 1 Visual (Right) */}
        <div className="section-visual">
          <div className="section-card-frame">
            <div className="frame-top-bar">
              <div className="window-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="frame-label">SECTION_01 // TRANSFORMER_CORE</span>
            </div>

            <div className="image-canvas image-canvas-transparent">
              <img
                src="/assets/section-1.png"
                alt="Sequence-to-Sequence Transformer Model Architecture Diagram"
                loading="lazy"
              />
              <div className="floating-chip">
                <span className="pulse-dot" />
                <span>Seq2Seq Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
