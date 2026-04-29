import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import './AdminPage.css'; // Import AdminPage css to inherit CMS variables
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hardcoded credentials for client-side protection
    if (username === 'admin' && password === 'nexus-admin-2026') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="cms-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="login-card">
        <div className="login-header">
          <FiIcons.FiBox size={48} color="#38bdf8" />
          <h2>Nexus Studio</h2>
          <p>Sign in to access the CMS Editor</p>
        </div>
        
        {error && <div className="login-error"><FiIcons.FiAlertCircle style={{ marginRight: 6, verticalAlign: 'middle' }}/> {error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Username</label>
            <input 
              type="text" 
              className="login-input" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="login-field">
            <label>Password</label>
            <input 
              type="password" 
              className="login-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In <FiIcons.FiArrowRight style={{ marginLeft: 4 }}/>
          </button>
        </form>
      </div>
    </div>
  );
}
