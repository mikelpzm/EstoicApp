import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import DailyMeditation from './components/DailyMeditation';
import MeditationCard from './components/MeditationCard';
import ThemeFilter from './components/ThemeFilter';
import BookFilter from './components/BookFilter';
import MeditationList from './components/MeditationList';
import PracticePaths from './components/PracticePaths';
import NotificationSettings from './components/NotificationSettings';
import ImageSettings from './components/ImageSettings';
import ImageGenerator from './components/ImageGenerator';
import ShareImageModal from './components/ShareImageModal';
import Icon from './components/Icon';
import useImageGeneration from './hooks/useImageGeneration';
import { matchesMeditation } from './utils/stoicLens';
import data from './data/meditations.json';
import './App.css';

function readStoredIdSet(storageKey) {
  try {
    const value = localStorage.getItem(storageKey);
    const parsed = value ? JSON.parse(value) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeStoredIds(storageKey, ids) {
  try {
    localStorage.setItem(storageKey, JSON.stringify([...ids]));
  } catch {
    // The app remains usable if private browsing blocks storage.
  }
}

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
    // Ignore storage failures; the interaction still completed.
  }
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function App() {
  const [view, setView] = useState('daily'); // 'daily', 'explore', 'random'
  const [filterType, setFilterType] = useState('theme'); // 'theme' o 'book'
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [randomMeditation, setRandomMeditation] = useState(null);
  const [randomGeneratedImage, setRandomGeneratedImage] = useState(null);
  const [showRandomShareModal, setShowRandomShareModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(() => readStoredIdSet('stoic:favorites'));
  const [readIds, setReadIds] = useState(() => readStoredIdSet('stoic:read'));
  const [lastPracticeDate, setLastPracticeDate] = useState(() => readStoredValue('stoic:last-practice-date'));

  const {
    settings: imageSettings,
    toggleEnabled: toggleImageEnabled,
    setApiKey,
    clearApiKey
  } = useImageGeneration();

  const meditations = useMemo(() => Array.isArray(data.meditations) ? data.meditations : [], []);
  const themes = useMemo(() => Array.isArray(data.themes) ? data.themes : [], []);
  const bookContexts = useMemo(() => data.bookContexts || {}, []);
  const hasMeditations = meditations.length > 0;

  const toggleStoredId = useCallback((setter, storageKey, id) => {
    setter(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeStoredIds(storageKey, next);
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback((id) => {
    toggleStoredId(setFavoriteIds, 'stoic:favorites', id);
  }, [toggleStoredId]);

  const handleToggleRead = useCallback((id) => {
    toggleStoredId(setReadIds, 'stoic:read', id);
    const todayKey = getLocalDateKey();
    setLastPracticeDate(todayKey);
    writeStoredValue('stoic:last-practice-date', todayKey);
  }, [toggleStoredId]);

  const readCount = useMemo(
    () => meditations.filter(meditation => readIds.has(meditation.id)).length,
    [meditations, readIds]
  );
  const favoriteCount = useMemo(
    () => meditations.filter(meditation => favoriteIds.has(meditation.id)).length,
    [meditations, favoriteIds]
  );
  const readingProgress = meditations.length === 0 ? 0 : Math.round((readCount / meditations.length) * 100);
  const practicedToday = lastPracticeDate === getLocalDateKey();

  const meditationCounts = useMemo(() => {
    const counts = { total: meditations.length };
    // Counts por tema
    themes.forEach(theme => {
      counts[theme.id] = meditations.filter(m => m.themes.includes(theme.id)).length;
    });
    // Counts por libro
    for (let book = 1; book <= 12; book++) {
      counts[book] = meditations.filter(m => m.book === book).length;
    }
    return counts;
  }, [meditations, themes]);

  const handleShowDaily = () => {
    setView('daily');
    setSelectedTheme(null);
    setSelectedBook(null);
  };

  const handleShowAll = () => {
    setView('explore');
  };

  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
    setSelectedBook(null);
  };

  const handleSelectBook = (bookNum) => {
    setSelectedBook(bookNum);
    setSelectedTheme(null);
  };

  const getRandomMeditation = useCallback((excludeId) => {
    if (!hasMeditations) return null;
    if (meditations.length === 1) return meditations[0];

    let nextMeditation = meditations[Math.floor(Math.random() * meditations.length)];
    let attempts = 0;
    while (nextMeditation?.id === excludeId && attempts < 8) {
      nextMeditation = meditations[Math.floor(Math.random() * meditations.length)];
      attempts += 1;
    }

    return nextMeditation || meditations[0];
  }, [hasMeditations, meditations]);

  const handleRandomMeditation = useCallback(() => {
    setRandomMeditation(previous => getRandomMeditation(previous?.id));
    setRandomGeneratedImage(null);
    setView('random');
  }, [getRandomMeditation]);

  const handleAnotherRandom = useCallback(() => {
    setRandomMeditation(previous => getRandomMeditation(previous?.id));
    setRandomGeneratedImage(null);
  }, [getRandomMeditation]);

  const handleShareMeditation = useCallback(async (meditation) => {
    if (!meditation) return;

    const shareText = `"${meditation.text}" — Marco Aurelio, Libro ${meditation.book}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Meditación de Marco Aurelio',
          text: shareText,
        });
        return;
      }

      await navigator.clipboard.writeText(shareText);
      alert('Meditación copiada al portapapeles');
    } catch (error) {
      if (error?.name !== 'AbortError' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert('Meditación copiada al portapapeles');
      }
    }
  }, []);

  const randomMeditationInCorpus = randomMeditation && meditations.some(meditation => meditation.id === randomMeditation.id);
  const activeRandomMeditation = view === 'random'
    ? (randomMeditationInCorpus ? randomMeditation : meditations[0] || null)
    : randomMeditation;

  // Filtrar meditaciones según el filtro activo
  const filteredMeditations = useMemo(() => {
    let result = meditations;
    if (filterType === 'theme' && selectedTheme) {
      result = result.filter(m => m.themes.includes(selectedTheme));
    }
    if (filterType === 'book' && selectedBook) {
      result = result.filter(m => m.book === selectedBook);
    }
    if (onlyFavorites) {
      result = result.filter(m => favoriteIds.has(m.id));
    }
    if (searchQuery.trim()) {
      result = result.filter(m => matchesMeditation(m, searchQuery));
    }
    return result;
  }, [meditations, filterType, selectedTheme, selectedBook, onlyFavorites, favoriteIds, searchQuery]);

  return (
    <div className="app">
      <Header
        onShowDaily={handleShowDaily}
        onShowAll={handleShowAll}
        onRandom={handleRandomMeditation}
        onPractice={() => setView('practice')}
        onNotifications={() => setShowNotifications(true)}
        onImageSettings={() => setShowImageSettings(true)}
        activeView={view}
        isImageGenerationEnabled={imageSettings.enabled && imageSettings.apiKey}
      />

      <main className="main-content">
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Estoicismo practicable</span>
            <h2>Lee menos como cita y más como entrenamiento.</h2>
            <p>Cada pasaje ahora puede abrirse como una práctica: idea núcleo, traducción a lenguaje sencillo, ejercicio, pregunta de diario y recordatorio breve.</p>
            <div className="ritual-steps" aria-label="Ritual diario sugerido">
              <span><Icon name="library" size={15} /> Leer</span>
              <span><Icon name="compass" size={15} /> Aplicar</span>
              <span><Icon name="pen" size={15} /> Escribir</span>
            </div>
          </div>
          <div className="progress-card">
            <span className={`practice-state ${practicedToday ? 'complete' : ''}`}>
              <Icon name={practicedToday ? 'check' : 'calendar'} size={15} />
              {practicedToday ? 'Práctica de hoy registrada' : 'Práctica de hoy pendiente'}
            </span>
            <span className="progress-number">{readingProgress}%</span>
            <span className="progress-label">del corpus marcado como leído</span>
            <div className="progress-track"><span style={{ width: `${readingProgress}%` }} /></div>
            <small>{favoriteCount} favoritos · {readCount}/{meditations.length} lecturas</small>
          </div>
        </section>

        {view === 'daily' ? (
          <DailyMeditation
            meditations={meditations}
            themes={themes}
            bookContexts={bookContexts}
            imageSettings={imageSettings}
            favoriteIds={favoriteIds}
            readIds={readIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleRead={handleToggleRead}
          />
        ) : view === 'random' ? (
          <section className="random-section fade-in">
            <div className="random-header">
              <span className="random-label">Meditación aleatoria</span>
              <h2>Un pasaje para el momento presente.</h2>
              <p className="random-intro">
                Sal del orden habitual, toma una sola idea y conviértela en conducta.
              </p>
            </div>

            {activeRandomMeditation ? (
              <>
                <MeditationCard
                  meditation={activeRandomMeditation}
                  themes={themes}
                  bookContexts={bookContexts}
                  isDaily={false}
                  showContext={true}
                  isFavorite={favoriteIds.has(activeRandomMeditation.id)}
                  isRead={readIds.has(activeRandomMeditation.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleRead={handleToggleRead}
                />

                {imageSettings.enabled && imageSettings.apiKey && (
                  <ImageGenerator
                    meditation={activeRandomMeditation}
                    apiKey={imageSettings.apiKey}
                    generatedImage={randomGeneratedImage}
                    onImageGenerated={setRandomGeneratedImage}
                  />
                )}
              </>
            ) : (
              <div className="empty-state random-empty">
                <Icon name="warning" size={30} />
                <h3>No hay meditaciones disponibles</h3>
                <p>El corpus no cargó ningún pasaje, pero la vista permanece estable.</p>
              </div>
            )}

            <div className="daily-actions">
              <button className="action-btn" onClick={handleAnotherRandom} disabled={!hasMeditations}>
                <Icon name="shuffle" /> Otra aleatoria
              </button>
              {imageSettings.enabled && imageSettings.apiKey ? (
                <button className="action-btn share" onClick={() => setShowRandomShareModal(true)} disabled={!activeRandomMeditation}>
                  <Icon name="image" /> Compartir con imagen
                </button>
              ) : (
                <button className="action-btn" onClick={() => handleShareMeditation(activeRandomMeditation)} disabled={!activeRandomMeditation}>
                  <Icon name="share" /> Compartir
                </button>
              )}
              <button className="action-btn" onClick={handleShowAll}>
                <Icon name="library" /> Explorar todas
              </button>
            </div>

            {showRandomShareModal && activeRandomMeditation && (
              <div className="modal-overlay" onClick={() => setShowRandomShareModal(false)}>
                <div onClick={(e) => e.stopPropagation()}>
                  <ShareImageModal
                    meditation={activeRandomMeditation}
                    apiKey={imageSettings.apiKey}
                    onClose={() => setShowRandomShareModal(false)}
                    existingImage={randomGeneratedImage}
                    onImageGenerated={setRandomGeneratedImage}
                  />
                </div>
              </div>
            )}
          </section>
        ) : view === 'practice' ? (
          <PracticePaths
            meditations={meditations}
            themes={themes}
            favoriteIds={favoriteIds}
            readIds={readIds}
            onToggleFavorite={handleToggleFavorite}
            onToggleRead={handleToggleRead}
          />
        ) : (
          <>
            <section className="explore-toolbar">
              <div className="search-box">
                <Icon name="search" size={18} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por idea: muerte, deber, ira, tiempo..."
                  aria-label="Buscar meditaciones"
                />
              </div>
              <button className={`toggle-pill ${onlyFavorites ? 'active' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)}>
                <Icon name="star" size={16} /> Solo favoritos
              </button>
            </section>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterType === 'theme' ? 'active' : ''}`}
                onClick={() => {
                  setFilterType('theme');
                  setSelectedBook(null);
                }}
              >
                <Icon name="tag" /> Por Tema
              </button>
              <button
                className={`filter-tab ${filterType === 'book' ? 'active' : ''}`}
                onClick={() => {
                  setFilterType('book');
                  setSelectedTheme(null);
                }}
              >
                <Icon name="book" /> Por Libro
              </button>
            </div>

            {filterType === 'theme' ? (
              <ThemeFilter
                themes={themes}
                selectedTheme={selectedTheme}
                onSelectTheme={handleSelectTheme}
                meditationCounts={meditationCounts}
              />
            ) : (
              <BookFilter
                selectedBook={selectedBook}
                onSelectBook={handleSelectBook}
                meditationCounts={meditationCounts}
              />
            )}

            <MeditationList
              meditations={filteredMeditations}
              themes={themes}
              selectedTheme={selectedTheme}
              selectedBook={selectedBook}
              favoriteIds={favoriteIds}
              readIds={readIds}
              onToggleFavorite={handleToggleFavorite}
              onToggleRead={handleToggleRead}
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p>
          <strong>Marco Aurelio</strong> (121-180 d.C.) — Emperador romano y filósofo estoico
        </p>
        <p className="footer-quote">
          "La vida de un hombre es lo que sus pensamientos hacen de ella"
        </p>
      </footer>

      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <NotificationSettings onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}

      {showImageSettings && (
        <div className="modal-overlay" onClick={() => setShowImageSettings(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ImageSettings
              settings={imageSettings}
              onToggleEnabled={toggleImageEnabled}
              onSetApiKey={setApiKey}
              onClearApiKey={clearApiKey}
              onClose={() => setShowImageSettings(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
