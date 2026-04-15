import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// Hardcoded admin credentials (demo)
const ADMIN_USERNAME = 'shravani';
const ADMIN_PASSWORD = 'nlp';

export default function LoginAdminPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');   // improvement #5: error message
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (state.isLoggedIn && state.role === 'admin') navigate('/admin/dashboard');
  }, [state.isLoggedIn, state.role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    // improvement #5: show error on bad credentials instead of silent fail
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      actions.login(username);
      actions.setRole('admin');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials');   // improvement #5
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🛡️</div>
          <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>WordAlign</h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.92rem' }}>Administrator Access</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 2 }}>Admin Sign In</h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Full system access</p>
            </div>
          </div>

          {/* improvement #5: error alert */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              🔒 {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                id="admin-login-username"
                className="form-control"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="admin"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="admin-login-password"
                className="form-control"
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
              />
            </div>
            <button
              id="admin-login-submit"
              type="submit"
              className="btn w-full"
              style={{
                justifyContent: 'center', marginTop: 4,
                background: '#334155', color: 'white',
                border: '1px solid #475569',
              }}
              disabled={loading}
            >
              {loading ? '⏳ Authenticating…' : '🛡️ Sign In as Admin'}
            </button>
          </form>

          <p style={{ marginTop: 14, fontSize: '0.76rem', color: '#94a3b8', textAlign: 'center' }}>
            Credentials: <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>shravani</code>
            {' / '}
            <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>nlp</code>
          </p>

          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: 20, fontSize: '0.82rem' }}>
            <Link to="/login-user"       style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>📤 Uploader</Link>
            <Link to="/login-annotator"  style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>🖊️ Annotator</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
