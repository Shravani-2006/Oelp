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

  const activate = async () => {
    await actions.setAnnotatorData(state.uploadedData);
    navigate('/user/dashboard');
  };

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
