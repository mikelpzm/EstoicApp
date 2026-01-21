import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import DailyMeditation from './components/DailyMeditation';
import ThemeFilter from './components/ThemeFilter';
import MeditationList from './components/MeditationList';
import data from './data/meditations.json';
import './App.css';

function App() {
  const [view, setView] = useState('daily'); // 'daily' o 'explore'
  const [selectedTheme, setSelectedTheme] = useState(null);

  const { meditations, themes } = data;

  const meditationCounts = useMemo(() => {
    const counts = { total: meditations.length };
    themes.forEach(theme => {
      counts[theme.id] = meditations.filter(m => m.themes.includes(theme.id)).length;
    });
    return counts;
  }, [meditations, themes]);

  const handleShowDaily = () => {
    setView('daily');
    setSelectedTheme(null);
  };

  const handleShowAll = () => {
    setView('explore');
  };

  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
  };

  return (
    <div className="app">
      <Header onShowDaily={handleShowDaily} onShowAll={handleShowAll} />

      <main className="main-content">
        {view === 'daily' ? (
          <DailyMeditation meditations={meditations} themes={themes} />
        ) : (
          <>
            <ThemeFilter
              themes={themes}
              selectedTheme={selectedTheme}
              onSelectTheme={handleSelectTheme}
              meditationCounts={meditationCounts}
            />
            <MeditationList
              meditations={meditations}
              themes={themes}
              selectedTheme={selectedTheme}
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
