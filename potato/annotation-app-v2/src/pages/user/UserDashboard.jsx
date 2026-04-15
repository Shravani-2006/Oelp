import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

const STATUS_STYLE = {
  uploaded:      { bg: '#dbeafe', color: '#1e40af', label: 'Uploaded' },
  'in-progress': { bg: '#fef3c7', color: '#92400e', label: 'In Progress' },
  completed:     { bg: '#d1fae5', color: '#065f46', label: 'Done' },
};

function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function UserDashboard() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  // Filter projects to only show those created by the logged-in user
  const myProjects = (state.projects || []).filter(p => p.createdBy === state.username);

  const completedCount = myProjects.filter(p => p.status === 'completed').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 1080 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.55rem', marginBottom: 4 }}>📊 My Projects</h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Manage your uploaded datasets and download completed annotations.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/user/project-selection')}
          >
            ➕ New Project
          </button>
        </div>

        {/* Projects Card */}
        <div className="card">
          <div className="card-header">
            <span>📋</span> Project List
            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{myProjects.length} total</span>
          </div>
          
          {myProjects.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>📂</div>
              <p style={{ fontSize: '0.9rem' }}>No projects yet. Click "New Project" to get started.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['Name', 'Type', 'Language', 'Sentences', 'Date', 'Status', 'Actions'].map(c => (
                      <th key={c} style={{
                        padding: '12px 14px', textAlign: 'left',
                        fontWeight: 700, color: '#475569',
                        fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {myProjects.map((p, i) => {
                    const badge = STATUS_STYLE[p.status] || STATUS_STYLE.uploaded;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name || 'Untitled Task'}</td>
                        <td style={{ padding: '12px 14px' }}>{p.type || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>{p.language || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>{p.sentenceCount ?? '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: badge.bg, color: badge.color,
                            padding: '3px 10px', borderRadius: 999,
                            fontSize: '0.73rem', fontWeight: 700,
                          }}>{badge.label}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              className="btn btn-sm btn-secondary"
                              title="Copy Annotator Invite Link"
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: '0.74rem' }}
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/login-annotator?projectId=${p.id}`);
                                alert('Invite link copied!');
                              }}
                            ><span>🔗</span> Invite</button>
                            {p.status === 'completed' && p.annotationResults ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {p.annotationResults.map((sub, idx) => (
                                  <button key={idx} className="btn btn-sm btn-success"
                                    onClick={() => downloadJSON(sub.result, `annotated_${p.name}_${sub.annotatedBy}.json`)}>
                                    ⬇️ {sub.annotatedBy}
                                  </button>
                                ))}
                              </div>
                            ) : p.status === 'completed' && p.annotationResult ? (
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => downloadJSON(p.annotationResult, `annotated_${p.name}.json`)}
                              >
                                ⬇️ Download
                              </button>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.74rem', fontStyle: 'italic', alignSelf: 'center' }}>
                                {p.status === 'in-progress' ? 'Active' : 'Awaiting'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Info */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 18, background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: 4 }}>💡 Pro-Tip</h4>
            <p style={{ fontSize: '0.82rem', color: '#0c4a6e' }}>
              Once you activate a task, it becomes available to annotators globally. You can download the results as soon as they complete all sentences.
            </p>
          </div>
          <div className="card" style={{ padding: 18, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#15803d', marginBottom: 4 }}>📈 Stats</h4>
            <p style={{ fontSize: '0.82rem', color: '#14532d' }}>
              You have <strong>{myProjects.length}</strong> active projects and <strong>{completedCount}</strong> completed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
