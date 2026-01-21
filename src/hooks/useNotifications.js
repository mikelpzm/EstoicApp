import { useState, useEffect, useCallback } from 'react';

const NOTIFICATION_SETTINGS_KEY = 'meditation-notification-settings';
const BASE_PATH = '/EstoicApp/';

export function useNotifications() {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      enabled: false,
      hour: 8,
      minute: 0
    };
  });
  const [swRegistration, setSwRegistration] = useState(null);

  // Verificar soporte y registrar Service Worker
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);

      // Registrar Service Worker
      navigator.serviceWorker.register(BASE_PATH + 'sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration.scope);
          setSwRegistration(registration);
        })
        .catch((error) => {
          console.error('Error al registrar Service Worker:', error);
        });
    }
  }, []);

  // Guardar settings cuando cambien
  useEffect(() => {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));

    // Programar/cancelar notificaciones según configuración
    if (settings.enabled && swRegistration) {
      scheduleNotification();
    } else {
      cancelScheduledNotification();
    }
  }, [settings, swRegistration]);

  // Solicitar permiso de notificaciones
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error al solicitar permiso:', error);
      return false;
    }
  }, [isSupported]);

  // Enviar notificación de prueba
  const sendTestNotification = useCallback(async () => {
    if (permission !== 'granted' || !swRegistration) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      // Enviar mensaje al Service Worker para mostrar notificación
      if (swRegistration && swRegistration.active) {
        swRegistration.active.postMessage({ type: 'SHOW_NOTIFICATION' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      return false;
    }
  }, [permission, swRegistration, requestPermission]);

  // Programar notificación diaria
  const scheduleNotification = useCallback(() => {
    // Cancelar cualquier timeout existente
    cancelScheduledNotification();

    if (!settings.enabled) return;

    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(settings.hour, settings.minute, 0, 0);

    // Si ya pasó la hora hoy, programar para mañana
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    // Guardar el ID del timeout en localStorage para poder cancelarlo
    const timeoutId = setTimeout(() => {
      sendTestNotification();
      // Reprogramar para el día siguiente
      scheduleNotification();
    }, timeUntilNotification);

    // Almacenar el timeoutId para poder cancelarlo
    window._meditationNotificationTimeout = timeoutId;

    console.log(`Notificación programada para: ${scheduledTime.toLocaleString()}`);
  }, [settings, sendTestNotification]);

  // Cancelar notificación programada
  const cancelScheduledNotification = useCallback(() => {
    if (window._meditationNotificationTimeout) {
      clearTimeout(window._meditationNotificationTimeout);
      window._meditationNotificationTimeout = null;
    }
  }, []);

  // Actualizar configuración
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Habilitar/deshabilitar notificaciones
  const toggleNotifications = useCallback(async (enabled) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    updateSettings({ enabled });
    return true;
  }, [permission, requestPermission, updateSettings]);

  return {
    isSupported,
    permission,
    settings,
    requestPermission,
    sendTestNotification,
    updateSettings,
    toggleNotifications,
    swRegistration
  };
}

export default useNotifications;
