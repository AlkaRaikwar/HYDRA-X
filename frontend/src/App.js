import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import {
  Home, Stethoscope, Video, LayoutDashboard,
  Package, Users, Lightbulb
} from 'lucide-react';

import HomePage from './pages/HomePage';
import TriagePage from './pages/TriagePage';
import TeleconsultPage from './pages/TeleconsultPage';
import DashboardPage from './pages/DashboardPage';
import StockPage from './pages/StockPage';
import FollowUpPage from './pages/FollowUpPage';
import InsightsPage from './pages/InsightsPage';

import { checkHealth } from './services/api';

// ─── Toast Context ────────────────────────────────────────────────────────────
export const ToastContext = React.createContext(null);

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <span style={{ color: '#16a34a' }}>✓</span>}
          {t.type === 'error' && <span style={{ color: '#dc2626' }}>✕</span>}
          {t.type === 'info' && <span style={{ color: '#2563eb' }}>ℹ</span>}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

function Sidebar({ aiMode }) {
  const navItems = [
    { path: '/', icon: <Home size={16} />, label: 'Home' },
    { path: '/triage', icon: <Stethoscope size={16} />, label: 'Patient Triage' },
    { path: '/teleconsult', icon: <Video size={16} />, label: 'Teleconsultation' },
    { path: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'ASHA / PHC Dashboard' },
    { path: '/stock', icon: <Package size={16} />, label: 'Medicine Stock' },
    { path: '/followup', icon: <Users size={16} />, label: 'Patient Follow-ups' },
    { path: '/insights', icon: <Lightbulb size={16} />, label: 'AI Insights' },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏥</div>
        <h1>SwasthyaSetu</h1>
        <p>Rural Healthcare AI · Gujarat</p>
      </div>
      <div className="sidebar-demo-badge">
        {aiMode === 'IBM_GRANITE' ? <><span>🤖</span> IBM Granite Active</> : <><span>🔶</span> Demo Mode</>}
      </div>
      <div className="sidebar-section-label">Navigation</div>
      <nav className="sidebar-nav">
        {navItems.map(n => (
          <NavLink key={n.path} to={n.path} end={n.path === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            {n.icon} {n.label}
            {/* active dot rendered via CSS on .active */}
            <span className="nav-dot" />
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        PS #19 · IBM Hackathon<br />
        Dangs · Narmada · Chhota Udepur
      </div>
    </aside>
  );
}

export default function App() {
  const [aiMode, setAiMode] = useState('DEMO');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    checkHealth().then(r => setAiMode(r.data.mode || 'DEMO')).catch(() => {});
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <Router>
        <div className="app-layout">
          <Sidebar aiMode={aiMode} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/triage" element={<TriagePage />} />
              <Route path="/teleconsult" element={<TeleconsultPage />} />
              <Route path="/teleconsult/:caseId" element={<TeleconsultPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/followup" element={<FollowUpPage />} />
              <Route path="/insights" element={<InsightsPage />} />
            </Routes>
          </main>
        </div>
        <ToastContainer toasts={toasts} />
      </Router>
    </ToastContext.Provider>
  );
}
