'use client';

import { useEffect, useRef, useState } from 'react';
import { ModelConfig } from '@/lib/chat-models';
import { ChatMessage } from '@/lib/chat-engine';

interface ChatMessagesProps {
  messages: ChatMessage[];
  activeModel: ModelConfig;
  isLoading: boolean;
}

export default function ChatMessages({
  messages,
  activeModel,
  isLoading,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Only scroll into view if there are messages
    if (messages.length > 0 || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="chat-messages-stream" id="chat-messages-stream">
      {messages.map((msg, idx) => (
        <div
          key={msg.id || idx}
          className={`chat-msg-row ${msg.sender === 'user' ? 'chat-msg-user-row' : 'chat-msg-ai-row'}`}
        >
          {msg.sender === 'assistant' && (
            <div
              className="ai-avatar-icon"
              style={{
                background: `${activeModel.color}22`,
                color: activeModel.color,
                border: `1px solid ${activeModel.color}44`,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
              </svg>
            </div>
          )}

          <div className="chat-msg-bubble">
            {msg.sender === 'assistant' && (
              <div className="ai-meta-bar">
                <span className="ai-model-tag">{activeModel.name}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.latency && (
                  <span className="ai-telemetry-pill">{msg.latency}</span>
                )}
              </div>
            )}

            <div
              className="message-formatted-content"
              dangerouslySetInnerHTML={{
                __html: formatMarkdownLike(msg.content),
              }}
            />
          </div>

          {msg.sender === 'user' && (
            <div className="user-avatar-mini" style={{ width: 28, height: 28, flexShrink: 0, alignSelf: 'flex-end' }}>
              <img src="/assets/avatar-1.jpg" alt="User" />
            </div>
          )}
        </div>
      ))}

      {/* Streaming / Typing Indicator */}
      {isLoading && (
        <div className="chat-msg-row chat-msg-ai-row">
          <div
            className="ai-avatar-icon"
            style={{
              background: `${activeModel.color}22`,
              color: activeModel.color,
              border: `1px solid ${activeModel.color}44`,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
            </svg>
          </div>
          <div className="chat-msg-bubble">
            <div className="typing-dots-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
}

// Safe lightweight formatter for code blocks, markdown bold, inline code
function formatMarkdownLike(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```code```
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<div class="code-block"><div class="code-header"><span>${lang || 'code'}</span><button class="btn-copy-code" onclick="navigator.clipboard.writeText(this.closest('.code-block').querySelector('code').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy', 2000)">Copy</button></div><pre class="code-content"><code>${code.trim()}</code></pre></div>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers: ### Header
  html = html.replace(/^### (.*$)/gim, '<h3 class="msg-h3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="msg-h2">$1</h2>');

  // Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italics: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}
