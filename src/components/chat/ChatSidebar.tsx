'use client';

import Link from 'next/link';
import { ModelConfig } from '@/lib/chat-models';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeModel: ModelConfig;
  onNewChat: () => void;
  historySessions: { id: string; title: string; time: string; modelId: string }[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  userName?: string;
  onUpdateUserName?: (name: string) => void;
}

export default function ChatSidebar({
  isOpen,
  onClose,
  activeModel,
  onNewChat,
  historySessions,
  activeSessionId,
  onSelectSession,
  userName = 'Bharadwaj',
  onUpdateUserName,
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Left Sidebar */}
      <aside className={`chat-sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand & Mobile Close */}
        <div className="sidebar-brand-row">
          <Link href="/" className="sidebar-brand-link" title="Return to Chill Guy Home">
            <span className="brand-dot">.</span>
            <span className="brand-text">chillguy</span>
            <span className="sidebar-brand-badge">STUDIO</span>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            id="btn-sidebar-close"
            aria-label="Close Sidebar"
            onClick={onClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* New Chat Action */}
        <div className="sidebar-action-row">
          <button
            type="button"
            className="btn-new-chat"
            id="btn-create-new-chat"
            onClick={onNewChat}
          >
            <span className="btn-new-chat-left">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Chat</span>
            </span>
            <span className="kbd-shortcut">Ctrl K</span>
          </button>
        </div>

        {/* Active Model Summary Card */}
        <div className="sidebar-section-title">Active Model</div>
        <div className="sidebar-model-display">
          <div className="sidebar-active-model-card" id="sidebar-model-pill">
            <div
              className="sidebar-model-icon-box"
              style={{ background: `${activeModel.color}22`, color: activeModel.color }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v8M8 12h8" />
              </svg>
            </div>
            <div className="sidebar-model-info">
              <div className="sidebar-model-title">{activeModel.name}</div>
              <div className="sidebar-model-badge">{activeModel.badge}</div>
            </div>
          </div>
        </div>

        {/* Chat History List */}
        <div className="sidebar-section-title">Chat History</div>
        <div className="sidebar-history-container" id="chat-history-list">
          {historySessions.map((session) => (
            <div
              key={session.id}
              className={`history-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="history-item-left">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span className="history-title">{session.title}</span>
              </div>
              <span className="history-time">{session.time}</span>
            </div>
          ))}
        </div>

        {/* User Profile & Status Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-row">
            <div className="user-avatar-mini">
              <img src="/assets/avatar-1.jpg" alt={`${userName} Profile`} />
            </div>
            <div className="user-meta">
              <span
                className="user-name-text user-name-clickable"
                title="Click to edit your nickname"
                onClick={() => {
                  const newName = prompt('Enter your cool nickname / username:', userName);
                  if (newName && newName.trim() && onUpdateUserName) {
                    onUpdateUserName(newName.trim());
                  }
                }}
              >
                <span>{userName}</span>
                <svg className="user-name-edit-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <span className="user-tier-badge">Pro Studio Tier</span>
            </div>
          </div>
          <Link href="/login" className="sidebar-logout-btn" title="Log In / Switch Account">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Link>
        </div>
      </aside>
    </>
  );
}
