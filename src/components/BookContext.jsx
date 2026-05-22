import React, { useState } from 'react';
import Icon from './Icon';

export default function BookContext({ bookNumber, bookContexts }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const context = bookContexts?.[String(bookNumber)];

  if (!context) return null;

  return (
    <div className={`book-context ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="book-context-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="book-context-icon"><Icon name="book" size={18} /></span>
        <span className="book-context-title">
          Libro {bookNumber}: {context.title}
        </span>
        <Icon name="chevronDown" size={16} className={`book-context-arrow ${isExpanded ? 'rotated' : ''}`} />
      </button>

      {isExpanded && (
        <div className="book-context-content">
          <div className="book-context-meta">
            <span className="book-context-period">
              <strong>Periodo:</strong> {context.period}
            </span>
            <span className="book-context-location">
              <strong>Lugar:</strong> {context.location}
            </span>
          </div>
          <p className="book-context-text">{context.context}</p>
        </div>
      )}
    </div>
  );
}
