import Link from 'next/link';

export default function GptSection() {
  return (
    <section className="feature-section section--image-left" id="gpt124m">
      <div className="section-grid">
        {/* Section 2 Visual (Left) */}
        <div className="section-visual">
          <div className="section-card-frame">
            <div className="frame-top-bar">
              <div className="window-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="frame-label">SECTION_02 // AUTOREGRESSIVE_GPT</span>
            </div>

            <div className="image-canvas image-canvas-diagram">
              <img
                src="/assets/section-2.png"
                alt="Autoregressive Generative Pre-trained Transformer Block architecture"
                loading="lazy"
              />
              <div className="floating-chip">
                <span className="pulse-dot" />
                <span>124M Parameters Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 Content (Right) */}
        <div className="section-content">
          <div className="section-tag tag-purple">
            <span>02</span>
            <span>/</span>
            <span>Autoregressive Systems</span>
          </div>

          <h2 className="section-title">
            Systematic Precision: 124M GPT Pretrained Architecture
          </h2>

          <p className="section-description">
            A sustainable intelligence suite is built on unshakeable rules. Featuring causal masked
            multi-head self-attention, GELU non-linear activations, and deep residual pathways pretrained
            over 100+ GPU hours to match canonical OpenAI benchmarks.
          </p>

          {/* Metric Highlights Grid */}
          <div className="section-stats-grid">
            <div className="stat-card">
              <div className="stat-val">100+</div>
              <div className="stat-desc">GPU Hours Pretrained</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">124M</div>
              <div className="stat-desc">Dense Transformer Weights</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">1.42</div>
              <div className="stat-desc">Final Cross-Entropy Loss</div>
            </div>
          </div>

          <Link href="/#qwen" className="btn-section-cta">
            <span>Next: Flagship Qwen 3.9B</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
