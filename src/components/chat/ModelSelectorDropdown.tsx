'use client';

import { useState, useRef, useEffect } from 'react';
import { MODELS, ModelConfig } from '@/lib/chat-models';

interface ModelSelectorDropdownProps {
  activeModel: ModelConfig;
  onSelectModel: (model: ModelConfig) => void;
}

export default function ModelSelectorDropdown({
  activeModel,
  onSelectModel,
}: ModelSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderModelIcon = (id: string) => {
    if (id === 'translator') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    }
    if (id === 'gpt124m') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
        <path d="M19 15L20 17.5L22.5 18.5L20 19.5L19 22L18 19.5L15.5 18.5L18 17.5L19 15Z" />
      </svg>
    );
  };

  return (
    <div className="model-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className="model-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="pulse-dot-green" />
        <span className="trigger-icon" style={{ color: activeModel.color }}>
          {renderModelIcon(activeModel.id)}
        </span>
        <span className="trigger-name">{activeModel.name}</span>
        <span className="trigger-badge">{activeModel.badge}</span>
        <svg
          className="trigger-chevron"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Glassmorphic Dropdown Menu */}
      {isOpen && (
        <div className="model-dropdown-menu" role="menu" style={{ display: 'flex' }}>
          <div className="dropdown-menu-header">Select Neural Model</div>

          {Object.values(MODELS).map((model) => {
            const isSelected = model.id === activeModel.id;
            return (
              <div
                key={model.id}
                className={`dropdown-menu-item ${isSelected ? 'active' : ''}`}
                role="menuitem"
                onClick={() => {
                  onSelectModel(model);
                  setIsOpen(false);
                }}
              >
                <div className={`dropdown-item-icon-box ${model.type}`}>
                  {renderModelIcon(model.id)}
                </div>
                <div className="dropdown-item-text">
                  <div className="dropdown-item-title">{model.name}</div>
                  <div className="dropdown-item-desc">{model.desc}</div>
                </div>
                <div className="dropdown-item-meta">{model.latency}</div>
                <div className="dropdown-item-check">
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
