import Link from 'next/link';

export default function QwenSection() {
  return (
    <section className="feature-section section--image-right" id="qwen">
      <div className="section-grid">
        {/* Section 3 Content (Left) */}
        <div className="section-content">
          <div className="section-tag tag-rose">
            <span>03</span>
            <span>/</span>
            <span>Next-Gen Flagship</span>
          </div>

          <h2 className="section-title">
            Flagship Qwen 3.9B Neural Experience
          </h2>

          <p className="section-description">
            Elevate routine tasks into visceral intelligence. Adapted with custom persona alignments and
            fine-tuned for deep semantic comprehension, multi-turn reasoning, and sub-100ms inference
            latency. Stay calm while deploying production-grade language models.
          </p>

          <ul className="feature-list">
            <li className="feature-list-item">
              <span className="feature-icon">✓</span>
              <span><strong>Native Context Depth:</strong> Long-range associative memory & instruction following.</span>
            </li>
            <li className="feature-list-item">
              <span className="feature-icon">✓</span>
              <span><strong>Persona Adaptation:</strong> Custom system prompt steering and deterministic outputs.</span>
            </li>
            <li className="feature-list-item">
              <span className="feature-icon">✓</span>
              <span><strong>Hardware Accelerated:</strong> Quantized 4-bit and 8-bit deployment on consumer silicon.</span>
            </li>
          </ul>

          <Link href="/chat" className="btn-section-cta">
            <span>Chat with Chill Guy Qwen</span>
            <span>→</span>
          </Link>
        </div>

        {/* Section 3 Visual (Right) */}
        <div className="section-visual">
          <div className="section-card-frame">
            <div className="frame-top-bar">
              <div className="window-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="frame-label">SECTION_03 // QWEN_FLAGSHIP</span>
            </div>

            <div className="image-canvas">
              <img
                src="/assets/section-3.png"
                alt="Qwen 3.9B Flagship neural network interface banner"
                loading="lazy"
              />
              <div className="floating-chip">
                <span className="pulse-dot" />
                <span>Inference Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
