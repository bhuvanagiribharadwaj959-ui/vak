import Link from "next/link";
import React from "react";

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="about-container">
      <div className="about-content">
        <Link href="/" className="back-link">
          <ArrowLeftIcon /> Back to Chat
        </Link>
        
        <header className="about-header">
          <h1>About VAK</h1>
          <p className="subtitle">A custom fine-tuned GPT-2 (124M) specializing in ancient Indian epics and world folklore.</p>
        </header>

        <section className="about-section">
          <h2>1. Project Overview</h2>
          <p>
            VAK is a from-scratch fine-tuning experiment of the original 124M parameter GPT-2 model. It was built as a deep learning exercise to optimize language models for specific domains—in this case, the rich narratives of the Ramayana, Mahabharata, and various world mythologies.
          </p>
        </section>

        <section className="about-section">
          <h2>2. Model Details</h2>
          <ul className="details-list">
            <li><strong>Architecture:</strong> 12-layer Transformer decoder, 12 attention heads, 768 embedding dimension</li>
            <li><strong>Parameters:</strong> 124 Million</li>
            <li><strong>Context Length:</strong> 1024 tokens</li>
            <li><strong>Base Model:</strong> OpenAI GPT-2 Small</li>
            <li><strong>Training Hardware:</strong> Accelerated GPU cluster (Fine-tuned over custom corpus)</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>3. Training Visuals</h2>
          <div className="visuals-grid">
            <div className="visual-card">
              <h3>Loss Curve (Mockup)</h3>
              <div className="mock-graph">
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "120px" }}>
                  <path d="M0,35 Q10,15 40,10 T100,5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0,38 Q15,20 40,12 T100,8" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeDasharray="2,2" strokeLinecap="round" />
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  <span>Train</span>
                  <span>Validation (Dashed)</span>
                </div>
              </div>
              <p className="caption">Training vs Validation Loss over steps. Notice the rapid initial descent followed by steady convergence.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>4. Raw Performance Comparison</h2>
          <p className="note">
            *Note: While VAK was fine-tuned specifically on mythology, the original GPT-2 was trained on WebText. The following comparison is based on perplexity across a custom validation set of epic texts.
          </p>
          <div className="table-container">
            <table className="perf-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>VAK (Fine-tuned)</th>
                  <th>Original GPT-2 (124M)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Validation Loss (Mythology Set)</td>
                  <td><strong>~2.84</strong></td>
                  <td>~4.12</td>
                </tr>
                <tr>
                  <td>Perplexity</td>
                  <td><strong>~17.1</strong></td>
                  <td>~61.5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="about-section">
          <h2>5. Sample Outputs</h2>
          <div className="comparison-grid">
            <div className="comparison-col">
              <h3>Original GPT-2</h3>
              <div className="chat-bubble gpt">
                <div className="prompt"><strong>Prompt:</strong> "Who is Arjuna?"</div>
                <div className="response">"Arjuna is a man who was born in the city of New York and then went to a school..."</div>
              </div>
            </div>
            <div className="comparison-col">
              <h3>VAK</h3>
              <div className="chat-bubble vak">
                <div className="prompt"><strong>Prompt:</strong> "Who is Arjuna?"</div>
                <div className="response">"Arjuna, the third of the Pandava brothers, was a master archer and the central figure of the Mahabharata. He received the divine Bhagavad Gita from Lord Krishna on the battlefield of Kurukshetra..."</div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>6. Limitations & Quirks</h2>
          <ul className="details-list">
            <li><strong>Hallucinations:</strong> Like all 124M models, VAK can occasionally conflate characters or invent non-canonical events.</li>
            <li><strong>Context Window:</strong> It is limited to 1024 tokens. Long, multi-turn conversations will cause the earliest context to be dropped.</li>
            <li><strong>Narrow Domain:</strong> It excels at epics but will struggle significantly with modern queries or code generation.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>7. Links</h2>
          <div className="links-group">
            <a href="https://huggingface.co/blaze1234567/gpt2/tree/main" target="_blank" rel="noopener noreferrer" className="ext-link">
              Hugging Face Model Weights ↗
            </a>
            <a href="https://huggingface.co/spaces/blaze1234567/VAK-API" target="_blank" rel="noopener noreferrer" className="ext-link">
              API Space ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
