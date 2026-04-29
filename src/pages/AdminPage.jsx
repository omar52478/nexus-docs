import { useState, useEffect, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { ALL_PAGES, CATEGORIES } from '../constants/navigation';
import './AdminPage.css';

const IconRenderer = ({ iconName, ...props }) => {
  const Icon = FiIcons[iconName] || FiIcons.FiFileText;
  return <Icon {...props} />;
};

const AutoSizeTextarea = ({ value, onChange, placeholder, className, style }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea ref={textareaRef} value={value} onChange={onChange} placeholder={placeholder} className={className} style={{ ...style, overflow: 'hidden' }} rows={1} />
  );
};

// --- Advanced Block Editors ---

const TableEditor = ({ section, updateSection }) => {
  const headers = section.headers || ['Column 1', 'Column 2'];
  const rows = section.rows && section.rows.length > 0 ? section.rows : [['', '']];

  const updateHeader = (cIdx, val) => {
    const newH = [...headers];
    newH[cIdx] = val;
    updateSection('headers', newH);
  };
  const updateCell = (rIdx, cIdx, val) => {
    const newR = [...rows];
    newR[rIdx] = [...newR[rIdx]];
    newR[rIdx][cIdx] = val;
    updateSection('rows', newR);
  };
  const addCol = () => {
    updateSection('headers', [...headers, `Col ${headers.length + 1}`]);
    updateSection('rows', rows.map(r => [...r, '']));
  };
  const removeCol = (cIdx) => {
    if (headers.length <= 1) return;
    updateSection('headers', headers.filter((_, i) => i !== cIdx));
    updateSection('rows', rows.map(r => r.filter((_, i) => i !== cIdx)));
  };
  const addRow = () => updateSection('rows', [...rows, Array(headers.length).fill('')]);
  const removeRow = (rIdx) => {
    if (rows.length <= 1) return;
    updateSection('rows', rows.filter((_, i) => i !== rIdx));
  };

  return (
    <div className="cms-complex-editor">
      <div className="cms-table-wrapper">
        <table className="cms-editor-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>
                  <div className="cms-table-cell-header">
                    <input value={h} onChange={e => updateHeader(i, e.target.value)} placeholder={`Header ${i+1}`} />
                    <button className="cms-icon-btn danger" onClick={() => removeCol(i)} title="Remove Column"><FiIcons.FiTrash2 size={12} /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx}>
                    <AutoSizeTextarea value={cell} onChange={e => updateCell(rIdx, cIdx, e.target.value)} placeholder="..." className="cms-input cms-table-input" />
                  </td>
                ))}
                <td style={{ width: 40, border: 'none', background: 'transparent', textAlign: 'center' }}>
                   <button className="cms-icon-btn danger" onClick={() => removeRow(rIdx)} title="Remove Row"><FiIcons.FiTrash2 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="cms-btn-outline" onClick={addCol}><FiIcons.FiPlus size={14} /> Add Column</button>
        <button className="cms-btn-outline" onClick={addRow}><FiIcons.FiPlus size={14} /> Add Row</button>
      </div>
    </div>
  );
};

const ListEditor = ({ section, listKey, updateSection }) => {
  const items = section[listKey] || [''];
  const updateItem = (i, val) => {
    const newItems = [...items];
    newItems[i] = val;
    updateSection(listKey, newItems);
  };
  const addItem = () => updateSection(listKey, [...items, '']);
  const removeItem = (i) => updateSection(listKey, items.filter((_, idx) => idx !== i));

  return (
    <div className="cms-complex-editor">
      {items.map((item, i) => (
        <div key={i} className="cms-list-item-edit">
          <div className="cms-list-bullet">{listKey === 'steps' ? `${i+1}.` : '•'}</div>
          <AutoSizeTextarea value={item} onChange={e => updateItem(i, e.target.value)} placeholder="List item content..." className="cms-input" style={{ flex: 1, minHeight: 40 }} />
          <button className="cms-icon-btn danger" onClick={() => removeItem(i)}><FiIcons.FiX /></button>
        </div>
      ))}
      <button className="cms-btn-outline mt-2" onClick={addItem}><FiIcons.FiPlus size={14} /> Add Item</button>
    </div>
  );
};

