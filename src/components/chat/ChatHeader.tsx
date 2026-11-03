'use client';

import Link from 'next/link';
import { ModelConfig } from '@/lib/chat-models';
import ModelSelectorDropdown from './ModelSelectorDropdown';

interface ChatHeaderProps {
  activeModel: ModelConfig;
  onSelectModel: (model: ModelConfig) => void;
  onToggleSidebar: () => void;
  onClearChat: () => void;
}

export default function ChatHeader({
  activeModel,
  onSelectModel,
  onToggleSidebar,
  onClearChat,
}: ChatHeaderProps) {
  return (
    <div className="chat-top-bar">
      <div className="chat-top-left">
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-toggle"
          id="btn-toggle-mobile-drawer"
          aria-label="Toggle Sidebar"
          onClick={onToggleSidebar}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Custom Model Selector Dropdown */}
        <ModelSelectorDropdown
          activeModel={activeModel}
          onSelectModel={onSelectModel}
        />
      </div>

      <div className="chat-top-right">
        {/* Live Model Telemetry Badge */}
        <div className="telemetry-pill">
          <span className="telemetry-label">Status:</span>
          <span className="telemetry-val" id="model-telemetry-val">
            {activeModel.latency} Latency • FP16
          </span>
        </div>

        {/* Clear Chat Button */}
        <button
          type="button"
          className="btn-top-action"
          id="btn-clear-chat"
          title="Clear Conversation"
          onClick={onClearChat}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Clear</span>
        </button>

        {/* Return to Home Link */}
        <Link
          href="/"
          className="btn-top-action btn-home-link"
          title="Return to Chill Guy Home"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
