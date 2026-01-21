import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import DailyMeditation from './components/DailyMeditation';
import ThemeFilter from './components/ThemeFilter';
import BookFilter from './components/BookFilter';
import MeditationList from './components/MeditationList';
import MeditationCard from './components/MeditationCard';
import data from './data/meditations.json';
import './App.css';

function App() {
  const [view, setView] = useState('daily'); // 'daily', 'explore', 'random'
  const [filterType, setFilterType] = useState('theme'); // 'theme' o 'book'
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [randomMeditation, setRandomMeditation] = useState(null);

  const { meditations, themes } = data;

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
    setView('random');
  }, [meditations]);

  const handleAnotherRandom = () => {
    const randomIndex = Math.floor(Math.random() * meditations.length);
    setRandomMeditation(meditations[randomIndex]);
  };

  // Filtrar meditaciones según el filtro activo
  const filteredMeditations = useMemo(() => {
    if (filterType === 'theme' && selectedTheme) {
      return meditations.filter(m => m.themes.includes(selectedTheme));
    }
    if (filterType === 'book' && selectedBook) {
      return meditations.filter(m => m.book === selectedBook);
    }
    return meditations;
  }, [meditations, filterType, selectedTheme, selectedBook]);

  return (
    <div className="app">
      <Header
        onShowDaily={handleShowDaily}
        onShowAll={handleShowAll}
        onRandom={handleRandomMeditation}
      />

      <main className="main-content">
        {view === 'daily' ? (
          <DailyMeditation
            meditations={meditations}
            themes={themes}
            onRandom={handleRandomMeditation}
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
              <MeditationCard
                meditation={randomMeditation}
                themes={themes}
                isDaily={true}
              />
            )}

            <div className="daily-actions">
              <button className="action-btn" onClick={handleAnotherRandom}>
                <span>🎲</span> Otra aleatoria
              </button>
              <button className="action-btn" onClick={handleShowAll}>
                <span>📚</span> Explorar todas
              </button>
            </div>
          </section>
        ) : (
          <>
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
    </div>
  );
}

export default App;
