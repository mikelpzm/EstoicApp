import React from 'react';
import MeditationCard from './MeditationCard';

export default function MeditationList({ meditations, themes, selectedTheme }) {
  const filteredMeditations = selectedTheme
    ? meditations.filter(m => m.themes.includes(selectedTheme))
    : meditations;

  const selectedThemeData = themes.find(t => t.id === selectedTheme);

  return (
    <section className="meditation-list">
      <div className="list-header">
        <h2>
          {selectedTheme ? (
            <>
              <span>{selectedThemeData?.icon}</span> {selectedThemeData?.name}
            </>
          ) : (
            'Todas las meditaciones'
          )}
        </h2>
        <span className="count">{filteredMeditations.length} meditaciones</span>
      </div>

      <div className="meditations-grid">
        {filteredMeditations.map(meditation => (
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
