import React from 'react';
import MeditationCard from './MeditationCard';

const BOOK_NAMES = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};

export default function MeditationList({ meditations, themes, selectedTheme, selectedBook }) {
  const selectedThemeData = themes.find(t => t.id === selectedTheme);

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
      <div className="list-header">
        <h2>{getTitle()}</h2>
        <span className="count">{meditations.length} meditaciones</span>
      </div>

      <div className="meditations-grid">
        {meditations.map(meditation => (
          <MeditationCard
            key={meditation.id}
            meditation={meditation}
            themes={themes}
          />
        ))}
      </div>
    </section>
  );
}
