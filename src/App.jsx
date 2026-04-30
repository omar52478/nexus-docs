import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DocPage from './pages/DocPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import { useState } from 'react';
import { DocProvider } from './context/DocContext';

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(localStorage.getItem('nexus_admin_auth') === 'true');
  const location = useLocation();
  
  const isAdmin = location.pathname.startsWith('/admin');
  const isLanding = location.pathname === '/';

  const handleLogin = () => {
    localStorage.setItem('nexus_admin_auth', 'true');
    setIsAuth(true);
  };

  if (isLanding) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* Hide Navbar for admin page */}
      {!isAdmin && <Navbar toggleMobile={() => setMobileOpen(!mobileOpen)} />}
      
      {isAdmin ? (
        <Routes>
          <Route path="/admin" element={isAuth ? <AdminPage /> : <LoginPage onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <div className="main-layout">
          <Sidebar 
            isOpen={mobileOpen} 
            closeMobile={() => setMobileOpen(false)} 
          />
          
          <main className="content-area">
            <Routes>
              <Route path="/docs/:id" element={<DocPage />} />
              <Route path="*" element={<Navigate to="/docs/getting-started" replace />} />
            </Routes>
          </main>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <DocProvider>
        <AppContent />
      </DocProvider>
    </Router>
  );
}

export default App;
