import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import DailyMeditation from './components/DailyMeditation';
import ThemeFilter from './components/ThemeFilter';
import BookFilter from './components/BookFilter';
import MeditationList from './components/MeditationList';
import PracticePaths from './components/PracticePaths';
import NotificationSettings from './components/NotificationSettings';
import ImageSettings from './components/ImageSettings';
import ImageGenerator from './components/ImageGenerator';
import ShareImageModal from './components/ShareImageModal';
import useImageGeneration from './hooks/useImageGeneration';
import { matchesMeditation } from './utils/stoicLens';
import data from './data/meditations.json';
import './App.css';

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
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(JSON.parse(localStorage.getItem('stoic:favorites') || '[]')));
  const [readIds, setReadIds] = useState(() => new Set(JSON.parse(localStorage.getItem('stoic:read') || '[]')));

  const {
    settings: imageSettings,
    toggleEnabled: toggleImageEnabled,
    setApiKey,
    clearApiKey
  } = useImageGeneration();

  const { meditations, themes, bookContexts } = data;

  const toggleStoredId = useCallback((setter, storageKey, id) => {
    setter(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const handleToggleFavorite = useCallback((id) => {
    toggleStoredId(setFavoriteIds, 'stoic:favorites', id);
  }, [toggleStoredId]);

  const handleToggleRead = useCallback((id) => {
    toggleStoredId(setReadIds, 'stoic:read', id);
  }, [toggleStoredId]);

  const readingProgress = readIds.size === 0 ? 0 : Math.max(1, Math.round((readIds.size / meditations.length) * 100));

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

  const handleRandomMeditation = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * meditations.length);
    setRandomMeditation(meditations[randomIndex]);
    setRandomGeneratedImage(null);
    setView('random');
  }, [meditations]);

  const handleAnotherRandom = () => {
    const randomIndex = Math.floor(Math.random() * meditations.length);
    setRandomMeditation(meditations[randomIndex]);
    setRandomGeneratedImage(null);
  };

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
        isImageGenerationEnabled={imageSettings.enabled && imageSettings.apiKey}
      />

      <main className="main-content">
        <section className="hero-panel">
          <div>
            <span className="eyebrow">Estoicismo practicable</span>
            <h2>Lee menos como cita y más como entrenamiento.</h2>
            <p>Cada pasaje ahora puede abrirse como una práctica: idea núcleo, traducción a lenguaje sencillo, ejercicio, pregunta de diario y recordatorio breve.</p>
          </div>
          <div className="progress-card">
            <span className="progress-number">{readingProgress}%</span>
            <span className="progress-label">del corpus marcado como leído</span>
            <div className="progress-track"><span style={{ width: `${readingProgress}%` }} /></div>
            <small>{favoriteIds.size} favoritos · {readIds.size}/{meditations.length} lecturas</small>
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
              <p className="random-intro">
                Una reflexión al azar para tu momento presente
              </p>
            </div>

            {randomMeditation && (
              <>
                <MeditationCard
                  meditation={randomMeditation}
                  themes={themes}
                  bookContexts={bookContexts}
                  isDaily={false}
                  showContext={true}
                  isFavorite={favoriteIds.has(randomMeditation.id)}
                  isRead={readIds.has(randomMeditation.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleRead={handleToggleRead}
                />

                {imageSettings.enabled && imageSettings.apiKey && (
                  <ImageGenerator
                    meditation={randomMeditation}
                    apiKey={imageSettings.apiKey}
                    generatedImage={randomGeneratedImage}
                    onImageGenerated={setRandomGeneratedImage}
                  />
                )}
              </>
            )}

            <div className="daily-actions">
              <button className="action-btn" onClick={handleAnotherRandom}>
                <span>🎲</span> Otra aleatoria
              </button>
              {imageSettings.enabled && imageSettings.apiKey ? (
                <button className="action-btn share" onClick={() => setShowRandomShareModal(true)}>
                  <span>🖼️</span> Compartir con imagen
                </button>
              ) : (
                <button className="action-btn" onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Meditación de Marco Aurelio',
                      text: `"${randomMeditation.text}" — Marco Aurelio, Libro ${randomMeditation.book}`,
                    });
                  } else {
                    navigator.clipboard.writeText(`"${randomMeditation.text}" — Marco Aurelio, Libro ${randomMeditation.book}`);
                    alert('Meditación copiada al portapapeles');
                  }
                }}>
                  <span>📤</span> Compartir
                </button>
              )}
              <button className="action-btn" onClick={handleShowAll}>
                <span>📚</span> Explorar todas
              </button>
            </div>

            {showRandomShareModal && randomMeditation && (
              <div className="modal-overlay" onClick={() => setShowRandomShareModal(false)}>
                <div onClick={(e) => e.stopPropagation()}>
                  <ShareImageModal
                    meditation={randomMeditation}
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
                <span>⌕</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por idea: muerte, deber, ira, tiempo..."
                  aria-label="Buscar meditaciones"
                />
              </div>
              <button className={`toggle-pill ${onlyFavorites ? 'active' : ''}`} onClick={() => setOnlyFavorites(!onlyFavorites)}>
                ★ Solo favoritos
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
                <span>🏷️</span> Por Tema
              </button>
              <button
                className={`filter-tab ${filterType === 'book' ? 'active' : ''}`}
                onClick={() => {
                  setFilterType('book');
                  setSelectedTheme(null);
                }}
              >
                <span>📖</span> Por Libro
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
