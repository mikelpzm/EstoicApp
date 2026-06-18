import React, { useState } from 'react';
import Icon from './Icon';
import { validateApiKey } from '../services/geminiService';
import './ImageSettings.css';

function ImageSettings({ settings, onToggleEnabled, onSetApiKey, onClearApiKey, onClose }) {
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleToggle = () => {
    if (!settings.enabled && !settings.apiKey) {
      setValidationError('Introduce tu API key de Gemini primero');
      return;
    }
    onToggleEnabled(!settings.enabled);
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      setValidationError('La API key no puede estar vacía');
      return;
    }

    if (!validateApiKey(apiKeyInput.trim())) {
      setValidationError('El formato de la API key no parece válido. Debe empezar con "AIza"');
      return;
    }

    setValidationError('');
    onSetApiKey(apiKeyInput.trim());
  };

  const handleClearApiKey = () => {
    setApiKeyInput('');
    onClearApiKey();
    setValidationError('');
  };

  const maskedApiKey = settings.apiKey
    ? `${settings.apiKey.substring(0, 8)}${'•'.repeat(20)}${settings.apiKey.slice(-4)}`
    : '';

  return (
    <div className="image-settings" role="dialog" aria-modal="true" aria-label="Configuración de generación de imágenes">
      <div className="image-settings-header">
        <h3><Icon name="image" size={20} /> Generación de Imágenes</h3>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="image-settings-content">
        <p className="image-settings-description">
          Genera imágenes artísticas con IA para compartir las meditaciones en redes sociales.
          Necesitas una API key gratuita de Google Gemini.
        </p>

        <div className="image-settings-toggle">
          <label className="toggle-label">
            <span>Habilitar generación con IA</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleToggle}
                disabled={!settings.apiKey}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
          {!settings.apiKey && (
            <p className="toggle-hint">Configura tu API key para habilitar esta función</p>
          )}
        </div>

        <div className="api-key-section">
          <label className="api-key-label">
            <span>API Key de Gemini</span>
            {settings.apiKey ? (
              <div className="api-key-saved">
                <div className="api-key-display">
                  <code>{showApiKey ? settings.apiKey : maskedApiKey}</code>
                  <button
                    className="toggle-visibility-btn"
                    onClick={() => setShowApiKey(!showApiKey)}
                    type="button"
                    aria-label={showApiKey ? 'Ocultar API key' : 'Mostrar API key'}
                  >
                    <Icon name={showApiKey ? 'eyeOff' : 'eye'} size={18} />
                  </button>
                </div>
                <button
                  className="clear-api-key-btn"
                  onClick={handleClearApiKey}
                  type="button"
                >
                  Eliminar key
                </button>
              </div>
            ) : (
              <div className="api-key-input-group">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => {
                    setApiKeyInput(e.target.value);
                    setValidationError('');
                  }}
                  placeholder="AIzaSy..."
                  className="api-key-input"
                />
                <button
                  className="toggle-visibility-btn"
                  onClick={() => setShowApiKey(!showApiKey)}
                  type="button"
                  aria-label={showApiKey ? 'Ocultar API key' : 'Mostrar API key'}
                >
                  <Icon name={showApiKey ? 'eyeOff' : 'eye'} size={18} />
                </button>
                <button
                  className="save-api-key-btn"
                  onClick={handleSaveApiKey}
                  type="button"
                >
                  Guardar
                </button>
              </div>
            )}
          </label>

          {validationError && (
            <p className="validation-error">{validationError}</p>
          )}
        </div>

        <div className="api-key-info">
          <p>
            <strong>¿Cómo obtener una API key gratuita?</strong>
          </p>
          <ol>
            <li>Ve a <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
            <li>Inicia sesión con tu cuenta de Google</li>
            <li>Haz clic en "Create API Key"</li>
            <li>Copia la key y pégala aquí</li>
          </ol>
          <p className="api-key-note">
            Tu API key se guarda solo en tu dispositivo y nunca se envía a nuestros servidores.
          </p>
        </div>

        {settings.enabled && settings.apiKey && (
          <div className="feature-enabled-info">
            <Icon name="spark" size={22} />
            <p>
              La generación de imágenes está activa. Al compartir una meditación,
              se generará automáticamente una imagen artística.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageSettings;
