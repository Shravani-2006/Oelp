import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

export default function ConfigurePage() {
  const { state, actions } = useApp();
  const navigate  = useNavigate();
  const [name, setName]   = useState('Alignment Task 1');
  const [done, setDone]   = useState(false);
  const total = state.uploadedData?.length || 0;

  const activate = () => {
    actions.setAnnotatorData(state.uploadedData);
    setDone(true);
  };

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 560 }}>
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontWeight: 800, fontSize: '1.55rem', marginBottom: 10 }}>Task Activated!</h2>
          <p style={{ color: '#475569', marginBottom: 28 }}>
            <strong>{total} sentences</strong> ready for annotation.
          </p>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 28, textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>🔗 Invite Annotators</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 12 }}>
              Share this link with your annotators. It will take them directly to the login page for this specific project.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input 
                className="form-control" 
                readOnly 
                value={`${window.location.origin}/login-annotator?projectId=${state.currentProjectId}`}
                style={{ fontSize: '0.78rem', background: '#f8fafc' }}
              />
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/login-annotator?projectId=${state.currentProjectId}`);
                  alert('Link copied to clipboard!');
                }}
              >📋 Copy</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/user/dashboard')}>Back to Home</button>
            <button className="btn btn-success btn-lg" onClick={() => navigate('/user/dashboard')}>📊 Go to Dashboard →</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar showBack backTo="/user/purpose" backLabel="Purpose" />
      <div className="page-container">
        <div className="step-indicator">
          <div className="step completed"><div className="step-num">✓</div>Project Type</div>
          <div className="step-line completed"></div>
          <div className="step completed"><div className="step-num">✓</div>Instructions</div>
          <div className="step-line completed"></div>
          <div className="step completed"><div className="step-num">✓</div>Upload</div>
          <div className="step-line completed"></div>
          <div className="step completed"><div className="step-num">✓</div>Purpose</div>
          <div className="step-line completed"></div>
          <div className="step active"><div className="step-num">5</div>Configure</div>
        </div>
        <div className="card">
          <div className="card-header" style={{ background: '#ede9fe' }}>
            <span>⚙️</span> Configure Task
            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>Step 5 of 5</span>
          </div>
          <div className="card-body">
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[['Sentences', total], ['Purpose', state.purpose === 'evaluate' ? 'Model Evaluation' : 'Ground Truth'], ['Language', `EN ↔ ${state.language ? state.language.toUpperCase().substring(0,2) : 'ML'}`]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: '0.75rem', color: '#64748b' }}>{l}</div><div style={{ fontWeight: 700 }}>{v}</div></div>
              ))}
            </div>
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => navigate('/user/purpose')}>← Back</button>
              <button className="btn btn-success btn-lg" onClick={activate} disabled={!name.trim()}>🚀 Activate Task</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
