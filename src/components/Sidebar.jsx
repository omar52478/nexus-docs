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
      <div className="sidebar-content">
        {CATEGORIES.map((cat, idx) => (
          <div key={idx} className="sidebar-group">
            <h4 className="sidebar-group-label">
              <IconRenderer iconName={cat.icon} className="group-icon" />
              <span>{cat.name}</span>
            </h4>
            <div className="sidebar-links">
              {cat.links.map(page => {
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
        ))}
      </div>
    </aside>
  );
}
