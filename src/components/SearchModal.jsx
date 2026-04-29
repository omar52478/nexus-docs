import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagnifyingGlass, FaXmark, FaFileLines, FaChevronRight } from 'react-icons/fa6';
import { ALL_PAGES } from '../constants/navigation';
import './SearchModal.css';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ');
    const filtered = ALL_PAGES.filter(page => {
      const titleMatch = page.title.toLowerCase().includes(query.toLowerCase());
      return titleMatch;
    }).slice(0, 8);

    setResults(filtered);
  }, [query]);

  const handleSelect = (id) => {
    navigate(`/docs/${id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="search-overlay" onClick={onClose}>
          <motion.div 
            className="search-modal glass"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="search-input-container">
              <FaMagnifyingGlass className="modal-search-icon" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search documentation..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose();
                  if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].id);
                }}
              />
              <button className="close-search" onClick={onClose}>
                <FaXmark />
              </button>
            </div>

            <div className="search-results">
              {results.length > 0 ? (
                results.map(result => (
                  <button 
                    key={result.id} 
                    className="search-result-item"
                    onClick={() => handleSelect(result.id)}
                  >
                    <div className="result-icon">
                      <FaFileLines />
                    </div>
                    <div className="result-info">
                      <span className="result-title">{result.title}</span>
                      <span className="result-path">Docs / {result.title}</span>
                    </div>
                    <FaChevronRight className="result-arrow" />
                  </button>
                ))
              ) : query.trim() ? (
                <div className="no-results">
                  No results found for "<strong>{query}</strong>"
                </div>
              ) : (
                <div className="search-placeholder">
                  <p>Try searching for "Calibration" or "API"</p>
                  <div className="search-hints">
                    <span className="hint"><kbd>Enter</kbd> to select</span>
                    <span className="hint"><kbd>Esc</kbd> to close</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
