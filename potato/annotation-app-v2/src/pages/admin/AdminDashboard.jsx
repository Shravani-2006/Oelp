import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

const STATUS_STYLE = {
  uploaded:      { bg: '#dbeafe', color: '#1e40af', label: 'Uploaded' },
  'in-progress': { bg: '#fef3c7', color: '#92400e', label: 'In Progress' },
  completed:     { bg: '#d1fae5', color: '#065f46', label: 'Done' },
};

const TABS = [
  { id: 'projects', label: '📋 Projects' },
  { id: 'datasets', label: '📂 Datasets' },
  { id: 'users',    label: '👥 Users & Annotators' },
  { id: 'types',    label: '⚙️ Project Types' },
];

function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '1.55rem', color: color || '#1e293b' }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ padding: '52px 20px', textAlign: 'center', color: '#94a3b8' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      <p style={{ fontSize: '0.9rem' }}>{message}</p>
    </div>
  );
}

function TableHeader({ cols }) {
  return (
    <thead>
      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
        {cols.map(c => (
          <th key={c} style={{
            padding: '10px 14px', textAlign: 'left',
            fontWeight: 700, color: '#475569',
            fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>{c}</th>
        ))}
      </tr>
    </thead>
  );
}

export default function AdminDashboard() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('projects');
  const [newTypeName, setNewTypeName] = useState('');
  const [projectTypes, setProjectTypes] = useState([
    { id: 'word-alignment', label: 'Word Alignment', icon: '🔗', active: true },
    { id: 'ner',            label: 'NER',             icon: '🏷️', active: false },
  ]);

  const projects = state.projects || [];

  // Build user list from project creators
  const userMap = new Map();
  projects.forEach(p => {
    if (p.createdBy && !userMap.has(p.createdBy)) {
      userMap.set(p.createdBy, { username: p.createdBy, role: 'user', lastSeen: p.createdAt, projectCount: 0 });
    }
    if (p.createdBy) userMap.get(p.createdBy).projectCount++;
  });
  const users = [...userMap.values()];

  const addType = () => {
    const name = newTypeName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    if (projectTypes.find(t => t.id === id)) return;
    setProjectTypes(prev => [...prev, { id, label: name, icon: '📌', active: true }]);
    setNewTypeName('');
  };

  const toggleType = (id) =>
    setProjectTypes(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));

  const completed    = projects.filter(p => p.status === 'completed').length;
  const inProgress   = projects.filter(p => p.status === 'in-progress').length;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 1080 }}>

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.55rem', marginBottom: 4 }}>🛡️ Admin Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Manage all projects, datasets, users and annotation types across the platform.
          </p>
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          <StatCard icon="📋" value={projects.length} label="Total Projects" />
          <StatCard icon="✅" value={completed}        label="Completed"    color="#059669" />
          <StatCard icon="⏳" value={inProgress}       label="In Progress"  color="#d97706" />
          <StatCard icon="👥" value={users.length}     label="Users"        color="#4f46e5" />
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 20,
          background: 'white', borderRadius: 10, padding: 5,
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          border: '1px solid #e2e8f0',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: '9px 10px', borderRadius: 7,
                border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.82rem', transition: 'all 0.18s',
                background: activeTab === tab.id ? '#4f46e5' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── Tab: Projects ── */}
        {activeTab === 'projects' && (
          <div className="card">
            <div className="card-header">
              <span>📋</span> All Projects
              <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{projects.length} total</span>
            </div>
            {projects.length === 0
              ? <EmptyState icon="📭" message="No projects yet. A User must upload and configure a task first." />
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <TableHeader cols={['ID', 'Type', 'Language', 'Sentences', 'Created By', 'Date', 'Status', 'Actions']} />
                    <tbody>
                      {projects.map((p, i) => {
                        const badge = STATUS_STYLE[p.status] || STATUS_STYLE.uploaded;
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                            <td style={{ padding: '10px 14px' }}>
                              <code style={{ fontSize: '0.73rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>
                                {p.id.slice(-8)}
                              </code>
                            </td>
                            <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.type || '—'}</td>
                            <td style={{ padding: '10px 14px' }}>{p.language || '—'}</td>
                            <td style={{ padding: '10px 14px' }}>{p.sentenceCount ?? '—'}</td>
                            <td style={{ padding: '10px 14px' }}>{p.createdBy || '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                background: badge.bg, color: badge.color,
                                padding: '3px 10px', borderRadius: 999,
                                fontSize: '0.73rem', fontWeight: 700,
                              }}>{badge.label}</span>
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              {p.annotationResults ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {p.annotationResults.map((sub, idx) => (
                                    <button key={idx} className="btn btn-sm btn-success"
                                      onClick={() => downloadJSON(sub.result, `annotated_${p.id.slice(-8)}_${sub.annotatedBy}.json`)}>
                                      ⬇️ {sub.annotatedBy}
                                    </button>
                                  ))}
                                </div>
                              ) : p.annotationResult ? (
                                  <button className="btn btn-sm btn-success"
                                    onClick={() => downloadJSON(p.annotationResult, `annotated_${p.id.slice(-8)}.json`)}>
                                    ⬇️ Download
                                  </button>
                              ) : <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Pending</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {/* ── Tab: Datasets ── */}
        {activeTab === 'datasets' && (
          <div className="card">
            <div className="card-header">
              <span>📂</span> Uploaded Datasets
              <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{projects.length} datasets</span>
            </div>
            {projects.length === 0
              ? <EmptyState icon="📂" message="No datasets uploaded yet." />
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <TableHeader cols={['Task Name', 'Type', 'Language', 'Purpose', 'Sentences', 'Upload Date', 'Status']} />
                    <tbody>
                      {projects.map((p, i) => {
                        const badge = STATUS_STYLE[p.status] || STATUS_STYLE.uploaded;
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.name || '—'}</td>
                            <td style={{ padding: '10px 14px' }}>{p.type || '—'}</td>
                            <td style={{ padding: '10px 14px' }}>{p.language || '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#64748b' }}>{p.purpose || '—'}</td>
                            <td style={{ padding: '10px 14px' }}>{p.sentenceCount ?? '—'}</td>
                            <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td style={{ padding: '10px 14px' }}>
                              <span style={{
                                background: badge.bg, color: badge.color,
                                padding: '3px 10px', borderRadius: 999,
                                fontSize: '0.73rem', fontWeight: 700,
                              }}>{badge.label}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {/* ── Tab: Users & Annotators ── */}
        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header">
              <span>👥</span> Users &amp; Annotators
              <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{users.length} accounts</span>
            </div>
            {users.length === 0
              ? <EmptyState icon="👥" message="No user activity recorded yet." />
              : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                    <TableHeader cols={['Username', 'Role', 'Projects', 'Last Active']} />
                    <tbody>
                      {users.map((u, i) => (
                        <tr key={u.username} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{u.username}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{
                              background: u.role === 'admin' ? '#fef3c7' : u.role === 'annotator' ? '#d1fae5' : '#ede9fe',
                              color: u.role === 'admin' ? '#92400e' : u.role === 'annotator' ? '#065f46' : '#4f46e5',
                              padding: '2px 10px', borderRadius: 999,
                              fontSize: '0.74rem', fontWeight: 700,
                            }}>{u.role}</span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>{u.projectCount}</td>
                          <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.78rem' }}>
                            {u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}

        {/* ── Tab: Project Types ── */}
        {activeTab === 'types' && (
          <div className="card">
            <div className="card-header">
              <span>⚙️</span> Manage Annotation Types
              <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{projectTypes.length} types</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: 20 }}>
                Define the annotation project types available to users. Disable types to hide them from the project selection screen.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {projectTypes.map(t => (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px',
                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 22 }}>{t.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{t.label}</div>
                      <code style={{ fontSize: '0.73rem', color: '#94a3b8' }}>id: {t.id}</code>
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: 999, fontSize: '0.73rem', fontWeight: 700,
                      background: t.active ? '#d1fae5' : '#f1f5f9',
                      color: t.active ? '#065f46' : '#94a3b8',
                    }}>{t.active ? 'Active' : 'Inactive'}</span>
                    <button className="btn btn-sm btn-secondary" onClick={() => toggleType(t.id)}>
                      {t.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new type */}
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  id="admin-new-type-input"
                  className="form-control"
                  placeholder="New type name (e.g. Sentiment Analysis)"
                  value={newTypeName}
                  onChange={e => setNewTypeName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addType()}
                  style={{ flex: 1 }}
                />
                <button
                  id="admin-add-type-btn"
                  className="btn btn-primary"
                  onClick={addType}
                  disabled={!newTypeName.trim()}
                >
                  ➕ Add Type
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
