import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCopy, FaCircleCheck, FaTriangleExclamation, FaCircleInfo, FaCircleExclamation, FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import * as FiIcons from 'react-icons/fi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TocPanel from '../components/TocPanel';
import { ALL_PAGES } from '../constants/navigation';
import { useDoc } from '../context/DocContext';
import './DocPage.css';

const IconRenderer = ({ iconName, ...props }) => {
  const Icon = FiIcons[iconName] || FiIcons.FiFileText;
  return <Icon {...props} />;
};

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function DocPage() {
  const { id } = useParams();
  const { setCurrentSections } = useDoc();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Pagination logic
  const pageIndex = ALL_PAGES.findIndex(p => p.id === id);
  const prevPage = pageIndex > 0 ? ALL_PAGES[pageIndex - 1] : null;
  const nextPage = pageIndex < ALL_PAGES.length - 1 ? ALL_PAGES[pageIndex + 1] : null;

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    fetch(`/pages/${id}.json`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(json => {
        // Normalize any 'items' to 'list' for backwards compatibility
        if (json.sections) {
          json.sections = json.sections.map(s => {
            if (s.items && !s.list) {
              return { ...s, list: s.items };
            }
            return s;
          });
        }
        setData(json);
        setCurrentSections(json.sections || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setCurrentSections([]);
        setLoading(false);
      });
      
    window.scrollTo(0, 0);

    return () => setCurrentSections([]);
  }, [id, setCurrentSections]);

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(idx);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;
  if (error) return <Navigate to="/docs/getting-started" replace />;
  if (!data) return null;

  return (
    <>
      <TocPanel sections={data.sections} />
      <motion.div 
        className="doc-page"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.header className="doc-header" variants={itemVariants}>
          <h1>{data.icon && <IconRenderer iconName={data.icon} className="doc-title-icon" />} {data.title}</h1>
        </motion.header>

        <div className="doc-content">
          {data.sections.map((section, idx) => (
            <motion.section 
              key={idx} 
              className="doc-section" 
              id={section.heading ? section.heading.toLowerCase().replace(/\s+/g, '-') : `section-${idx}`}
              variants={itemVariants}
            >
              {section.heading && <h2>{section.heading}</h2>}
              
              {section.content && (
                <p dangerouslySetInnerHTML={{ __html: section.content }}></p>
              )}

              {section.list && (
                <ul className="doc-list">
                  {section.list.map((item, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: item }}></li>
                  ))}
                </ul>
              )}

              {section.type === 'steps' && section.steps && (
                <ol className="doc-steps">
                  {section.steps.map((step, i) => (
                    <li key={i}>
                      <div className="step-number">{i + 1}</div>
                      <div dangerouslySetInnerHTML={{ __html: step }}></div>
                    </li>
                  ))}
                </ol>
              )}

              {section.type === 'table' && section.headers && section.rows && (
                <div className="table-wrapper">
                  <table className="doc-table">
                    <thead>
                      <tr>{section.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, i) => (
                        <tr key={i}>{row.map((cell, j) => <td key={j} dangerouslySetInnerHTML={{ __html: cell }}></td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.type === 'code' && section.code && (
                <div className="code-block-wrapper">
                  <div className="code-block-header">
                    <span className="lang-badge">{section.language || 'text'}</span>
                    <button 
                      className="copy-btn" 
                      onClick={() => copyToClipboard(section.code, idx)}
                    >
                      {copiedCode === idx ? <FaCircleCheck size={14} className="text-green-500" /> : <FaCopy size={14} />}
                      {copiedCode === idx ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <SyntaxHighlighter 
                    language={section.language || 'text'} 
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      borderTopLeftRadius: 0,
                      borderTopRightRadius: 0,
                      borderBottomLeftRadius: 'var(--radius-md)',
                      borderBottomRightRadius: 'var(--radius-md)',
                      fontSize: '0.9rem'
                    }}
                  >
                    {section.code}
                  </SyntaxHighlighter>
                </div>
              )}
              
              {section.type === 'alert' && (
                <div className={`alert-box alert-${section.alertType || 'info'}`}>
                  <div className="alert-icon mt-1">
                    {section.alertType === 'warning' && <FaTriangleExclamation size={16} />}
                    {section.alertType === 'error' && <FaCircleExclamation size={16} />}
                    {section.alertType === 'success' && <FaCircleCheck size={16} />}
                    {(!section.alertType || section.alertType === 'info') && <FaCircleInfo size={16} />}
                  </div>
                  <div className="alert-content" dangerouslySetInnerHTML={{ __html: section.alertContent }}></div>
                </div>
              )}
              
              {section.type === 'image' && (
                <figure className="doc-image">
                  <img src={section.src} alt={section.alt || ''} />
                  {section.caption && <figcaption>{section.caption}</figcaption>}
                </figure>
              )}
              
              {section.type === 'gallery' && (
                <div className={`gallery gallery-${section.layout || 'grid-2'}`}>
                  {(section.images || []).map((img, i) => (
                    <figure key={i} className="gallery-item">
                       <img src={img.src} alt={img.alt || ''} />
                       {img.caption && <figcaption>{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </motion.section>
          ))}
        </div>

        {/* Pagination */}
        <div className="doc-pagination">
          {prevPage ? (
            <Link to={`/docs/${prevPage.id}`} className="pagination-card prev glass">
              <div className="pagination-icon"><FaArrowLeft /></div>
              <div className="pagination-info">
                <span className="pagination-label">Previous</span>
                <span className="pagination-title">{prevPage.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextPage ? (
            <Link to={`/docs/${nextPage.id}`} className="pagination-card next glass">
              <div className="pagination-info">
                <span className="pagination-label">Next</span>
                <span className="pagination-title">{nextPage.title}</span>
              </div>
              <div className="pagination-icon"><FaArrowRight /></div>
            </Link>
          ) : <div />}
        </div>
      </motion.div>
    </>
  );
}
