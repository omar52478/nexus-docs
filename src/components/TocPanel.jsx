import { useState, useEffect } from 'react';
import './TocPanel.css';

export default function TocPanel({ sections }) {
  const [activeId, setActiveId] = useState('');

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-70px 0px -80% 0px' }
    );

    sections.forEach((section) => {
      if (section.heading) {
        const id = section.heading.toLowerCase().replace(/\s+/g, '-');
        const element = document.getElementById(id);
        if (element) observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  if (!sections || sections.length === 0) return null;

  return (
    <aside className="toc-container">
      <div className="toc-card glass">
        {isMobile ? (
          <button 
            className="toc-mobile-toggle" 
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <span>On this page</span>
            <span className={`toc-chevron ${isMobileOpen ? 'open' : ''}`}>▼</span>
          </button>
        ) : (
          <span className="toc-label">On this page</span>
        )}
        
        {(!isMobile || isMobileOpen) && (
          <nav className="toc-nav">
            {sections.map((section, idx) => {
              if (!section.heading) return null;
              const id = section.heading.toLowerCase().replace(/\s+/g, '-');
              return (
                <a
                  key={idx}
                  href={`#${id}`}
                  className={`toc-link ${activeId === id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                      setActiveId(id);
                      if (isMobile) setIsMobileOpen(false);
                    }
                  }}
                >
                  {section.heading}
                </a>
              );
            })}
          </nav>
        )}
      </div>

      <div className="toc-card toc-help-card glass">
        <span className="toc-label">Need Help?</span>
        <p className="toc-help-text">Can't find what you're looking for? Check out our guides or contact support.</p>
        <a href="/docs/troubleshooting" className="toc-help-btn">
          Troubleshooting Guide
        </a>
      </div>
    </aside>
  );
}
