import React, { useMemo, useState } from 'react';
import MeditationCard from './MeditationCard';
import Icon from './Icon';
import { matchesMeditation } from '../utils/stoicLens';

const PATHS = [
  {
    id: 'ira',
    icon: 'flame',
    title: 'Cuando aparece la ira',
    promise: 'Separar juicio de impulso antes de responder.',
    themes: ['mind', 'relationships', 'virtue'],
    query: 'ira enfado censura insolente indiscreto enemigo injuria ofensa',
    practice: 'Antes de contestar, nombra el juicio que estás añadiendo: “esto me parece insoportable”. Luego rebájalo a hecho desnudo.',
    journal: '¿Qué parte de mi reacción dependía de mí y qué parte era solo ruido del momento?'
  },
  {
    id: 'ansiedad',
    icon: 'mind',
    title: 'Ansiedad y control',
    promise: 'Volver a lo que depende de ti cuando la mente se dispersa.',
    themes: ['mind', 'nature', 'time'],
    query: 'control miedo ansiedad futuro inquietud opinión juicio imaginación',
    practice: 'Haz una lista de dos columnas: hechos presentes / historias que estoy anticipando. Actúa solo sobre la primera.',
    journal: '¿Qué puedo hacer ahora con rectitud aunque el resultado no esté en mis manos?'
  },
  {
    id: 'memento',
    icon: 'skull',
    title: 'Memento mori',
    promise: 'Usar la mortalidad para limpiar prioridades, no para dramatizar.',
    themes: ['death', 'time', 'wisdom'],
    query: 'muerte mortalidad morir breve transitorio tiempo desaparecer ceniza',
    practice: 'Elige una preocupación y pregúntate si merecería espacio si esta semana fuese la última.',
    journal: '¿Qué estoy posponiendo que una vida breve vuelve evidente?'
  },
  {
    id: 'deber',
    icon: 'service',
    title: 'Deber y servicio',
    promise: 'Convertir el día en oficio: hacer lo que toca sin teatro.',
    themes: ['duty', 'virtue', 'relationships'],
    query: 'deber trabajo tarea servicio comunidad naturaleza obligación útil',
    practice: 'Identifica la próxima acción útil para otros y hazla sin reclamar reconocimiento.',
    journal: '¿Qué exige hoy mi papel concreto: hijo, pareja, amigo, profesional, ciudadano?'
  },
  {
    id: 'simplicidad',
    icon: 'stone',
    title: 'Simplicidad y sobriedad',
    promise: 'Quitar adornos para ver qué basta.',
    themes: ['simplicity', 'wisdom', 'mind'],
    query: 'simple lujo placer sobriedad necesidad riqueza deseo fama',
    practice: 'Reduce una elección de hoy a su forma mínima y suficiente. Observa si pierdes algo real.',
    journal: '¿Qué deseo parece necesario solo porque lo he repetido muchas veces?'
  }
];

function readStoredValue(storageKey, fallback = '') {
  try {
    return localStorage.getItem(storageKey) || fallback;
  } catch {
    return fallback;
  }
}

function writeStoredValue(storageKey, value) {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // Keep the practice usable when storage is unavailable.
  }
}

function scoreMeditation(meditation, path) {
  const themeScore = (meditation.themes || []).filter(theme => path.themes.includes(theme)).length * 3;
  const queryScore = path.query.split(/\s+/).filter(word => matchesMeditation(meditation, word)).length;
  return themeScore + queryScore;
}

export default function PracticePaths({
  meditations,
  themes,
  favoriteIds = new Set(),
  readIds = new Set(),
  onToggleFavorite,
  onToggleRead
}) {
  const [activePathId, setActivePathId] = useState(() => readStoredValue('stoic:active-path', PATHS[0].id));
  const [journal, setJournal] = useState(() => readStoredValue('stoic:practice-journal'));
  const [showAllPassages, setShowAllPassages] = useState(false);
  const activePath = PATHS.find(path => path.id === activePathId) || PATHS[0];

  const pathMeditations = useMemo(() => {
    return meditations
      .map(meditation => ({ meditation, score: scoreMeditation(meditation, activePath) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.meditation.book - b.meditation.book || a.meditation.chapter - b.meditation.chapter)
      .slice(0, 9)
      .map(item => item.meditation);
  }, [activePath, meditations]);

  const saveJournal = (value) => {
    setJournal(value);
    writeStoredValue('stoic:practice-journal', value);
  };

  const selectPath = (pathId) => {
    setActivePathId(pathId);
    setShowAllPassages(false);
    writeStoredValue('stoic:active-path', pathId);
  };

  const visiblePathMeditations = showAllPassages ? pathMeditations : pathMeditations.slice(0, 3);

  return (
    <section className="practice-section fade-in">
      <div className="practice-hero">
        <span className="eyebrow">Rutas de práctica</span>
        <h2>Elige un problema real y entra por ahí.</h2>
        <p>El estoicismo funciona mejor cuando se aplica a una situación concreta: ira, ansiedad, deber, muerte o deseo.</p>
      </div>

      <div className="path-grid" aria-label="Rutas estoicas">
        {PATHS.map(path => (
          <button
            key={path.id}
            className={`path-card ${path.id === activePath.id ? 'active' : ''}`}
            onClick={() => selectPath(path.id)}
            aria-pressed={path.id === activePath.id}
          >
            <span className="path-icon"><Icon name={path.icon} size={26} /></span>
            <strong>{path.title}</strong>
            <small>{path.promise}</small>
          </button>
        ))}
      </div>

      <div className="practice-plan">
        <div>
          <span className="eyebrow">Práctica de hoy</span>
          <h3><Icon name={activePath.icon} size={24} /> {activePath.title}</h3>
          <p>{activePath.practice}</p>
        </div>
        <label className="journal-box">
          <span>{activePath.journal}</span>
          <textarea
            value={journal}
            onChange={(event) => saveJournal(event.target.value)}
            placeholder="Escribe una respuesta breve. Se guarda solo en este dispositivo."
            rows={5}
          />
        </label>
      </div>

      <div className="list-header enhanced">
        <div>
          <h2>Pasajes recomendados</h2>
          <p>Lee tres: uno para entender, uno para practicar y uno para recordar durante el día.</p>
        </div>
        <span className="count">{visiblePathMeditations.length}/{pathMeditations.length} pasajes</span>
      </div>

      {pathMeditations.length === 0 ? (
        <div className="empty-state">
          <Icon name="warning" size={30} />
          <h3>No hay pasajes para esta ruta</h3>
          <p>La práctica sigue disponible; prueba otra ruta mientras se revisa el corpus.</p>
        </div>
      ) : (
        <div className="meditations-grid practice-results">
          {visiblePathMeditations.map(meditation => (
            <MeditationCard
              key={meditation.id}
              meditation={meditation}
              themes={themes}
              isFavorite={favoriteIds.has(meditation.id)}
              isRead={readIds.has(meditation.id)}
              onToggleFavorite={onToggleFavorite}
              onToggleRead={onToggleRead}
            />
          ))}
        </div>
      )}
      {pathMeditations.length > 3 && (
        <div className="practice-more-actions">
          <button className="action-btn" onClick={() => setShowAllPassages(value => !value)}>
            <Icon name={showAllPassages ? 'eyeOff' : 'eye'} />
            {showAllPassages ? 'Volver a tres pasajes' : `Ver ${pathMeditations.length - 3} pasajes más`}
          </button>
        </div>
      )}
    </section>
  );
}
