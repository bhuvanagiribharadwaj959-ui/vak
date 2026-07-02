"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

/* ── types ── */
type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

type PipelineStep = {
  key: string;
  label: string;
  icon: string;
  colorClass: string;
  data?: any;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
};

/* ── BPE-style tokeniser ── */
function pseudoTokenize(text: string): string[] {
  const tokens: string[] = [];
  const words = text.split(/(\s+)/);
  for (const w of words) {
    if (/^\s+$/.test(w)) {
      tokens.push("Ġ");
      continue;
    }
    if (w.length > 4) {
      const mid = Math.ceil(w.length * 0.6);
      tokens.push(w.slice(0, mid));
      tokens.push("##" + w.slice(mid));
    } else {
      tokens.push(w);
    }
  }
  return tokens;
}

/* ── fake embedding vectors ── */
function fakeEmbeddings(count: number): number[] {
  const dims: number[] = [];
  for (let i = 0; i < Math.min(count * 3, 24); i++) {
    dims.push(parseFloat((Math.random() * 2 - 1).toFixed(3)));
  }
  return dims;
}

/* ── fake positional encodings ── */
function fakePositionalEncodings(count: number): string[] {
  const enc: string[] = [];
  for (let i = 0; i < Math.min(count, 4); i++) {
    enc.push(`pos_${i}: [${Math.sin(i / 10000).toFixed(3)}, ${Math.cos(i / 10000).toFixed(3)}]`);
  }
  return enc;
}

/* ── fake attention weights ── */
function fakeAttention(tokens: string[]): string[] {
  if (tokens.length === 0) return [];
  const lastToken = tokens[tokens.length - 1];
  const weights: string[] = [];
  let remaining = 1.0;
  for (let i = 0; i < Math.min(tokens.length - 1, 3); i++) {
    const w = parseFloat((Math.random() * remaining * 0.6).toFixed(3));
    remaining -= w;
    weights.push(`${lastToken} → ${tokens[i]}: ${w.toFixed(3)}`);
  }
  weights.push(`${lastToken} → ${lastToken}: ${remaining.toFixed(3)}`);
  return weights;
}

/* ── fake FFN activations ── */
function fakeFFN(): number[] {
  const acts: number[] = [];
  for (let i = 0; i < 10; i++) {
    const val = Math.random() > 0.3 ? (Math.random() * 5).toFixed(2) : "0.00";
    acts.push(parseFloat(val));
  }
  return acts;
}

/* ── fake logits ── */
function fakeLogits(): {token: string, prob: string}[] {
  return [
    { token: "Hanuman", prob: "14.2%" },
    { token: "Rama", prob: "11.5%" },
    { token: "epic", prob: "8.3%" },
    { token: "the", prob: "5.1%" },
  ];
}

