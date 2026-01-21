const CACHE_NAME = 'meditaciones-v1';
const BASE_PATH = '/EstoicApp/';

// Archivos a cachear para funcionamiento offline
const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de cache: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, la guardamos en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, buscamos en cache
        return caches.match(event.request);
      })
  );
});

// Función para obtener la meditación del día
function getDailyMeditation(meditations) {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  // Hash simple basado en la fecha
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % meditations.length;
  return meditations[index];
}

// Mostrar notificación de meditación
async function showMeditationNotification() {
  try {
    // Intentar obtener las meditaciones del cache o de la red
    const response = await fetch(BASE_PATH + 'data/meditations.json');
    const data = await response.json();
    const meditation = getDailyMeditation(data.meditations);

    const title = 'Meditación del Día';
    const options = {
      body: meditation.text.length > 150
        ? meditation.text.substring(0, 147) + '...'
        : meditation.text,
      icon: BASE_PATH + 'icons/icon-192.png',
      badge: BASE_PATH + 'icons/icon-72.png',
      tag: 'daily-meditation',
      renotify: true,
      requireInteraction: false,
      data: {
        url: BASE_PATH,
        meditationId: meditation.id
      },
      actions: [
        {
          action: 'open',
          title: 'Ver más'
        },
        {
          action: 'dismiss',
          title: 'Cerrar'
        }
      ]
    };

    await self.registration.showNotification(title, options);
  } catch (error) {
    console.error('Error al mostrar notificación:', error);
  }
}

// Escuchar mensaje para mostrar notificación
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    showMeditationNotification();
  }

  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    // Guardar la configuración de notificación
    const { hour, minute, enabled } = event.data;
    // Almacenar en IndexedDB o enviar al cliente para que maneje
    event.ports[0].postMessage({ success: true });
  }
});

// Manejar click en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Abrir la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(BASE_PATH) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data?.url || BASE_PATH);
        }
      })
  );
});

// Evento de push para notificaciones desde servidor (futuro)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(showMeditationNotification());
  }
});

// Periodic Background Sync para notificaciones programadas
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-meditation') {
    event.waitUntil(showMeditationNotification());
  }
});

console.log('Service Worker cargado');
