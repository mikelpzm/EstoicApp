import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { generateQuoteImage } from '../services/geminiService';
import './ShareImageModal.css';

function ShareImageModal({ meditation, apiKey, onClose, existingImage, onImageGenerated }) {
  const [imageUrl, setImageUrl] = useState(existingImage || null);
  const [isLoading, setIsLoading] = useState(!existingImage);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya tenemos una imagen, no generamos una nueva
    if (existingImage) {
      setImageUrl(existingImage);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function generate() {
      try {
        setIsLoading(true);
        setError(null);
        const url = await generateQuoteImage(apiKey, meditation);
        if (isMounted) {
          setImageUrl(url);
          // Notificar al padre de la nueva imagen generada
          if (onImageGenerated) {
            onImageGenerated(url);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error al generar la imagen');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    generate();

    return () => {
      isMounted = false;
    };
  }, [meditation, apiKey, existingImage, onImageGenerated]);

  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `meditacion-${meditation.book}-${meditation.chapter}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    try {
      // Convertir base64 a blob para compartir
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `meditacion-${meditation.book}-${meditation.chapter}.png`, {
        type: 'image/png'
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Meditación de Marco Aurelio',
          text: `"${meditation.text.substring(0, 100)}..." — Marco Aurelio, Libro ${meditation.book}`,
          files: [file]
        });
      } else {
        // Fallback: descargar la imagen
        handleDownload();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Si el usuario no canceló, descargar como fallback
        handleDownload();
      }
    }
  };

  const handleCopyText = () => {
    const text = `"${meditation.text}" — Marco Aurelio, Libro ${meditation.book}`;
    navigator.clipboard.writeText(text);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setImageUrl(null);

    generateQuoteImage(apiKey, meditation)
      .then(url => {
        setImageUrl(url);
        setIsLoading(false);
        // Notificar al padre de la nueva imagen generada
        if (onImageGenerated) {
          onImageGenerated(url);
        }
      })
      .catch(err => {
        setError(err.message || 'Error al generar la imagen');
        setIsLoading(false);
      });
  };

  return (
    <div className="share-image-modal">
      <div className="share-modal-header">
        <h3><Icon name="share" size={20} /> Compartir Meditación</h3>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="share-modal-content">
        <div className="image-container">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Generando imagen con IA...</p>
              <span className="loading-hint">Esto puede tardar unos segundos</span>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon"><Icon name="warning" size={26} /></span>
              <p>{error}</p>
              <button className="retry-btn" onClick={handleRetry}>
                <Icon name="refresh" size={16} />
                Reintentar
              </button>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="Imagen generada para la meditación"
              className="generated-image"
            />
          )}
        </div>

        <div className="quote-preview">
          <blockquote>
            "{meditation.text.length > 150
              ? meditation.text.substring(0, 150) + '...'
              : meditation.text}"
          </blockquote>
          <cite>— Libro {meditation.book}, {meditation.chapter}</cite>
        </div>

        <div className="share-actions">
          {imageUrl && (
            <>
              <button className="share-btn primary" onClick={handleShare}>
                <Icon name="share" /> Compartir
              </button>
              <button className="share-btn secondary" onClick={handleDownload}>
                <Icon name="download" /> Descargar
              </button>
            </>
          )}
          <button className="share-btn tertiary" onClick={handleCopyText}>
            <Icon name="copy" /> Copiar texto
          </button>
        </div>

        <p className="share-hint">
          La imagen se genera con Gemini AI basándose en el contenido de la meditación.
        </p>
      </div>
    </div>
  );
}

export default ShareImageModal;
