import React from 'react';

export default function ThemeFilter({ themes, selectedTheme, onSelectTheme, meditationCounts }) {
  return (
    <div className="theme-filter">
      <h2 className="filter-title">Explorar por temática</h2>
      <div className="theme-grid">
        <button
          className={`theme-btn ${selectedTheme === null ? 'active' : ''}`}
          onClick={() => onSelectTheme(null)}
        >
          <span className="theme-icon">📖</span>
          <span className="theme-name">Todas</span>
          <span className="theme-count">{meditationCounts.total}</span>
        </button>

        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-btn ${selectedTheme === theme.id ? 'active' : ''}`}
            onClick={() => onSelectTheme(theme.id)}
          >
            <span className="theme-icon">{theme.icon}</span>
            <span className="theme-name">{theme.name}</span>
            <span className="theme-count">{meditationCounts[theme.id] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
