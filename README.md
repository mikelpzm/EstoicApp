# Meditaciones - Marco Aurelio

Una Progressive Web App (PWA) elegante para explorar las meditaciones del emperador filósofo romano Marco Aurelio (121-180 d.C.).

## Características Principales

### Meditación del Día
- Cada día muestra una meditación diferente para reflexionar
- Selección determinista basada en la fecha (consistente durante todo el día)
- Opción de obtener una meditación aleatoria bajo demanda

### Explorar Meditaciones
- **Por temáticas**: Filtra las 80+ meditaciones por 10 categorías:
  - Virtud ⚖️
  - Muerte y Mortalidad 💀
  - Naturaleza 🌿
  - Deber y Responsabilidad 🏛️
  - Control Mental 🧠
  - Tiempo y Transitoriedad ⏳
  - Adversidad 🔥
  - Relaciones Humanas 🤝
  - Simplicidad 🪨
  - Sabiduría 📜

- **Por libros**: Navega por los 12 libros originales (I-XII)

### PWA - Aplicación Instalable
- **Instalar en dispositivo**: Añade la app a tu pantalla de inicio
- **Funciona offline**: Accede a las meditaciones sin conexión
- **Experiencia nativa**: Se comporta como una app nativa

### Sistema de Notificaciones
- Recibe recordatorios diarios de meditación
- Configura la hora que prefieras
- Compatible con iOS (Safari PWA), Chrome y Firefox
- Detección automática de plataforma

### Compartir
- Comparte fácilmente las meditaciones con otros
- Usa Web Share API nativo o copia al portapapeles

### Diseño
- **Tema oscuro**: Diseño elegante con acentos dorados
- **Responsive**: Funciona perfectamente en móvil y escritorio
- **Tipografía clásica**: Fuentes serif para una experiencia de lectura filosófica

## Tecnologías

- **React 19** - Framework de interfaz de usuario
- **Vite** - Build tool y servidor de desarrollo
- **CSS moderno** - Variables, Grid, Flexbox
- **Service Worker** - Cache y soporte offline
- **Web Notifications API** - Notificaciones nativas

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/mikelpzm/EstoicApp.git
cd EstoicApp

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción
npm run preview   # Previsualizar build
npm run lint      # Verificar código con ESLint
```

## Despliegue

El proyecto se despliega automáticamente en GitHub Pages mediante GitHub Actions cuando se hace push a la rama `main`.

**URL de la aplicación**: [https://mikelpzm.github.io/EstoicApp/](https://mikelpzm.github.io/EstoicApp/)

## Estructura del Proyecto

```
src/
├── components/          # Componentes React
├── hooks/               # Custom hooks
├── data/                # Datos de meditaciones
├── App.jsx              # Componente principal
└── main.jsx             # Punto de entrada

public/
├── manifest.json        # Configuración PWA
├── sw.js                # Service Worker
└── icons/               # Iconos de la app
```

## Sobre las Meditaciones

"Meditaciones" (Τὰ εἰς ἑαυτόν - "Cosas para sí mismo") es una serie de escritos personales del emperador romano Marco Aurelio, registrando sus reflexiones sobre la filosofía estoica. Originalmente escritas en griego antiguo entre el 170 y 180 d.C., la obra ha sido una fuente de sabiduría e inspiración durante casi dos milenios.

Marco Aurelio escribió estos textos como ejercicios espirituales personales, nunca con intención de publicarlos. Su honestidad y profundidad los convierte en una guía atemporal para la vida.

## Licencia

MIT
