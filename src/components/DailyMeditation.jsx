import React, { useState, useEffect } from 'react';
import MeditationCard from './MeditationCard';
import ShareImageModal from './ShareImageModal';
import ImageGenerator from './ImageGenerator';

function getDailyMeditation(meditations) {
  // Usar la fecha actual como semilla para obtener una meditación "aleatoria" pero consistente durante el día
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Crear un hash simple de la fecha
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Usar el hash para seleccionar una meditación
  const index = Math.abs(hash) % meditations.length;
  return meditations[index];
}

export default function DailyMeditation({ meditations, themes, bookContexts, imageSettings }) {
  const [dailyMeditation, setDailyMeditation] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const isImageGenerationEnabled = imageSettings?.enabled && imageSettings?.apiKey;

  useEffect(() => {
    const meditation = getDailyMeditation(meditations);
    setDailyMeditation(meditation);
    setTimeout(() => setFadeIn(true), 100);
  }, [meditations]);

  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = today.toLocaleDateString('es-ES', options);

  if (!dailyMeditation) return null;

  return (
    <section className={`daily-section ${fadeIn ? 'fade-in' : ''}`}>
      <div className="daily-header">
        <span className="daily-date">{dateStr}</span>
        <p className="daily-intro">
          Reflexiona hoy sobre estas palabras del emperador filósofo
        </p>
      </div>

      <MeditationCard
        meditation={dailyMeditation}
        themes={themes}
        bookContexts={bookContexts}
        isDaily={true}
      />

      {isImageGenerationEnabled && (
        <ImageGenerator
          meditation={dailyMeditation}
          apiKey={imageSettings.apiKey}
          generatedImage={generatedImage}
          onImageGenerated={setGeneratedImage}
        />
      )}

      <div className="daily-actions">
        <button className="action-btn share" onClick={() => {
          if (isImageGenerationEnabled) {
            setShowShareModal(true);
          } else if (navigator.share) {
            navigator.share({
              title: 'Meditación de Marco Aurelio',
              text: `"${dailyMeditation.text}" — Marco Aurelio, Libro ${dailyMeditation.book}`,
            });
          } else {
            navigator.clipboard.writeText(`"${dailyMeditation.text}" — Marco Aurelio, Libro ${dailyMeditation.book}`);
            alert('Meditación copiada al portapapeles');
          }
        }}>
          <span>{isImageGenerationEnabled ? '🖼️' : '📤'}</span>
          {isImageGenerationEnabled ? 'Compartir con imagen' : 'Compartir'}
        </button>
      </div>

      {showShareModal && dailyMeditation && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ShareImageModal
              meditation={dailyMeditation}
              apiKey={imageSettings.apiKey}
              onClose={() => setShowShareModal(false)}
              existingImage={generatedImage}
              onImageGenerated={setGeneratedImage}
            />
          </div>
        </div>
      )}
    </section>
  );
}
