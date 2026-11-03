'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MODELS, ModelConfig } from '@/lib/chat-models';
import { ChatMessage, generateSimulatedResponse } from '@/lib/chat-engine';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';

const CHILL_SLANG_GREETINGS = [
  { prefix: 'wassgood', emoji: '🔥', sub: 'unbothered, relaxed, and tuned to zero latency. what are we building today?' },
  { prefix: 'wassup', emoji: '✨', sub: 'low latency, zero stress, pure chill AI. ask questions or drop a code review.' },
  { prefix: "what's cookin", emoji: '🚀', sub: '3B parameters primed and ready to roast commit habits or architect systems.' },
  { prefix: 'vibe check passed', emoji: '⚡', sub: 'zero drama, peak throughput. what project are we working on right now?' },
  { prefix: 'yo', emoji: '🎯', sub: 'neural weights locked in. ask anything or request system architectures.' },
];

export default function ChatPage() {
  const [activeModel, setActiveModel] = useState<ModelConfig>(MODELS.qwen_chill);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState('session-1');
  const [userName, setUserName] = useState('Bharadwaj');
  const [greetingIndex, setGreetingIndex] = useState(0);

  // Load username and random greeting from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user_name');
      if (savedUser && savedUser.trim()) {
        setUserName(savedUser.trim());
      }
    } catch {
      // Ignore in private browsing
    }
    setGreetingIndex(Math.floor(Math.random() * CHILL_SLANG_GREETINGS.length));
  }, []);

  const currentGreeting = useMemo(
    () => CHILL_SLANG_GREETINGS[greetingIndex % CHILL_SLANG_GREETINGS.length],
    [greetingIndex]
  );

  const [historySessions, setHistorySessions] = useState([
    {
      id: 'session-1',
      title: 'Neural Architecture Overview',
      time: 'Just now',
      modelId: 'qwen_chill',
    },
    {
      id: 'session-2',
      title: 'English to Telugu Indic Pipeline',
      time: '2h ago',
      modelId: 'translator',
    },
    {
      id: 'session-3',
      title: 'GPT-124M Loss Optimization',
      time: 'Yesterday',
      modelId: 'gpt124m',
    },
  ]);

  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({
    'session-1': [],
    'session-2': [],
    'session-3': [],
  });

  const currentMessages = sessionMessages[activeSessionId] || [];
  const isHero = currentMessages.length === 0;

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessionMessages((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), userMsg],
      }));

      // Update session title if first message
      if (currentMessages.length === 0) {
        setHistorySessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, title: text.slice(0, 28) + (text.length > 28 ? '...' : '') }
              : s
          )
        );
      }

      setIsLoading(true);

      try {
        const response = await generateSimulatedResponse(text, activeModel.id);
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          content: response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelId: activeModel.id,
          latency: response.latency,
          tokenCount: response.tokenCount,
        };

        setSessionMessages((prev) => ({
          ...prev,
          [activeSessionId]: [...(prev[activeSessionId] || []), assistantMsg],
        }));
      } catch (err) {
        console.error('Error generating response:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [activeModel.id, activeSessionId, currentMessages.length, isLoading]
  );

  const handleNewChat = useCallback(() => {
    const newId = `session-${Date.now()}`;
    const newSession = {
      id: newId,
      title: 'New Conversation',
      time: 'Just now',
      modelId: activeModel.id,
    };
    setHistorySessions((prev) => [newSession, ...prev]);
    setSessionMessages((prev) => ({ ...prev, [newId]: [] }));
    setActiveSessionId(newId);
    setSidebarOpen(false);
    setGreetingIndex((prev) => (prev + 1) % CHILL_SLANG_GREETINGS.length);
  }, [activeModel.id]);

  const handleClearChat = useCallback(() => {
    setSessionMessages((prev) => ({
      ...prev,
      [activeSessionId]: [],
    }));
    setGreetingIndex((prev) => (prev + 1) % CHILL_SLANG_GREETINGS.length);
  }, [activeSessionId]);

  // Keyboard shortcut: Ctrl+K / Cmd+K for New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  const handleUpdateUserName = (newName: string) => {
    setUserName(newName);
    try {
      localStorage.setItem('user_name', newName);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="chat-fullscreen-app">
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeModel={activeModel}
        onNewChat={handleNewChat}
        historySessions={historySessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setSidebarOpen(false);
        }}
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
      />

      <main className="chat-main-area">
        <ChatHeader
          activeModel={activeModel}
          onSelectModel={(model) => setActiveModel(model)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onClearChat={handleClearChat}
        />

        {/* Unified Scroll Viewport (Scrolling works anywhere on the screen) */}
        <div className="chat-viewport" id="chat-viewport">
          {/* Centered Hero Stage (Visible when 0 messages, dissolves when prompt sent) */}
          <div className={`chat-hero-stage ${!isHero ? 'hero-hidden' : ''}`} id="chat-hero-stage">
            <div className="hero-header-content">
              <div
                className="hero-avatar-box"
                style={{
                  background: `${activeModel.color}22`,
                  color: activeModel.color,
                  border: `1px solid ${activeModel.color}44`,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
                  <path d="M19 15L20 17.5L22.5 18.5L20 19.5L19 22L18 19.5L15.5 18.5L18 17.5L19 15Z" />
                </svg>
              </div>

              <h1 className="hero-slang-title">
                {currentGreeting.prefix},{' '}
                <span className="hero-username-highlight">{userName}</span>? {currentGreeting.emoji}
              </h1>

              <p className="hero-slang-subhead">
                {currentGreeting.sub}
              </p>
            </div>

            {/* Spacer matching the floating centered input card height */}
            <div className="hero-composer-placeholder" />

            {/* 2x2 Interactive Suggestion Prompt Cards */}
            <div className="hero-suggestions-grid">
              {activeModel.suggestions.map((sugg, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="hero-suggestion-card"
                  onClick={() => handleSendMessage(sugg.prompt)}
                >
                  <div className="suggestion-card-top">
                    <span className="suggestion-card-title">{sugg.title}</span>
                    <span className="suggestion-card-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                  <span className="suggestion-card-prompt">{sugg.prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Conversation Message History Stream */}
          {!isHero && (
            <ChatMessages
              messages={currentMessages}
              activeModel={activeModel}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Ambient bottom shield to seamlessly blend scrolled messages behind docked bar */}
        {!isHero && <div className="chat-bottom-shield" />}

        {/* Floating Composer Dock: Smooth iOS transition from middle to bottom */}
        <div className={`chat-composer-dock ${isHero ? 'dock-center' : 'dock-bottom'}`}>
          <div className="chat-composer-inner">
            <ChatInput
              activeModel={activeModel}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isHero={isHero}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
