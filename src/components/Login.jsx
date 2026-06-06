import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { KeyRound, Mail, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login, demoMode } = useContext(AppContext);
  const [email, setEmail] = useState(demoMode ? 'vendedor@loja.com' : '');
  const [password, setPassword] = useState(demoMode ? '123456' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            Sales<span>Copilot</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Móveis Planejados de Alto Padrão</p>
        </div>

        {demoMode && (
          <div className="result-section" style={{ 
            backgroundColor: 'var(--warning-bg)', 
            border: '1px solid var(--warning-color)', 
            padding: '1rem', 
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle style={{ color: 'var(--warning-color)', flexShrink: 0, marginTop: '0.1rem' }} size={20} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'left', lineHeight: '1.4' }}>
              <strong>Modo de Demonstração Ativo</strong><br />
              O Firebase não está configurado localmente. <br />
              Use as credenciais abaixo para testar:<br />
              <strong>E-mail:</strong> vendedor@loja.com<br />
              <strong>Senha:</strong> 123456
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            backgroundColor: 'var(--error-bg)', 
            border: '1px solid var(--error-color)', 
            color: 'white', 
            padding: '0.75rem', 
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail Corporativo</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="email" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="nome@loja.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Senha de Acesso</label>
            <div style={{ position: 'relative' }}>
              <KeyRound style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                placeholder="******" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ margin: '0 auto' }}></div> : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
