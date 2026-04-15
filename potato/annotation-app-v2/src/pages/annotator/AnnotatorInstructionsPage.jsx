import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

export default function AnnotatorInstructionsPage() {
  const { state, actions } = useApp();
  const navigate  = useNavigate();
  const [error, setError] = useState(null);

  // Auto-load project data if we have a currentProjectId context
  useEffect(() => {
    if (state.currentProjectId && !state.annotatorData) {
      const proj = (state.projects || []).find(p => p.id === state.currentProjectId);
      if (proj) {
        actions.loadProjectData(state.currentProjectId);
        // Mark as in-progress when annotator starts instructions
        actions.updateProject(state.currentProjectId, { status: 'in-progress' });
      } else {
        setError('The project link appears to be invalid or the project has been deleted.');
      }
    }
  // eslint-disable-next-line
  }, [state.currentProjectId]);

  const hasData = !!state.annotatorData?.length;
  const canContinue = hasData && !error;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar showBack backTo="/role-select" backLabel="Change Role" />
      <div className="page-container">
        <div className="step-indicator">
          <div className="step active"><div className="step-num">1</div>Guidelines</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">2</div>Annotate</div>
        </div>
        <div className="card">
          <div className="card-header" style={{ background: '#d1fae5' }}>
            <span>📖</span> Annotation Guidelines
            <span className="badge badge-success" style={{ marginLeft: 'auto' }}>Read Before Starting</span>
          </div>
          <div className="card-body">

            {/* Layout overview */}
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#059669', marginBottom: 10 }}>🖥️ Page Layout</h3>
              <div style={{ border: '2px solid #86efac', borderRadius: 12, overflow: 'hidden', fontSize: '0.85rem' }}>
                <div style={{ background: '#4f46e5', color: 'white', padding: '8px 14px', fontWeight: 600 }}>🔒 STICKY — English + Malayalam sentences (always visible)</div>
                <div style={{ background: '#f0fdf4', padding: '8px 14px', color: '#166534' }}>
                  Tokens are displayed as individual words. Hovering a question below highlights the relevant words here.
                </div>
                <div style={{ background: '#fef3c7', padding: '8px 14px', borderTop: '1px dashed #fde68a', fontWeight: 600, color: '#92400e' }}>⬇️ SCROLLABLE — Alignment pair questions</div>
                <div style={{ background: '#fffbeb', padding: '8px 14px', color: '#78350f', lineHeight: 1.7 }}>
                  One card per alignment pair: <strong>en_word ↔ ml_word</strong><br />
                  Hover the card → the words highlight in the sentences above.<br />
                  Answer <strong>Yes</strong> (correct) or <strong>No</strong> (incorrect, then provide correction).
                </div>
              </div>
            </section>

            <hr className="divider" />

            {/* Step by step */}
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#059669', marginBottom: 12 }}>🔄 Annotation Steps</h3>
              {[
                { icon: '1️⃣', title: 'Read the sentence pair', desc: 'The English sentence and Malayalam sentence are pinned at the top. Read both carefully.' },
                { icon: '2️⃣', title: 'Scroll through alignment questions', desc: 'Each alignment pair is a separate card. Hover over a card to see its words highlighted in the sentences above.' },
                { icon: '3️⃣', title: 'Answer: Is this alignment correct?', desc: 'Click ✅ YES if the English word is correctly aligned to the Malayalam word shown.' },
                { icon: '4️⃣', title: 'If NO — provide the correct word', desc: 'Type the correct Malayalam word. Leave blank if there truly is no equivalent.' },
                { icon: '5️⃣', title: 'Move to next sentence', desc: 'Once all pairs are answered, click "Next Sentence". At the last sentence, click "Final Submit" to download your annotations.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div><div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </section>

            <hr className="divider" />

            {/* Keyboard shortcuts */}
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#059669', marginBottom: 10 }}>⌨️ Keyboard Shortcuts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  ['Ctrl + →', 'Next sentence'],
                  ['Ctrl + ←', 'Previous sentence'],
                  ['Y', 'Mark focused pair as YES'],
                  ['N', 'Mark focused pair as NO'],
                ].map(([k, a]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f8fafc', borderRadius: 7, border: '1px solid #e2e8f0' }}>
                    <kbd style={{ padding: '2px 7px', background: '#1e293b', color: 'white', borderRadius: 5, fontSize: '0.76rem', fontFamily: 'monospace', flexShrink: 0 }}>{k}</kbd>
                    <span style={{ fontSize: '0.82rem', color: '#475569' }}>{a}</span>
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            {!hasData && !error && (
              <div className="alert alert-warning">
                ⚠️ No dataset loaded. Please use the specific project link provided to you to access your assignment. 
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => { actions.logout(); navigate('/login-annotator'); }}>← Back to Login</button>
              <button className="btn btn-success btn-lg" onClick={() => navigate('/annotator/annotate')} disabled={!canContinue}>
                🖊️ Start Annotating →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
