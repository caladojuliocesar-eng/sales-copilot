import React, { useState, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Qualificacao from './components/Qualificacao';
import BrainDump from './components/BrainDump';
import Simulador from './components/Simulador';
import Diretrizes from './components/Diretrizes';
import { LogOut, LayoutDashboard, Sparkles, AlertTriangle } from 'lucide-react';
import './App.css';

const AppContent = () => {
  const { user, loading, logout, demoMode } = useContext(AppContext);
  const [screen, setScreen] = useState('dashboard'); // 'dashboard', 'qualificacao', 'braindump', 'simulador', 'diretrizes'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '48px', height: '48px', margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Carregando Sales Copilot...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div 
          className="header-title" 
          onClick={() => setScreen('dashboard')} 
          style={{ cursor: 'pointer' }}
        >
          <Sparkles size={20} style={{ color: 'var(--accent-color)' }} />
          Sales<span>Copilot</span>
        </div>

        <div className="user-nav">
          {demoMode && (
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                padding: '0.4rem 0.8rem', 
                borderRadius: 'var(--border-radius-sm)', 
                backgroundColor: 'var(--warning-bg)', 
                border: '1px solid var(--warning-color)',
                color: 'var(--warning-color)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <AlertTriangle size={14} /> MODO DEMONSTRAÇÃO (LOCAL)
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.displayName || 'Vendedor'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user.email}</span>
          </div>

          <button 
            onClick={() => setScreen('dashboard')} 
            className={`btn btn-secondary btn-icon-only ${screen === 'dashboard' ? 'active' : ''}`}
            title="Dashboard"
            style={{ borderRadius: 'var(--border-radius-sm)' }}
          >
            <LayoutDashboard size={18} />
          </button>

          <button 
            onClick={logout} 
            className="btn btn-secondary btn-icon-only" 
            title="Sair do Sistema"
            style={{ borderRadius: 'var(--border-radius-sm)', color: 'var(--error-color)' }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {screen === 'dashboard' && <Dashboard setScreen={setScreen} />}
        {screen === 'qualificacao' && <Qualificacao setScreen={setScreen} />}
        {screen === 'braindump' && <BrainDump setScreen={setScreen} />}
        {screen === 'simulador' && <Simulador setScreen={setScreen} />}
        {screen === 'diretrizes' && <Diretrizes setScreen={setScreen} />}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App;
