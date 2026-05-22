import React, { useEffect, useMemo, useState } from 'react';
import MeditationCard from './MeditationCard';

const BOOK_NAMES = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};

const PAGE_SIZE = 24;

export default function MeditationList({
  meditations,
  themes,
  selectedTheme,
  selectedBook,
  favoriteIds = new Set(),
  readIds = new Set(),
  onToggleFavorite,
  onToggleRead
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const selectedThemeData = themes.find(t => t.id === selectedTheme);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [meditations, selectedTheme, selectedBook]);

  const visibleMeditations = useMemo(
    () => meditations.slice(0, visibleCount),
    [meditations, visibleCount]
  );

  const getTitle = () => {
    if (selectedTheme) {
      return (
        <>
          <span>{selectedThemeData?.icon}</span> {selectedThemeData?.name}
        </>
      );
    }
    if (selectedBook) {
      return (
        <>
          <span>📖</span> Libro {BOOK_NAMES[selectedBook]}
        </>
      );
    }
    return 'Todas las meditaciones';
  };

  return (
    <section className="meditation-list">
      <div className="list-header enhanced">
        <div>
          <h2>{getTitle()}</h2>
          <p>Elige un pasaje, abre “Profundizar” y conviértelo en una práctica concreta.</p>
        </div>
        <span className="count">{meditations.length} meditaciones</span>
      </div>

      {meditations.length === 0 ? (
        <div className="empty-state">
          <span>🕯️</span>
          <h3>No hay pasajes con esos filtros</h3>
          <p>Prueba con otra palabra, otro tema o desactiva “Solo favoritos”.</p>
        </div>
      ) : (
        <>
          <div className="meditations-grid">
            {visibleMeditations.map(meditation => (
              <MeditationCard
                key={meditation.id}
                meditation={meditation}
                themes={themes}
                isFavorite={favoriteIds.has(meditation.id)}
                isRead={readIds.has(meditation.id)}
                onToggleFavorite={onToggleFavorite}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>

          {visibleCount < meditations.length && (
            <div className="load-more-row">
              <button className="load-more-btn" onClick={() => setVisibleCount(count => count + PAGE_SIZE)}>
                Cargar {Math.min(PAGE_SIZE, meditations.length - visibleCount)} pasajes más
              </button>
              <small>Mostrando {visibleMeditations.length} de {meditations.length}</small>
            </div>
          )}
        </>
      )}
    </section>
  );
}
