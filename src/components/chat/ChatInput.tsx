'use client';

import { useState, useRef, useEffect } from 'react';
import { ModelConfig } from '@/lib/chat-models';

interface ChatInputProps {
  activeModel: ModelConfig;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isHero?: boolean;
}

export default function ChatInput({
  activeModel,
  onSendMessage,
  isLoading,
  isHero = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea when entering new chat or switching models
    if (isHero) {
      textareaRef.current?.focus();
    }
  }, [isHero, activeModel.id]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  };

  return (
    <>
      <div className="chat-input-card" id="chat-composer-box">
        <div className="input-row-main">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            id="chat-prompt-input"
            placeholder={
              isHero
                ? `Ask anything, roast code, or drop a prompt...`
                : activeModel.id === 'translator'
                ? 'Enter English text to translate to Telugu with BPE tokens...'
                : activeModel.id === 'gpt124m'
                ? 'Ask about 124M weights, PyTorch SDPA attention, or causal decoding...'
                : 'Message Chill Guy Qwen 2.5...'
            }
            rows={1}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="button"
            className="btn-chat-send"
            id="btn-send-message"
            disabled={!input.trim() || isLoading}
            onClick={handleSend}
            aria-label="Send message"
            title="Send prompt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>

        <div className="input-actions-row">
          <div className="input-model-indicator">
            <span className="active-dot" />
            <span style={{ color: '#cbd5e1', fontWeight: 600 }} id="input-model-label">
              {activeModel.name}
            </span>
            <span>•</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Zero Latency Buffer</span>
          </div>
          <span className="kbd-hint">Enter to send • Shift+Enter for newline</span>
        </div>
      </div>
    </>
  );
}
