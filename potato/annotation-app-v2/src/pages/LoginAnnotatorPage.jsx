import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginAnnotatorPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const projectId = searchParams.get('projectId');

  useEffect(() => {
    if (state.isLoggedIn && state.role === 'annotator') navigate('/annotator/instructions');
  }, [state.isLoggedIn, state.role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const uname = username.trim();
    if (!uname || !password.trim()) return;
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
    actions.setRole('annotator');
    if (projectId) actions.setCurrentProjectId(projectId);
    navigate('/annotator/instructions');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>🖊️</div>
          <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>WordAlign</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.92rem' }}>Annotator Portal</p>
        </div>

        {/* Prolific notice */}
        <div style={{
          background: 'rgba(255,255,255,0.15)', borderRadius: 10,
          padding: '12px 16px', marginBottom: 18,
          display: 'flex', alignItems: 'flex-start', gap: 10,
          border: '1px solid rgba(255,255,255,0.25)',
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
            <strong>Coming from Prolific?</strong> Use the study link you received — it will log you in automatically without this form.
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🖊️</div>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 2 }}>Annotator Sign In</h2>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Direct link / email access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                id="annotator-login-username"
                className="form-control"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Your username"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                id="annotator-login-password"
                className="form-control"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <button
              id="annotator-login-submit"
              type="submit"
              className="btn btn-success w-full"
              style={{ justifyContent: 'center', marginTop: 4 }}
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? '⏳ Signing in…' : '🖊️ Sign In as Annotator'}
            </button>
          </form>

          <p style={{ marginTop: 14, fontSize: '0.76rem', color: '#94a3b8', textAlign: 'center' }}>
            Demo mode — any credentials are accepted
          </p>
        </div>
      </div>
    </div>
  );
}
