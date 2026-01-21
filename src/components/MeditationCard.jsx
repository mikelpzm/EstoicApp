import React from 'react';

export default function MeditationCard({ meditation, themes, isDaily = false }) {
  const meditationThemes = themes.filter(t => meditation.themes.includes(t.id));

  return (
    <article className={`meditation-card ${isDaily ? 'daily' : ''}`}>
      {isDaily && (
        <div className="daily-badge">
          <span>☀️</span> Meditación del día
        </div>
      )}

      <blockquote className="meditation-text">
        "{meditation.text}"
      </blockquote>

      <footer className="meditation-footer">
        <cite className="meditation-source">
          — Libro {meditation.book}, {meditation.chapter}
        </cite>

        <div className="meditation-themes">
          {meditationThemes.map(theme => (
            <span key={theme.id} className="theme-tag">
              {theme.icon} {theme.name}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}
