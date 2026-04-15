import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (state.isLoggedIn) navigate(state.role ? `/${state.role}` : '/role-select');
  }, [state.isLoggedIn, state.role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uname = username.trim();
    if (!uname || !password.trim()) { setError('Enter username and password.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 350));

    // Admin backdoor
    if (uname === 'shravani' && password === 'nlp') {
      actions.login(uname);
      actions.setRole('admin');
      navigate('/admin/dashboard');
      return;
    }

    actions.login(uname);
    navigate('/role-select');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📝</div>
          <h1 style={{ color: 'white', fontSize: '1.7rem', fontWeight: 800, marginBottom: 4 }}>WordAlign</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Word Alignment Annotation Tool
          </p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 20 }}>Sign In</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-control" value={username} onChange={e => setUsername(e.target.value)} placeholder="Any username" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Any password" />
            </div>
            <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 4 }} disabled={loading}>
              {loading ? '⏳ Signing in…' : '🔐 Sign In'}
            </button>
          </form>
          <p style={{ marginTop: 14, fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center' }}>
            Demo mode — any credentials are accepted
          </p>
        </div>
      </div>
    </div>
  );
}
