import React from 'react';

export default function Header({ onShowDaily, onShowAll, onRandom, onNotifications, onImageSettings, isImageGenerationEnabled }) {
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
            <span className="btn-text">Hoy</span>
          </button>
          <button onClick={onRandom} className="nav-btn">
            <span className="nav-icon">🎲</span>
            <span className="btn-text">Aleatoria</span>
          </button>
          <button onClick={onShowAll} className="nav-btn">
            <span className="nav-icon">📚</span>
            <span className="btn-text">Explorar</span>
          </button>
          <button onClick={onImageSettings} className={`nav-btn nav-btn-notification ${isImageGenerationEnabled ? 'active' : ''}`} title="Configurar generación de imágenes">
            <span className="nav-icon">🖼️</span>
          </button>
          <button onClick={onNotifications} className="nav-btn nav-btn-notification" title="Configurar notificaciones">
            <span className="nav-icon">🔔</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
