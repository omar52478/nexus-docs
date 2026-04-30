import { useState, useEffect } from 'react';
import { FaSun, FaMoon, FaMagnifyingGlass, FaBars, FaCube, FaFileLines } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_PAGES } from '../constants/navigation';
import SearchPalette from './SearchPalette';
import './Navbar.css';

export default function Navbar({ toggleMobile }) {
  const [theme, setTheme] = useState('dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [fullContent, setFullContent] = useState([]);

  // Index all pages
  useEffect(() => {
    const indexPages = async () => {
      try {
        const pagesData = await Promise.all(
          ALL_PAGES.map(async (page) => {
            const res = await fetch(`/pages/${page.id}.json`);
            if (!res.ok) return null;
            const data = await res.json();
            let allText = data.title + " ";
            data.sections.forEach(s => {
              if (s.heading) allText += s.heading + " ";
              if (s.content) allText += s.content + " ";
              if (s.alertContent) allText += s.alertContent + " ";
              if (s.code) allText += s.code + " ";
              if (s.list) allText += s.list.join(" ") + " ";
              if (s.steps) allText += s.steps.join(" ") + " ";
              if (s.rows) allText += s.rows.flat().join(" ") + " ";
            });
            return { ...page, fullText: allText.toLowerCase() };
          })
        );
        setFullContent(pagesData.filter(Boolean));
      } catch (err) {
        console.error("Indexing failed", err);
      }
    };
    indexPages();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.title = "Nexus Doc";
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <>
      <nav className="doc-navbar glass">
        <div className="nav-brand">
          <Link to="/" className="logo-container">
            <img src="/assets/images/logo.png" className="nav-logo-img" alt="Logo" />
            <div className="nav-title">
              <span className="nexus-text">NEXUS</span>
              <span className="nav-badge">DOCS</span>
            </div>
          </Link>
        </div>

        {/* Desktop Search */}
        {!isMobile && (
          <div className="nav-search" onClick={() => setIsSearchOpen(true)}>
            <div className="search-wrapper glass trigger">
              <FaMagnifyingGlass className="search-icon" size={16} />
              <span className="search-placeholder-text">Quick search documentation...</span>
              <kbd className="search-kbd">Ctrl K</kbd>
            </div>
          </div>
        )}

        <div className="nav-actions">
          {/* Mobile Search Icon */}
          {isMobile && (
            <button className="mobile-action-btn search-trigger" onClick={() => setIsSearchOpen(true)}>
              <FaMagnifyingGlass size={16} />
            </button>
          )}

          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>

          {isMobile && (
            <button className="mobile-toggle-top" onClick={toggleMobile}>
              <FaBars size={20} />
            </button>
          )}
        </div>
      </nav>

      <SearchPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        fullContent={fullContent}
      />
    </>
  );
}
