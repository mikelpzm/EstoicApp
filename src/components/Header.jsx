import React from 'react';

export default function Header({ onShowDaily, onShowAll, onRandom }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🏛️</span>
          <h1>Meditaciones</h1>
          <span className="author">Marco Aurelio</span>
        </div>
        <nav className="nav">
          <button onClick={onShowDaily} className="nav-btn">
            <span className="nav-icon">☀️</span>
            Hoy
          </button>
          <button onClick={onRandom} className="nav-btn">
            <span className="nav-icon">🎲</span>
            Aleatoria
          </button>
          <button onClick={onShowAll} className="nav-btn">
            <span className="nav-icon">📚</span>
            Explorar
          </button>
        </nav>
      </div>
    </header>
  );
}