/* ── Direct client-side HF call (fallback if server DNS fails) ── */
async function callHFDirect(
  message: string,
  history: Message[],
  token: string
): Promise<string> {
  let prompt =
    "The following is a conversation with an AI assistant deeply knowledgeable about Indian mythology, " +
    "the Ramayana, the Mahabharata, and world folklore.\n\n";

  if (history.length > 0) {
    const recent = history.slice(-4);
    for (const m of recent) {
      prompt += m.role === "user" ? `Human: ${m.content}\n` : `AI: ${m.content}\n`;
    }
  }
  prompt += `Human: ${message}\nAI:`;

  const res = await fetch(
    "https://blaze1234567-vak-api.hf.space/generate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.85,
          top_p: 0.92,
          repetition_penalty: 1.3,
          return_full_text: false,
          do_sample: true,
        },
        options: { wait_for_model: true },
      }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HF returned ${res.status}: ${errText}`);
  }
  const data = await res.json();
  let text = "";
  if (Array.isArray(data) && data[0]?.generated_text) text = data[0].generated_text;
  else if (data.generated_text) text = data.generated_text;

  // cleanup
  let cleaned = text.trim();
  const stop = cleaned.indexOf("Human:");
  if (stop !== -1) cleaned = cleaned.substring(0, stop).trim();
  const aiStop = cleaned.indexOf("\nAI:");
  if (aiStop !== -1) cleaned = cleaned.substring(0, aiStop).trim();
  return cleaned || "I could not generate a response.";
}

/* ── Unified model call: server first → client fallback ── */
async function callModel(message: string, history: Message[]): Promise<string> {
  // Try server-side first
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.reply) return data.reply;
    } else {
      const err = await res.json().catch(() => ({}));
      console.warn("Server-side fetch failed, trying client-side fallback. Error:", err);
    }
  } catch (err) {
    console.warn("Server-side fetch network error, trying client-side fallback. Error:", err);
  }

  // Fallback: get token and call HF directly from browser
  let token = "";
  try {
    const tokenRes = await fetch("/api/chat");
    const tokenData = await tokenRes.json();
    token = tokenData.token;
  } catch (err) {
    throw new Error("Could not fetch HF token for client-side fallback.");
  }

  if (token) {
    // If callHFDirect throws, we let it propagate up so the user sees the real error
    return await callHFDirect(message, history, token);
  }

  throw new Error("Could not reach the AI model: No token available.");
}

/* ── icons ── */
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChatBubble = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const CrosshairIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="12" y1="22" x2="12" y2="18" />
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

/* ── mythology prompts ── */
const SUGGESTIONS = [
  "Tell me about Kurukshetra",
  "Who is Lord Hanuman?",
  "Narrate the story of Draupadi",
  "What happened in Lanka?",
  "Describe Arjuna's penance",
  "The tale of Krishna and Karna",
];

/* ═══════════════════════════════ */
/*        MAIN COMPONENT          */
/* ═══════════════════════════════ */

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: "1", title: "New conversation", messages: [] },
  ]);
  const [activeId, setActiveId] = useState("1");
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [pipelineDone, setPipelineDone] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeId)!;
  const messages = activeSession.messages;

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 60);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pipelineSteps, scrollToBottom]);

  /* helpers */
  const updateMessages = (id: string, msgs: Message[]) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, messages: msgs } : s))
    );
  };

  const setSessionTitle = (id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title } : s))
    );
  };

  const newChat = () => {
    const id = Date.now().toString();
    setSessions((prev) => [
      { id, title: "New conversation", messages: [] },
      ...prev,
    ]);
    setActiveId(id);
    setPipelineSteps([]);
    setPipelineDone(false);
  };

  const addStep = (step: PipelineStep, delay: number) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        setPipelineSteps((prev) => [...prev, step]);
        resolve();
      }, delay);
    });

  /* ── submit ── */
  const handleSubmit = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
    };
    const updatedMsgs = [...messages, userMsg];
    updateMessages(activeId, updatedMsgs);

    if (messages.length === 0) {
      setSessionTitle(activeId, msg.slice(0, 40));
    }

    setInput("");
    setIsProcessing(true);
    setPipelineSteps([]);
    setPipelineDone(false);

    /* Fire off the API call immediately (runs in parallel with pipeline visuals) */
    const apiPromise = callModel(msg, messages);

    /* Step 1 – Tokenize */
    const tokens = pseudoTokenize(msg);
    await addStep(
      { key: "tok", label: "Lexical Analysis: BPE Tokenization", icon: "T", colorClass: "tok", data: tokens },
      600
    );

    /* Step 2 – Embed */
    const emb = fakeEmbeddings(tokens.length);
    await addStep(
      { key: "emb", label: "Embedding: Mapping to 768-dim semantic space", icon: "E", colorClass: "emb", data: emb as unknown as string[] },
      800
    );

    /* Step 3 - Positional */
    await addStep(
      { key: "pos", label: "Positional Encoding: Injecting sequence context", icon: "P", colorClass: "att", data: fakePositionalEncodings(tokens.length) },
      600
    );

    /* Step 4 - Attention */
    await addStep(
      { key: "att", label: "Transformer Block: 12-layer multi-head self-attention", icon: "A", colorClass: "att", data: fakeAttention(tokens) },
      1000
    );

    /* Step 5 - FFN */
    await addStep(
      { key: "ffn", label: "Feed-Forward Networks: Non-linear projection", icon: "F", colorClass: "att", data: fakeFFN() },
      700
    );

    /* Step 6 - Logits */
    await addStep(
      { key: "log", label: "Language Model Head: Computing vocabulary logits", icon: "L", colorClass: "gen", data: fakeLogits() },
      800
    );

    /* Step 7 – Sampling */
    await addStep(
      { key: "gen", label: "Decoding: Top-P/Top-K auto-regressive sampling", icon: "S", colorClass: "gen", data: ["Temp: 0.85", "Top-P: 0.92", "Top-K: 50"] },
      1000
    );

    /* Wait for the API response (it's been running in parallel) */
    try {
      const reply = await apiPromise;

      /* Step 8 – Output decoded */
      await addStep(
        { key: "out", label: "Output decoded — Detokenizing", icon: "✓", colorClass: "out", data: [reply] },
        600
      );

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: reply,
      };

      setTimeout(() => {
        updateMessages(activeId, [...updatedMsgs, aiMsg]);
        setPipelineSteps([]);
        setPipelineDone(true);
        setIsProcessing(false);
      }, 1400);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Could not reach the model.";
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `Error: ${errorMessage}. Please try again.`,
      };
      updateMessages(activeId, [...updatedMsgs, errMsg]);
      setPipelineSteps([]);
      setPipelineDone(true);
      setIsProcessing(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const showHero = messages.length === 0 && pipelineSteps.length === 0;

  return (
    <div className="app-container">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">V</div>
          <span className="sidebar-logo-text">VAK</span>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-nav-item active">
            <ChatBubble /> Chat
          </button>
          <button className="sidebar-nav-item" onClick={newChat}>
            <PlusIcon /> New Chat
          </button>
          <Link href="/about" className="sidebar-nav-item" style={{ textDecoration: 'none' }}>
            <InfoIcon /> About
          </Link>
        </nav>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">Previous</div>
        <div className="chat-history-list">
          {sessions.map((s) => (
            <button
              key={s.id}
              className={`chat-history-item ${s.id === activeId ? "active" : ""}`}
              onClick={() => {
                setActiveId(s.id);
                setPipelineSteps([]);
                setPipelineDone(false);
              }}
            >
              {s.title}
            </button>
          ))}
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="main-chat">
        {showHero ? (
          /* ──── HERO ──── */
          <div className="hero-container">
            <div className="animated-bg">
              <div className="blob blob-1"></div>
              <div className="blob blob-2"></div>
            </div>
            {/* Giant watermark */}
            <div className="hero-watermark" aria-hidden="true">
              VAK
            </div>

            <div className="hero-content">
              <h1 className="hero-heading">
                Unveil the ancient epics.
              </h1>
              <p className="hero-sub">
                Converse with Vak and explore the mythology of Ramayana,
                Mahabharata &amp; world folklore
              </p>

              {/* Input box (hero version) */}
              <div className="hero-input-wrapper">
                <form
                  className="hero-input-box"
                  onSubmit={onFormSubmit}
                >
                  <input
                    type="text"
                    className="hero-textarea"
                    placeholder="Ask me about the great epics…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isProcessing}
                  />
                  <div className="hero-input-actions">

                    <button
                      type="submit"
                      className="hero-send-btn"
                      disabled={!input.trim() || isProcessing}
                      title="Send"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </form>
              </div>

              {/* Suggestion chips */}
              <div className="hero-chips">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="hero-chip"
                    onClick={() => handleSubmit(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ──── MESSAGES ──── */
          <div className="messages-container">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.role}`}>
                <div className="msg-bubble">
                  {msg.role === "ai" ? (
                    <>
                      <div className="ai-avatar">V</div>
                      <div className="ai-text">{msg.content}</div>
                    </>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {/* ──── PIPELINE ──── */}
            {pipelineSteps.length > 0 && !pipelineDone && (
              <div className="pipeline-container">
                <div className="pipeline-box">
                  {pipelineSteps.map((step, i) => (
                    <div
                      key={step.key}
                      className="pipeline-step"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <div className={`step-dot ${step.colorClass}`}>
                        {step.icon}
                      </div>
                      <div className="step-body">
                        <div className="step-label">
                          {step.label}
                          {i === pipelineSteps.length - 1 &&
                            step.key !== "out" && <span className="pulse" />}
                        </div>
                        <div className="step-data">
                          {step.key === "tok" && Array.isArray(step.data) && (
                            <div className="token-pills">
                              {(step.data as string[]).map((t, j) => (
                                <span key={j} className="token-pill">
                                  {t === "Ġ" ? "⎵" : t}
                                </span>
                              ))}
                            </div>
                          )}
                          {step.key === "emb" && Array.isArray(step.data) && (
                            <div className="embed-nums">
                              [{" "}
                              {(step.data as unknown as number[]).map((n, j) => (
                                <span key={j}>
                                  {typeof n === "number" ? n.toFixed(3) : n}
                                  {j < (step.data as unknown as number[]).length - 1 ? ", " : ""}
                                </span>
                              ))}
                              {" … ]"}
                            </div>
                          )}
                          {step.key === "pos" && Array.isArray(step.data) && (
                            <div className="embed-nums">
                              {step.data.map((d: string, j: number) => (
                                <span key={j} style={{ marginRight: "12px" }}>{d}</span>
                              ))}
                              <span>…</span>
                            </div>
                          )}
                          {step.key === "att" && Array.isArray(step.data) && (
                            <div className="token-pills" style={{ gap: "12px" }}>
                              {step.data.map((d: string, j: number) => (
                                <span key={j} className="token-pill att" style={{ background: "rgba(100,100,100,0.1)", border: "1px solid rgba(150,150,150,0.2)" }}>
                                  {d}
                                </span>
                              ))}
                            </div>
                          )}
                          {step.key === "ffn" && Array.isArray(step.data) && (
                            <div className="embed-nums">
                              [ {step.data.map((n: number, j: number) => (
                                <span key={j}>{n.toFixed(2)}{j < step.data.length - 1 ? ", " : ""}</span>
                              ))} … ]
                            </div>
                          )}
                          {step.key === "log" && Array.isArray(step.data) && (
                            <div className="token-pills" style={{ gap: "8px" }}>
                              {step.data.map((d: any, j: number) => (
                                <span key={j} className="token-pill out" style={{ background: "rgba(100,100,100,0.1)", border: "1px solid rgba(150,150,150,0.2)" }}>
                                  {d.token}: <strong style={{opacity: 0.7}}>{d.prob}</strong>
                                </span>
                              ))}
                            </div>
                          )}
                          {step.key === "gen" && Array.isArray(step.data) && (
                            <div className="token-pills" style={{ gap: "8px" }}>
                              {step.data.map((d: string, j: number) => (
                                <span key={j} className="token-pill gen" style={{ background: "rgba(100,100,100,0.1)", border: "1px solid rgba(150,150,150,0.2)" }}>{d}</span>
                              ))}
                              <div className="progress-bar" style={{ width: "100px", display: "inline-block", marginLeft: "10px", marginBottom: "0" }} />
                            </div>
                          )}
                          {step.key === "out" && Array.isArray(step.data) && (
                            <div className="output-text">
                              {(step.data as string[])[0]?.slice(0, 90)}
                              {((step.data as string[])[0]?.length ?? 0) > 90 ? "…" : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ──── BOTTOM INPUT (only when chatting) ──── */}
        {!showHero && (
          <div className="input-area">
            <form className="input-box" onSubmit={onFormSubmit}>
              <input
                type="text"
                className="input-field"
                placeholder="Ask about the great epics…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={!input.trim() || isProcessing}
                title="Send"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
