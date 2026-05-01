import { NavLink, useLocation } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa6';
import * as FiIcons from 'react-icons/fi';
import { CATEGORIES } from '../constants/navigation';
import { useDoc } from '../context/DocContext';
import './Sidebar.css';

const IconRenderer = ({ iconName, ...props }) => {
  const Icon = FiIcons[iconName] || FiIcons.FiFileText;
  return <Icon {...props} />;
};

export default function Sidebar({ isOpen, closeMobile }) {
  const { currentSections } = useDoc();
  const location = useLocation();
  const isMobile = window.innerWidth <= 1024;

  return (
    <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close-btn" onClick={closeMobile} title="Close Menu">
        <FiIcons.FiX size={20} />
      </button>
      <div className="sidebar-content">
        <div className="sidebar-group" style={{ marginBottom: '24px' }}>
          <button 
            className="sidebar-download-btn" 
            onClick={() => window.open('https://drive.google.com/file/d/1l8dl3KJtxv0mDZkKILKpa6b9pkEYJEV7/view?usp=sharing', '_blank')}
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(129, 140, 248, 0.15) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              marginBottom: '16px'
            }}
          >
            <div className="btn-icon-wrap" style={{ background: '#38bdf8', color: '#020008' }}>
              <FiIcons.FiDownload />
            </div>
            <div className="btn-text-wrap">
              <span className="btn-label">LATEST STABLE</span>
              <span className="btn-title">Download v2.2 (.exe)</span>
            </div>
          </button>

          <NavLink to="/" className="sidebar-link" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <span className="page-icon">🏠</span>
            <span style={{ fontWeight: 700 }}>Back to Home</span>
          </NavLink>
        </div>

        {CATEGORIES.map((cat, idx) => {
          const filteredLinks = cat.links.filter(page => page.id !== 'landing');
          if (filteredLinks.length === 0) return null;

          return (
            <div key={idx} className="sidebar-group">
              <h4 className="sidebar-group-label">
                <IconRenderer iconName={cat.icon} className="group-icon" />
                <span>{cat.name}</span>
              </h4>
              <div className="sidebar-links">
                {filteredLinks.map(page => {
                  const isActive = location.pathname === `/docs/${page.id}`;
                  return (
                    <div key={page.id} className="sidebar-link-wrapper">
                      <NavLink 
                        to={`/docs/${page.id}`}
                        onClick={closeMobile}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                      >
                        <span className="page-icon">{page.icon}</span>
                        <span>{page.title}</span>
                        <FaChevronRight size={12} className={`link-arrow ${isActive ? 'rotated' : ''}`} />
                      </NavLink>
                      
                      {isActive && isMobile && currentSections.length > 0 && (
                        <div className="sidebar-sublinks">
                          {currentSections.map((section, sidx) => {
                            if (!section.heading) return null;
                            const sid = section.heading.toLowerCase().replace(/\s+/g, '-');
                            return (
                              <a 
                                key={sidx}
                                href={`#${sid}`}
                                className="sidebar-sublink"
                                onClick={(e) => {
                                  e.preventDefault();
                                  const el = document.getElementById(sid);
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth' });
                                    closeMobile();
                                  }
                                }}
                              >
                                {section.heading}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
