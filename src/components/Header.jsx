import React from 'react';
import Icon from './Icon';

export default function Header({ onShowDaily, onShowAll, onPractice, onRandom, onNotifications, onImageSettings, activeView, isImageGenerationEnabled }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-mark" aria-hidden="true"><Icon name="temple" size={28} /></span>
          <div className="brand-copy">
            <h1>Meditaciones</h1>
            <span className="author">Marco Aurelio</span>
          </div>
        </div>
        <nav className="nav" aria-label="Navegación principal">
          <button onClick={onShowDaily} className={`nav-btn ${activeView === 'daily' ? 'active' : ''}`} aria-current={activeView === 'daily' ? 'page' : undefined}>
            <Icon name="sun" className="nav-icon" />
            <span className="btn-text">Hoy</span>
          </button>
          <button onClick={onRandom} className={`nav-btn ${activeView === 'random' ? 'active' : ''}`} aria-current={activeView === 'random' ? 'page' : undefined}>
            <Icon name="shuffle" className="nav-icon" />
            <span className="btn-text">Aleatoria</span>
          </button>
          <button onClick={onShowAll} className={`nav-btn ${activeView === 'explore' ? 'active' : ''}`} aria-current={activeView === 'explore' ? 'page' : undefined}>
            <Icon name="library" className="nav-icon" />
            <span className="btn-text">Explorar</span>
          </button>
          <button onClick={onPractice} className={`nav-btn ${activeView === 'practice' ? 'active' : ''}`} aria-current={activeView === 'practice' ? 'page' : undefined}>
            <Icon name="compass" className="nav-icon" />
            <span className="btn-text">Rutas</span>
          </button>
          <button onClick={onImageSettings} className={`nav-btn nav-btn-notification ${isImageGenerationEnabled ? 'active' : ''}`} title="Configurar generación de imágenes" aria-label="Configurar generación de imágenes">
            <Icon name="image" className="nav-icon" />
          </button>
          <button onClick={onNotifications} className="nav-btn nav-btn-notification" title="Configurar notificaciones" aria-label="Configurar notificaciones">
            <Icon name="bell" className="nav-icon" />
          </button>
        </nav>
      </div>
    </header>
  );
}
