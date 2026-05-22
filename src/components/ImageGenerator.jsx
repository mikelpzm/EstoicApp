import React, { useState } from 'react';
import { generateQuoteImage } from '../services/geminiService';
import Icon from './Icon';
import './ImageGenerator.css';

function ImageGenerator({ meditation, apiKey, generatedImage, onImageGenerated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await generateQuoteImage(apiKey, meditation);
      onImageGenerated(url);
    } catch (err) {
      setError(err.message || 'Error al generar la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleGenerate();
  };

  // Si no hay imagen generada, mostrar solo el botón
  if (!generatedImage && !isLoading && !error) {
    return (
      <div className="image-generator">
        <button className="generate-btn" onClick={handleGenerate}>
          <Icon name="image" size={17} /> Generar imagen
        </button>
      </div>
    );
  }

  return (
    <div className="image-generator">
      <div className="generated-image-container">
        {isLoading ? (
          <div className="image-loading-state">
            <div className="image-loading-spinner"></div>
            <p>Generando imagen con IA...</p>
            <span className="image-loading-hint">Esto puede tardar unos segundos</span>
          </div>
        ) : error ? (
          <div className="image-error-state">
            <span className="image-error-icon"><Icon name="warning" size={28} /></span>
            <p>{error}</p>
            <button className="image-retry-btn" onClick={handleRetry}>
              <Icon name="refresh" size={16} />
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <img
              src={generatedImage}
              alt="Imagen generada para la meditación"
              className="inline-generated-image"
            />
            <button className="regenerate-btn" onClick={handleGenerate}>
              <Icon name="refresh" size={16} /> Regenerar imagen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ImageGenerator;
