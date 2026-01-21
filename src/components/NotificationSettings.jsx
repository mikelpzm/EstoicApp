import React, { useState } from 'react';
import useNotifications from '../hooks/useNotifications';
import './NotificationSettings.css';

function NotificationSettings({ onClose }) {
  const {
    isSupported,
    permission,
    settings,
    toggleNotifications,
    updateSettings,
    sendTestNotification
  } = useNotifications();

  const [testSent, setTestSent] = useState(false);

  const handleToggle = async () => {
    const success = await toggleNotifications(!settings.enabled);
    if (!success && !settings.enabled) {
      alert('No se pudo activar las notificaciones. Por favor, permite las notificaciones en tu navegador.');
    }
  };

  const handleHourChange = (e) => {
    updateSettings({ hour: parseInt(e.target.value, 10) });
  };

  const handleMinuteChange = (e) => {
    updateSettings({ minute: parseInt(e.target.value, 10) });
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      alert('No se pudo enviar la notificación de prueba.');
    }
  };

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <div className="notification-header">
          <h3>Notificaciones</h3>
          <button className="close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>
        <div className="notification-content">
          <p className="notification-unsupported">
            Tu navegador no soporta notificaciones. Prueba con Chrome, Firefox o Edge en escritorio o móvil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <h3>Notificaciones Diarias</h3>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          <span>×</span>
        </button>
      </div>

      <div className="notification-content">
        <p className="notification-description">
          Recibe una meditación de Marco Aurelio cada día para comenzar tu jornada con sabiduría estoica.
        </p>

        {permission === 'denied' && (
          <div className="notification-warning">
            <span>⚠️</span>
            <p>
              Las notificaciones están bloqueadas. Ve a la configuración de tu navegador para permitirlas.
            </p>
          </div>
        )}

        <div className="notification-toggle">
          <label className="toggle-label">
            <span>Activar notificaciones</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleToggle}
                disabled={permission === 'denied'}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>

        {settings.enabled && (
          <div className="notification-time fade-in">
            <label className="time-label">
              <span>Hora de la meditación</span>
              <div className="time-inputs">
                <select
                  value={settings.hour}
                  onChange={handleHourChange}
                  className="time-select"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span className="time-separator">:</span>
                <select
                  value={settings.minute}
                  onChange={handleMinuteChange}
                  className="time-select"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <p className="time-hint">
              Recibirás una notificación a las {settings.hour.toString().padStart(2, '0')}:{settings.minute.toString().padStart(2, '0')} cada día.
            </p>
          </div>
        )}

        <div className="notification-actions">
          <button
            className="test-btn"
            onClick={handleTestNotification}
            disabled={permission === 'denied'}
          >
            {testSent ? '¡Enviada!' : 'Enviar prueba'}
          </button>
        </div>

        <div className="notification-info">
          <p>
            <strong>Nota:</strong> Las notificaciones funcionan mejor cuando la app está instalada.
            Para instalar, busca la opción "Instalar" o "Añadir a pantalla de inicio" en el menú de tu navegador.
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotificationSettings;