const GalleryEditor = ({ section, updateSection }) => {
  const images = section.images || [];
  const updateImage = (i, field, val) => {
    const newImgs = [...images];
    newImgs[i] = { ...newImgs[i], [field]: val };
    updateSection('images', newImgs);
  };
  const addImage = () => updateSection('images', [...images, { src: '', caption: '' }]);
  const removeImage = (i) => updateSection('images', images.filter((_, idx) => idx !== i));

  return (
    <div className="cms-complex-editor">
      <div className="cms-gallery-grid">
        {images.map((img, i) => (
          <div key={i} className="cms-gallery-item-edit">
            <button className="cms-icon-btn danger absolute top-2 right-2" onClick={() => removeImage(i)}><FiIcons.FiX /></button>
            <div className="cms-field">
               <label>Image URL</label>
               <input className="cms-input" value={img.src || ''} onChange={e => updateImage(i, 'src', e.target.value)} placeholder="https://..." />
            </div>
            <div className="cms-field">
               <label>Caption (Optional)</label>
               <input className="cms-input" value={img.caption || ''} onChange={e => updateImage(i, 'caption', e.target.value)} placeholder="Enter caption..." />
            </div>
          </div>
        ))}
      </div>
      <button className="cms-btn-outline mt-4" onClick={addImage}><FiIcons.FiImage size={14} /> Add Image</button>
    </div>
  );
};

const MediaEditor = ({ section, updateSection, type }) => {
  return (
    <div className="cms-complex-editor">
      <div className="cms-field mb-4">
        <label>{type === 'video' ? 'Video URL (YouTube/Vimeo/MP4)' : 'Image URL'}</label>
        <input className="cms-input" value={section.src || ''} onChange={e => updateSection('src', e.target.value)} placeholder="https://..." />
      </div>
      <div className="cms-field">
        <label>{type === 'video' ? 'Video Title' : 'Image Caption'}</label>
        <input className="cms-input" value={section.caption || section.title || ''} onChange={e => updateSection(type === 'video' ? 'title' : 'caption', e.target.value)} placeholder="Enter description..." />
      </div>
    </div>
  );
};

const getTypeColor = (type) => {
  switch(type) {
    case 'code': return '#a855f7';
    case 'alert': return '#eab308';
    case 'image': 
    case 'video': 
    case 'gallery': return '#ec4899';
    case 'table': return '#10b981';
    case 'list': 
    case 'steps': return '#f97316';
    case 'text':
    default: return '#3b82f6';
  }
};

