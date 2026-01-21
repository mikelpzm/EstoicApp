import React from 'react';

const BOOK_NAMES = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};

export default function BookFilter({ selectedBook, onSelectBook, meditationCounts }) {
  return (
    <div className="book-filter">
      <h2 className="filter-title">Explorar por libro</h2>
      <div className="book-grid">
        <button
          className={`book-btn ${selectedBook === null ? 'active' : ''}`}
          onClick={() => onSelectBook(null)}
        >
          <span className="book-name">Todos</span>
          <span className="book-count">{meditationCounts.total}</span>
        </button>

        {Object.entries(BOOK_NAMES).map(([num, roman]) => (
          <button
            key={num}
            className={`book-btn ${selectedBook === parseInt(num) ? 'active' : ''}`}
            onClick={() => onSelectBook(parseInt(num))}
          >
            <span className="book-roman">{roman}</span>
            <span className="book-count">{meditationCounts[num] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
