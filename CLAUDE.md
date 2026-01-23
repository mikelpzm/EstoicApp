# CLAUDE.md - Guía para Claude Code

## Descripción del Proyecto

EstoicApp es una Progressive Web Application (PWA) que presenta las meditaciones de Marco Aurelio en español. La aplicación permite a los usuarios explorar, filtrar y compartir textos filosóficos del emperador romano.

## Comandos de Desarrollo

```bash
npm install       # Instalar dependencias
npm run dev       # Servidor de desarrollo (Vite)
npm run build     # Build de producción
npm run preview   # Previsualizar build
npm run lint      # Ejecutar ESLint
```

## Estructura del Proyecto

```
/src
├── App.jsx                    # Componente principal, gestión de estado
├── App.css                    # Estilos principales
├── main.jsx                   # Punto de entrada React
├── components/
│   ├── Header.jsx             # Navegación principal
│   ├── DailyMeditation.jsx    # Vista de meditación diaria
│   ├── MeditationCard.jsx     # Tarjeta individual de meditación
│   ├── MeditationList.jsx     # Grid de meditaciones
│   ├── ThemeFilter.jsx        # Filtrado por temáticas
│   ├── BookFilter.jsx         # Filtrado por libros (I-XII)
│   └── NotificationSettings.jsx # Configuración de notificaciones
├── hooks/
│   └── useNotifications.js    # Hook para gestión de notificaciones
└── data/
    └── meditations.json       # Datos de las meditaciones

/public
├── manifest.json              # Manifest PWA
├── sw.js                      # Service Worker
├── icons/                     # Iconos de la app (72px-512px)
└── data/meditations.json      # Copia de datos para SW
```

## Arquitectura

### Stack Tecnológico
- **React 19** - Framework de UI
- **Vite** - Build tool y servidor de desarrollo
- **CSS3** - Variables CSS, Grid, Flexbox
- **Service Worker** - Cache y soporte offline

### Gestión de Estado
- Estado local con React hooks (useState, useMemo)
- localStorage para persistir configuración de notificaciones
- No se usa gestión de estado externa (Redux, Zustand)

### Sistema de Diseño
- Tema oscuro (#0f0f0f fondo)
- Acentos dorados (#c9a55c primario)
- Fuentes: Cormorant Garamond (títulos), Inter (cuerpo)

## Datos de Meditaciones

Estructura de cada meditación en `meditations.json`:

```json
{
  "id": 1,
  "book": 1,        // Libro I-XII
  "chapter": 1,     // Capítulo
  "text": "...",    // Texto de la meditación
  "themes": ["virtue", "wisdom"]  // Temáticas asignadas
}
```

### Temáticas Disponibles
- `virtue` - Virtud
- `death` - Muerte y Mortalidad
- `nature` - Naturaleza
- `duty` - Deber y Responsabilidad
- `mind` - Control Mental
- `time` - Tiempo y Transitoriedad
- `adversity` - Adversidad
- `relationships` - Relaciones Humanas
- `simplicity` - Simplicidad
- `wisdom` - Sabiduría

## Funcionalidades PWA

### Service Worker (sw.js)
- Estrategia Network-first con fallback a cache
- Cache de assets estáticos y datos
- Soporte para notificaciones en background

### Notificaciones
- Detección de plataforma (iOS Safari, Chrome, Firefox)
- Programación de hora configurable
- Soporte especial para iOS en modo PWA standalone

## Despliegue

El proyecto se despliega automáticamente en GitHub Pages mediante GitHub Actions.

- **URL base**: `/EstoicApp/`
- **Workflow**: `.github/workflows/deploy.yml`
- **Trigger**: Push a `main` o ramas `claude/*`

## Convenciones de Código

- Componentes funcionales con hooks
- Nombres de archivos en PascalCase para componentes
- CSS con variables para theming
- ESLint para linting de código

## Scripts de Utilidad

En `/scripts`:
- `extract_meditations.py` - Extrae meditaciones del PDF fuente
- `assign_themes.py` - Asigna temáticas automáticamente
- `fix_meditations.py` - Correcciones de texto
- `generate-icons.js` - Genera iconos de diferentes tamaños