// --- Main Page Component ---

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('nexus-admin-auth') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeBlock, setActiveBlock] = useState(null);

  useEffect(() => {
    Promise.all(
      ALL_PAGES.map(page => {
        const local = localStorage.getItem(`nexus-cms-${page.id}`);
        if (local) return Promise.resolve(JSON.parse(local));
        return fetch(`/pages/${page.id}.json`).then(r => r.ok ? r.json() : null).catch(() => null);
      })
    ).then(results => {
      const validPages = results.filter(Boolean).map(page => ({
        ...page,
        sections: (page.sections || []).map((s, i) => {
          if (s.items && !s.list) {
            s.list = s.items;
          }
          let computedType = s.type;
          if (!computedType) {
            if (s.list) computedType = 'list';
            else if (s.steps) computedType = 'steps';
            else computedType = 'text';
          }
          return { ...s, type: computedType, id: s.id || `init-${i}-${Date.now()}` };
        })
      }));
      setPages(validPages);
      if (validPages.length > 0) handleSelectPage(validPages[0]);
    });
  }, []);

  const handleSelectPage = (page) => {
    setSelectedPage(page.id);
    setFormData(JSON.parse(JSON.stringify(page)));
    setHasChanges(false);
    setActiveBlock(null);
  };

  const handleSave = () => {
    if (!formData) return;
    localStorage.setItem(`nexus-cms-${formData.id}`, JSON.stringify(formData));
    setPages(prev => prev.map(p => p.id === formData.id ? formData : p));
    setHasChanges(false);
    alert('Document synchronized successfully.');
  };

  const handleReset = async () => {
    if (!formData) return;
    if (!window.confirm(`Are you sure you want to discard local changes for "${formData.title}" and reload from the original file?`)) return;
    
    localStorage.removeItem(`nexus-cms-${formData.id}`);
    
    try {
      const res = await fetch(`/pages/${formData.id}.json`);
      if (res.ok) {
        let page = await res.json();
        page = {
          ...page,
          sections: (page.sections || []).map((s, i) => {
            if (s.items && !s.list) {
              s.list = s.items;
            }
            let computedType = s.type;
            if (!computedType) {
              if (s.list) computedType = 'list';
              else if (s.steps) computedType = 'steps';
              else computedType = 'text';
            }
            return { ...s, type: computedType, id: s.id || `init-${i}-${Date.now()}` };
          })
        };
        setPages(prev => prev.map(p => p.id === page.id ? page : p));
        setFormData(JSON.parse(JSON.stringify(page)));
        setHasChanges(false);
        setActiveBlock(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addBlock = (type) => {
    const newBlock = { heading: '', content: '', type, id: `block-${Date.now()}` };
    if (type === 'gallery') { newBlock.images = []; newBlock.layout = 'grid-2'; }
    if (type === 'table') { newBlock.headers = ['Col 1', 'Col 2']; newBlock.rows = [['', '']]; newBlock.theme = 'default'; }
    if (type === 'steps') newBlock.steps = [''];
    if (type === 'list') newBlock.list = [''];
    
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newBlock] }));
    setHasChanges(true);
    setActiveBlock(formData.sections.length);
  };

  const updateBlock = (idx, field, value) => {
    const newSections = [...formData.sections];
    newSections[idx] = { ...newSections[idx], [field]: value };
    setFormData({ ...formData, sections: newSections });
    setHasChanges(true);
  };

  const removeBlock = (idx) => {
    const newSections = formData.sections.filter((_, i) => i !== idx);
    setFormData({ ...formData, sections: newSections });
    setHasChanges(true);
    setActiveBlock(null);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'nexus2026') {
      sessionStorage.setItem('nexus-admin-auth', 'true');
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid credentials');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cms-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="cms-complex-editor" style={{ width: 400, padding: 40, textAlign: 'center' }}>
           <FiIcons.FiCommand size={48} color="#38bdf8" style={{ marginBottom: 16 }} />
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>Nexus CMS</h2>
           <p style={{ color: '#94a3b8', marginBottom: 32 }}>Sign in to manage documentation</p>
           <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" placeholder="Username" className="cms-input" value={username} onChange={e => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" className="cms-input" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="submit" className="cms-btn cms-btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}>Enter Editor</button>
              {loginError && <p style={{ color: '#ef4444', fontSize: 12 }}>{loginError}</p>}
           </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cms-layout">
      {/* Sidebar */}
      <aside className="cms-sidebar">
        <div className="cms-brand"><FiIcons.FiCommand size={20} /> Nexus CMS</div>
        <div className="cms-nav">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="cms-nav-group">
              <div className="cms-nav-title">{cat.name}</div>
              {pages.filter(p => (p.category || 'Basics') === cat.name).map(p => (
                <div key={p.id} className={`cms-nav-item ${selectedPage === p.id ? 'active' : ''}`} onClick={() => handleSelectPage(p)}>
                  <IconRenderer iconName={p.icon} size={16} /> {p.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="cms-main">
        {/* Topbar */}
        <header className="cms-topbar">
          <div className="cms-breadcrumb">
            <span className="cms-breadcrumb-cat">{formData?.category || 'Category'}</span>
            <span className="cms-breadcrumb-sep"><FiIcons.FiChevronRight size={14} /></span>
            <span className="cms-breadcrumb-page">{formData?.title || 'Page'}</span>
          </div>
          <div className="cms-topbar-actions">
            {hasChanges && <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600, paddingRight: 10 }}>● Unsaved Changes</span>}
            <button className="cms-btn cms-btn-secondary" onClick={() => window.open(`${window.location.origin}/docs/${selectedPage}?preview=true`, '_blank')}><FiIcons.FiExternalLink /> Preview</button>
            <button className="cms-btn cms-btn-primary" onClick={handleSave} disabled={!hasChanges} style={{ opacity: hasChanges ? 1 : 0.5 }}><FiIcons.FiSave /> Publish</button>
          </div>
        </header>

        <div className="cms-workspace">
          {/* Canvas */}
          <div className="cms-canvas" onClick={() => setActiveBlock(null)}>
            {formData ? (
              <div className="cms-canvas-inner" onClick={e => e.stopPropagation()}>
                <input 
                  className="cms-page-title-input"
                  value={formData.title}
                  onChange={e => { setFormData({...formData, title: e.target.value}); setHasChanges(true); }}
                  placeholder="Document Title"
                />

                <Reorder.Group axis="y" values={formData.sections} onReorder={(vals) => { setFormData({...formData, sections: vals}); setHasChanges(true); }} className="cms-block-list">
                  <AnimatePresence>
                    {formData.sections.map((block, idx) => (
                      <Reorder.Item 
                        key={block.id} 
                        value={block}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`cms-block-card ${activeBlock === idx ? 'active' : ''}`}
                        onClick={() => setActiveBlock(idx)}
                      >
                        <div className="cms-block-card-inner" style={{ 
                          backgroundColor: block.bgStyle === 'muted' ? '#0f172a' : 'var(--cms-panel)',
                          borderLeft: `4px solid ${getTypeColor(block.type)}`
                        }}>
                          <div className="cms-block-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div className="cms-block-drag"><FiIcons.FiMoreVertical size={16}/></div>
                              <span className="cms-block-type" style={{ color: getTypeColor(block.type) }}>
                                {(block.type || 'text').toUpperCase()}
                              </span>
                            </div>
                            <button className="cms-icon-btn danger" onClick={(e) => { e.stopPropagation(); removeBlock(idx); }}><FiIcons.FiTrash2 size={16} /></button>
                          </div>

                          <div className="cms-block-body">
                            <input 
                              className="cms-input cms-h2"
                              value={block.heading || ''}
                              onChange={e => updateBlock(idx, 'heading', e.target.value)}
                              placeholder="Section Heading (Optional)"
                            />
                            
                            {['text', 'list', 'steps'].includes(block.type) && (
                              <div style={{ marginBottom: 12 }}>
                                {block.type !== 'text' && <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--cms-text-muted)', marginBottom: 6, fontWeight: 600 }}>Introduction Paragraph (Optional)</label>}
                                <AutoSizeTextarea 
                                  className="cms-input cms-textarea"
                                  value={block.content || ''}
                                  onChange={e => updateBlock(idx, 'content', e.target.value)}
                                  placeholder="Write your content here... (HTML allowed)"
                                />
                              </div>
                            )}

                            {block.type === 'code' && (
                              <div className="cms-complex-editor">
                                 <input className="cms-input mb-2" style={{ fontFamily: 'monospace', color: '#38bdf8' }} placeholder="Language (e.g., python, js)" value={block.language || ''} onChange={e => updateBlock(idx, 'language', e.target.value)} />
                                 <AutoSizeTextarea className="cms-input cms-textarea cms-code-editor" value={block.code || ''} onChange={e => updateBlock(idx, 'code', e.target.value)} placeholder="Paste code snippet here..." />
                              </div>
                            )}

                            {block.type === 'alert' && (
                              <div className="cms-complex-editor" style={{ borderLeft: `4px solid ${block.alertType === 'warning' ? '#f59e0b' : block.alertType === 'error' ? '#ef4444' : '#38bdf8'}` }}>
                                 <select className="cms-input mb-2" value={block.alertType || 'info'} onChange={e => updateBlock(idx, 'alertType', e.target.value)}>
                                    <option value="info">Info</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                    <option value="success">Success</option>
                                 </select>
                                 <AutoSizeTextarea className="cms-input cms-textarea" value={block.alertContent || ''} onChange={e => updateBlock(idx, 'alertContent', e.target.value)} placeholder="Alert message..." />
                              </div>
                            )}

                            {block.type === 'table' && <TableEditor section={block} updateSection={(f, v) => updateBlock(idx, f, v)} />}
                            {block.type === 'list' && <ListEditor section={block} listKey="list" updateSection={(f, v) => updateBlock(idx, f, v)} />}
                            {block.type === 'steps' && <ListEditor section={block} listKey="steps" updateSection={(f, v) => updateBlock(idx, f, v)} />}
                            {block.type === 'gallery' && <GalleryEditor section={block} updateSection={(f, v) => updateBlock(idx, f, v)} />}
                            {(block.type === 'image' || block.type === 'video') && <MediaEditor type={block.type} section={block} updateSection={(f, v) => updateBlock(idx, f, v)} />}

                          </div>
                        </div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>

              </div>
            ) : (
              <div className="cms-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>
                <FiIcons.FiDatabase size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
                <h3>Select a document to edit</h3>
              </div>
            )}
          </div>

          {/* Inspector */}
          <aside className="cms-inspector">
            <div className="cms-inspector-header"><FiIcons.FiSliders style={{ marginRight: 8, color: '#38bdf8' }} /> Inspector Tools</div>
            {formData ? (
              <div className="cms-inspector-body">
                <div className="cms-prop-group">
                  <div className="cms-prop-title"><FiIcons.FiPlusSquare size={14} /> Quick Add Block</div>
                  <div className="cms-add-menu">
                    <div className="cms-add-btn" onClick={() => addBlock('text')}><FiIcons.FiType size={20} /> <span>Text</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('code')}><FiIcons.FiCode size={20} /> <span>Code</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('alert')}><FiIcons.FiAlertCircle size={20} /> <span>Alert</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('image')}><FiIcons.FiImage size={20} /> <span>Image</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('video')}><FiIcons.FiVideo size={20} /> <span>Video</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('gallery')}><FiIcons.FiGrid size={20} /> <span>Gallery</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('table')}><FiIcons.FiTable size={20} /> <span>Table</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('list')}><FiIcons.FiList size={20} /> <span>List</span></div>
                    <div className="cms-add-btn" onClick={() => addBlock('steps')}><FiIcons.FiList size={20} /> <span>Steps</span></div>
                  </div>
                </div>

                <div className="cms-prop-group">
                  <div className="cms-prop-title"><FiIcons.FiGlobe size={14} /> Page Settings</div>
                  
                  <div className="cms-field">
                    <label>Status</label>
                    <select className="cms-input" value={formData.status || 'published'} onChange={e => { setFormData({...formData, status: e.target.value}); setHasChanges(true); }}>
                      <option value="published">Published 🟢</option>
                      <option value="draft">Draft 🟡</option>
                    </select>
                  </div>

                  <div className="cms-field">
                    <label>Category</label>
                    <select className="cms-input" value={formData.category || 'Basics'} onChange={e => { setFormData({...formData, category: e.target.value}); setHasChanges(true); }}>
                      {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="cms-field">
                    <label>SEO Description</label>
                    <AutoSizeTextarea className="cms-input cms-textarea" value={formData.description || ''} onChange={e => { setFormData({...formData, description: e.target.value}); setHasChanges(true); }} placeholder="Meta description for search engines..." />
                  </div>

                  <div className="cms-field" style={{ marginTop: 24 }}>
                    <button className="cms-icon-btn danger" style={{ width: '100%', justifyContent: 'center', padding: '10px', borderRadius: '8px', border: '1px solid #ef4444' }} onClick={handleReset}>
                      <FiIcons.FiRefreshCw size={16} /> Discard & Reload JSON
                    </button>
                    <p style={{ fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 8 }}>Pulls the latest edits from the physical .json file.</p>
                  </div>


                  <div className="cms-field">
                    <label>Icon (Lucide/Feather)</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#020617', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                        <IconRenderer iconName={formData.icon} size={20} />
                      </div>
                      <input className="cms-input" style={{ flex: 1 }} value={formData.icon || ''} onChange={e => { setFormData({...formData, icon: e.target.value}); setHasChanges(true); }} />
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #334155' }} />

                {activeBlock !== null && formData.sections[activeBlock] ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="cms-prop-group">
                    <div className="cms-prop-title"><FiIcons.FiBox size={14} /> Block Properties</div>
                    
                    <div className="cms-field">
                       <label>Block Type</label>
                       <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem' }}>{(formData.sections[activeBlock].type || 'TEXT').toUpperCase()}</div>
                    </div>

                    <div className="cms-field mt-2">
                       <label>Background Style</label>
                       <select className="cms-input" value={formData.sections[activeBlock].bgStyle || 'none'} onChange={e => updateBlock(activeBlock, 'bgStyle', e.target.value)}>
                          <option value="none">Transparent</option>
                          <option value="muted">Muted Dark Box</option>
                          <option value="bordered">Outlined Box</option>
                       </select>
                    </div>

                    {formData.sections[activeBlock].type === 'table' && (
                      <div className="cms-field">
                         <label>Table Theme</label>
                         <select className="cms-input" value={formData.sections[activeBlock].theme || 'default'} onChange={e => updateBlock(activeBlock, 'theme', e.target.value)}>
                            <option value="default">Default Grid</option>
                            <option value="striped">Striped Rows</option>
                            <option value="minimal">Minimal (No Borders)</option>
                         </select>
                      </div>
                    )}

                    {formData.sections[activeBlock].type === 'gallery' && (
                      <div className="cms-field">
                         <label>Gallery Columns</label>
                         <select className="cms-input" value={formData.sections[activeBlock].layout || 'grid-2'} onChange={e => updateBlock(activeBlock, 'layout', e.target.value)}>
                            <option value="grid-1">1 Column (Full Width)</option>
                            <option value="grid-2">2 Columns Grid</option>
                            <option value="grid-3">3 Columns Grid</option>
                         </select>
                      </div>
                    )}

                    {['image', 'video'].includes(formData.sections[activeBlock].type) && (
                      <div className="cms-field">
                         <label>Media Alignment</label>
                         <select className="cms-input" value={formData.sections[activeBlock].align || 'center'} onChange={e => updateBlock(activeBlock, 'align', e.target.value)}>
                            <option value="left">Align Left</option>
                            <option value="center">Align Center</option>
                            <option value="right">Align Right</option>
                         </select>
                      </div>
                    )}

                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#020617', padding: 16, borderRadius: 8, border: '1px solid #334155', marginTop: 10 }}>
                       <FiIcons.FiInfo style={{ marginBottom: 4, color: '#38bdf8' }} /> You can edit the content of this block directly in the main canvas.
                    </div>
                  </motion.div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', padding: 20, border: '1px dashed #334155', borderRadius: 8 }}>
                    <FiIcons.FiMousePointer size={24} style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p>Select any block in the canvas to unlock advanced layout tools here.</p>
                  </div>
                )}
              </div>
            ) : null}
          </aside>
        </div>
      </main>
    </div>
  );
}
