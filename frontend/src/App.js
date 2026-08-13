import React, { useState, useCallback, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Activity, Droplets, AlertTriangle,
  Truck, FlaskConical, Bot, BarChart3, Eye, Zap
} from 'lucide-react';

import LandingPage from './pages/LandingPage';
import CommandCenter from './pages/CommandCenter';
import FloodIntelligence from './pages/FloodIntelligence';
import GISMapPage from './pages/GISMapPage';
import DrainageIntelligence from './pages/DrainageIntelligence';
import IncidentsPage from './pages/IncidentsPage';
import ResponseOps from './pages/ResponseOps';
import FloodSimulator from './pages/FloodSimulator';
import AIAgentsPage from './pages/AIAgentsPage';
import DamageRecovery from './pages/DamageRecovery';
import AIInsights from './pages/AIInsights';
import AIObservability from './pages/AIObservability';

export const AppContext = createContext(null);

function ToastContainer({ toasts }) {
  return (
    <div className="hx-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`hx-toast ${t.type}`}>
          {t.type === 'success' && '✓'}
          {t.type === 'error' && '✕'}
          {t.type === 'info' && '⬡'}
          {t.type === 'warn' && '⚠'}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

const NAV_ITEMS = [
  { path: '/',              icon: <LayoutDashboard size={13} />, label: 'Command Center' },
  { path: '/flood',         icon: <Activity size={13} />,        label: 'Flood Intelligence' },
  { path: '/gis',           icon: <Map size={13} />,             label: 'GIS Map' },
  { path: '/drainage',      icon: <Droplets size={13} />,        label: 'Drainage' },
  { path: '/incidents',     icon: <AlertTriangle size={13} />,   label: 'Incidents' },
  { path: '/response',      icon: <Truck size={13} />,           label: 'Response Ops' },
  { path: '/simulator',     icon: <FlaskConical size={13} />,    label: 'Simulator' },
  { path: '/agents',        icon: <Bot size={13} />,             label: 'AI Agents' },
  { path: '/damage',        icon: <Zap size={13} />,             label: 'Damage & Recovery' },
  { path: '/insights',      icon: <BarChart3 size={13} />,       label: 'AI Insights' },
  { path: '/observability', icon: <Eye size={13} />,             label: 'Observability' },
];

function HydraLogo() {
  return (
    <div className="hx-logo">
      <div className="hx-logo-icon">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Central node */}
          <circle cx="16" cy="16" r="4" fill="#00d4ff" opacity="0.9"/>
          {/* Connecting lines to outer nodes */}
          <line x1="16" y1="12" x2="16" y2="4" stroke="#00d4ff" strokeWidth="1.2" opacity="0.6"/>
          <line x1="16" y1="20" x2="16" y2="28" stroke="#00d4ff" strokeWidth="1.2" opacity="0.6"/>
          <line x1="12" y1="14" x2="5" y2="9" stroke="#00d4ff" strokeWidth="1.2" opacity="0.6"/>
          <line x1="20" y1="14" x2="27" y2="9" stroke="#00d4ff" strokeWidth="1.2" opacity="0.6"/>
          <line x1="12" y1="18" x2="5" y2="23" stroke="#3b82f6" strokeWidth="1.2" opacity="0.6"/>
          <line x1="20" y1="18" x2="27" y2="23" stroke="#3b82f6" strokeWidth="1.2" opacity="0.6"/>
          {/* Outer nodes */}
          <circle cx="16" cy="4" r="2.5" fill="#3b82f6" opacity="0.8"/>
          <circle cx="16" cy="28" r="2.5" fill="#3b82f6" opacity="0.8"/>
          <circle cx="5" cy="9" r="2.5" fill="#00d4ff" opacity="0.7"/>
          <circle cx="27" cy="9" r="2.5" fill="#00d4ff" opacity="0.7"/>
          <circle cx="5" cy="23" r="2" fill="#3b82f6" opacity="0.5"/>
          <circle cx="27" cy="23" r="2" fill="#3b82f6" opacity="0.5"/>
        </svg>
      </div>
      <div className="hx-logo-text">
        <div className="hx-logo-name">HYDRA-X</div>
        <div className="hx-logo-sub">FLOOD INTELLIGENCE</div>
      </div>
    </div>
  );
}

function AppShell({ city, setCity, systemAlert, showToast, simulationRunning, setSimulationRunning, setSystemAlert }) {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';

  return (
    <div className="hx-layout">
      {/* TOP NAV — hidden on landing page */}
      {!isLanding && (
        <nav className="hx-nav">
          <HydraLogo />
          <div className="hx-nav-items">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `hx-nav-item${isActive ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="hx-nav-right">
            <div className="city-selector">
              <button className={`city-btn ${city === 'AHMEDABAD' ? 'active' : ''}`} onClick={() => setCity('AHMEDABAD')}>AHMEDABAD</button>
              <button className={`city-btn ${city === 'SURAT' ? 'active' : ''}`} onClick={() => setCity('SURAT')}>SURAT</button>
            </div>
            <div className="system-status">
              <div className={`status-dot ${systemAlert ? 'critical' : ''}`} />
              {systemAlert ? 'FLOOD EMERGENCY' : 'SYSTEM ONLINE'}
            </div>
            <div className="demo-banner">⬡ DEMO DATA</div>
          </div>
        </nav>
      )}

      {/* MAIN BODY */}
      <div className="hx-body">
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/"              element={<CommandCenter />} />
          <Route path="/flood"         element={<FloodIntelligence />} />
          <Route path="/gis"           element={<GISMapPage />} />
          <Route path="/drainage"      element={<DrainageIntelligence />} />
          <Route path="/incidents"     element={<IncidentsPage />} />
          <Route path="/response"      element={<ResponseOps />} />
          <Route path="/simulator"     element={<FloodSimulator />} />
          <Route path="/agents"        element={<AIAgentsPage />} />
          <Route path="/damage"        element={<DamageRecovery />} />
          <Route path="/insights"      element={<AIInsights />} />
          <Route path="/observability" element={<AIObservability />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  const [city, setCity] = useState('AHMEDABAD');
  const [toasts, setToasts] = useState([]);
  const [systemAlert, setSystemAlert] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  return (
    <AppContext.Provider value={{ city, setCity, showToast, simulationRunning, setSimulationRunning, systemAlert, setSystemAlert }}>
      <Router>
        <AppShell
          city={city} setCity={setCity}
          systemAlert={systemAlert} showToast={showToast}
          simulationRunning={simulationRunning}
          setSimulationRunning={setSimulationRunning}
          setSystemAlert={setSystemAlert}
        />
        <ToastContainer toasts={toasts} />
      </Router>
    </AppContext.Provider>
  );
}
