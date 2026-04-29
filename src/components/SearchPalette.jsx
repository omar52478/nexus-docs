import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMagnifyingGlass, FaXmark, FaFileLines, FaChevronRight, FaHashtag, FaBook, FaCode, FaMicrochip } from 'react-icons/fa6';
import * as FiIcons from 'react-icons/fi';
import { ALL_PAGES } from '../constants/navigation';
import './SearchPalette.css';

const IconRenderer = ({ iconName, ...props }) => {
  const Icon = FiIcons[iconName] || FiIcons.FiFileText;
  return <Icon {...props} />;
};

export default function SearchPalette({ isOpen, onClose, fullContent }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const searchTerms = q.split(' ').filter(Boolean);
    
    const scored = fullContent.map(page => {
      let score = 0;
      
      // Title match (highest priority)
      if (page.title.toLowerCase() === q) score += 1000;
      else if (page.title.toLowerCase().includes(q)) score += 500;
      
      // Count matches in full text
      const contentMatches = (page.fullText.match(new RegExp(q, 'g')) || []).length;
      score += contentMatches * 10;
      
      // ID match
      if (page.id.toLowerCase().includes(q)) score += 50;

      if (score === 0) return null;

      // Find best snippet
      const idx = page.fullText.indexOf(q);
      const start = Math.max(0, idx - 40);
      const end = Math.min(page.fullText.length, idx + 80);
      let snippet = page.fullText.substring(start, end).replace(/<[^>]*>/g, '');
      if (start > 0) snippet = "..." + snippet;
      if (end < page.fullText.length) snippet = snippet + "...";

      return { ...page, score, snippet };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 10);

    setResults(scored);
    setSelectedIndex(0);
  }, [query, fullContent]);

  const highlightText = (text, target) => {
    if (!target.trim()) return text;
    const parts = text.split(new RegExp(`(${target})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === target.toLowerCase() 
        ? <mark key={i} className="highlight">{part}</mark> 
        : part
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[selectedIndex].id);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (id) => {
    navigate(`/docs/${id}`);
    onClose();
  };

  // Group results by category (just a mock grouping for now based on titles or IDs)
  const categories = results.reduce((acc, curr) => {
    const cat = curr.category || 'Documentation';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="palette-overlay" onClick={onClose}>
          <motion.div 
            className="palette-modal"
            initial={{ opacity: 0, scale: 0.95, y: -40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="palette-header">
              <FaMagnifyingGlass className="palette-search-icon" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search documentation..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="palette-esc">ESC</div>
            </div>

            <div className="palette-body">
              {results.length > 0 ? (
                Object.entries(categories).map(([catName, items]) => (
                  <div key={catName} className="palette-section">
                    <h3 className="palette-section-title">{catName}</h3>
                    <div className="palette-items">
                      {items.map((item, idx) => {
                        const globalIdx = results.indexOf(item);
                        const isSelected = globalIdx === selectedIndex;
                        return (
                          <button 
                            key={item.id}
                            className={`palette-item ${isSelected ? 'selected' : ''}`}
                            onMouseEnter={() => setSelectedIndex(globalIdx)}
                            onClick={() => handleSelect(item.id)}
                          >
                            <div className="palette-item-icon">
                              <IconRenderer iconName={item.icon} />
                            </div>
                            <div className="palette-item-content">
                              <div className="palette-item-title">
                                {highlightText(item.title, query)}
                              </div>
                              <div className="palette-item-snippet">
                                {highlightText(item.snippet, query)}
                              </div>
                            </div>
                            <FaChevronRight className="palette-item-arrow" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : query.trim() ? (
                <div className="palette-no-results">
                  <div className="no-results-icon">∅</div>
                  <p>No results for "<strong>{query}</strong>"</p>
                  <span>Try searching for something else</span>
                </div>
              ) : (
                <div className="palette-placeholder">
                  <div className="placeholder-grid">
                    <div className="placeholder-group">
                      <h4>Popular</h4>
                      <button onClick={() => setQuery('getting started')}>Getting Started</button>
                      <button onClick={() => setQuery('vision system')}>Vision System</button>
                      <button onClick={() => setQuery('api')}>API Reference</button>
                    </div>
                    <div className="placeholder-group">
                      <h4>Resources</h4>
                      <button onClick={() => window.open('https://github.com', '_blank')}>GitHub Repository</button>
                      <button onClick={() => window.open('https://discord.com', '_blank')}>Community Discord</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="palette-footer">
              <div className="footer-hint">
                <kbd>↵</kbd> <span>to select</span>
              </div>
              <div className="footer-hint">
                <kbd>↑</kbd> <kbd>↓</kbd> <span>to navigate</span>
              </div>
              <div className="footer-hint">
                <kbd>esc</kbd> <span>to close</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
