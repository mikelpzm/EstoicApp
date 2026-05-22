import React, { useState, useMemo } from 'react';
import MeditationCard from './MeditationCard';
import ShareImageModal from './ShareImageModal';
import ImageGenerator from './ImageGenerator';
import Icon from './Icon';

function getDailyMeditation(meditations) {
  if (!Array.isArray(meditations) || meditations.length === 0) {
    return null;
  }

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

export default function DailyMeditation({ meditations, themes, bookContexts, imageSettings, favoriteIds = new Set(), readIds = new Set(), onToggleFavorite, onToggleRead }) {
  const [fadeIn] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const isImageGenerationEnabled = imageSettings?.enabled && imageSettings?.apiKey;
  const dailyMeditation = useMemo(() => getDailyMeditation(meditations), [meditations]);

  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = today.toLocaleDateString('es-ES', options);

  const handleShare = async () => {
    if (!dailyMeditation) return;

    const text = `"${dailyMeditation.text}" — Marco Aurelio, Libro ${dailyMeditation.book}`;

    if (isImageGenerationEnabled) {
      setShowShareModal(true);
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Meditación de Marco Aurelio',
          text,
        });
        return;
      }

      await navigator.clipboard.writeText(text);
      alert('Meditación copiada al portapapeles');
    } catch (error) {
      if (error?.name !== 'AbortError' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('Meditación copiada al portapapeles');
      }
    }
  };

  if (!dailyMeditation) {
    return (
      <section className={`daily-section ${fadeIn ? 'fade-in' : ''}`}>
        <div className="empty-state">
          <Icon name="warning" size={30} />
          <h3>No hay meditación para mostrar</h3>
          <p>El corpus no cargó ningún pasaje, pero la práctica diaria sigue estable.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`daily-section ${fadeIn ? 'fade-in' : ''}`}>
      <div className="daily-header">
        <span className="daily-date">{dateStr}</span>
        <p className="daily-intro">
          Reflexiona hoy sobre estas palabras del emperador filósofo
        </p>
      </div>

      <div className="daily-ritual" aria-label="Ritual recomendado para hoy">
        <span><Icon name="library" size={15} /> Leer el pasaje</span>
        <span><Icon name="compass" size={15} /> Elegir una acción</span>
        <span><Icon name="pen" size={15} /> Responder el diario</span>
      </div>

      <MeditationCard
        meditation={dailyMeditation}
        themes={themes}
        bookContexts={bookContexts}
        isDaily={true}
        isFavorite={favoriteIds.has(dailyMeditation.id)}
        isRead={readIds.has(dailyMeditation.id)}
        onToggleFavorite={onToggleFavorite}
        onToggleRead={onToggleRead}
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
        <button className="action-btn share" onClick={handleShare}>
          <Icon name={isImageGenerationEnabled ? 'image' : 'share'} />
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
