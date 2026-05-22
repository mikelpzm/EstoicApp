import React, { useState } from 'react';
import BookContext from './BookContext';
import Icon from './Icon';
import { buildStoicInsight, cleanMeditationText } from '../utils/stoicLens';
import { themeIconNames } from '../utils/themeIcons';

export default function MeditationCard({
  meditation,
  themes,
  bookContexts,
  isDaily = false,
  showContext = false,
  isFavorite = false,
  isRead = false,
  onToggleFavorite,
  onToggleRead
}) {
  const [expanded, setExpanded] = useState(isDaily);
  const [fullTextOpen, setFullTextOpen] = useState(isDaily);
  const meditationThemes = themes.filter(t => meditation.themes.includes(t.id));
  const displayText = cleanMeditationText(meditation.text);
  const insight = buildStoicInsight(meditation);

  const shareText = `"${displayText}" — Marco Aurelio, Libro ${meditation.book}, ${meditation.chapter}`;
  const shouldClampText = !isDaily && displayText.length > 760;
  const visibleText = shouldClampText && !fullTextOpen ? `${displayText.slice(0, 720).trim()}…` : displayText;

  const handleCopy = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Meditación de Marco Aurelio', text: shareText });
      return;
    }
    await navigator.clipboard.writeText(shareText);
  };

  return (
    <article className={`meditation-card ${isDaily ? 'daily' : ''} ${isRead ? 'is-read' : ''}`}>
      <div className="card-topline">
        {isDaily ? (
          <div className="daily-badge">
            <Icon name="sun" size={16} /> Meditación del día
          </div>
        ) : (
          <span className="reading-badge">Lectura estoica</span>
        )}
        <div className="card-actions-inline">
          {onToggleRead && (
            <button
              className="icon-action"
              onClick={() => onToggleRead(meditation.id)}
              title={isRead ? 'Marcar como pendiente' : 'Marcar como leído'}
              aria-label={isRead ? 'Marcar como pendiente' : 'Marcar como leído'}
            >
              <Icon name={isRead ? 'check' : 'circle'} size={17} />
            </button>
          )}
          {onToggleFavorite && (
            <button
              className="icon-action"
              onClick={() => onToggleFavorite(meditation.id)}
              title={isFavorite ? 'Quitar de favoritos' : 'Guardar como favorito'}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar como favorito'}
            >
              <Icon name="star" size={17} className={isFavorite ? 'filled-icon' : ''} />
            </button>
          )}
        </div>
      </div>

      <blockquote className="meditation-text">
        "{visibleText}"
      </blockquote>

      {shouldClampText && (
        <button className="text-expand-btn" onClick={() => setFullTextOpen(open => !open)}>
          {fullTextOpen ? 'Contraer pasaje' : 'Leer pasaje completo'}
        </button>
      )}

      <footer className="meditation-footer">
        <cite className="meditation-source">
          — Libro {meditation.book}, {meditation.chapter}
        </cite>

        <div className="meditation-themes">
          {meditationThemes.map(theme => (
            <span key={theme.id} className="theme-tag">
              <Icon name={themeIconNames[theme.id]} size={15} /> {theme.name}
            </span>
          ))}
        </div>
      </footer>

      <section className="stoic-lens" aria-label="Lectura estoica del pasaje">
        <button className="stoic-lens-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          <span><Icon name="spark" size={16} /> Profundizar</span>
          <Icon name="chevronDown" size={17} className={expanded ? 'rotated' : ''} />
        </button>

        {expanded && (
          <div className="stoic-lens-content">
            <div className="lens-block essence">
              <span className="lens-label">Idea núcleo</span>
              <p>{insight.essence}</p>
            </div>
            <div className="lens-grid">
              <div className="lens-block">
                <span className="lens-label">En sencillo</span>
                <p>{insight.plainReading}</p>
              </div>
              <div className="lens-block">
                <span className="lens-label">Ejercicio</span>
                <p>{insight.exercise}</p>
              </div>
              <div className="lens-block">
                <span className="lens-label">Diario</span>
                <p>{insight.journalQuestion}</p>
              </div>
              <div className="lens-block mantra">
                <span className="lens-label">Recordatorio</span>
                <p>{insight.mantra}</p>
              </div>
            </div>
            <div className="lens-actions">
              <button className="mini-action" onClick={handleCopy}><Icon name="share" size={16} /> Compartir / copiar</button>
              {onToggleRead && (
                <button className="mini-action" onClick={() => onToggleRead(meditation.id)}>
                  <Icon name={isRead ? 'circle' : 'check'} size={16} />
                  {isRead ? 'Reabrir lectura' : 'Marcar como leído'}
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {(isDaily || showContext) && bookContexts && (
        <BookContext
          bookNumber={meditation.book}
          bookContexts={bookContexts}
        />
      )}
    </article>
  );
}
