import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

export default function DonePage() {
  const { state, actions, helpers } = useApp();
  const navigate = useNavigate();

  // On mount: mark project completed and store annotation results
  useEffect(() => {
    const projectId = state.currentProjectId;
    if (projectId) {
      const output = helpers.buildFinalOutput();
      const proj = (state.projects || []).find(p => p.id === projectId);
      
      const newSubmission = {
        annotatedBy: state.username,
        annotatedAt: new Date().toISOString(),
        result: output
      };

      const existingResults = proj?.annotationResults || [];
      const updatedResults = [...existingResults, newSubmission];

      // Keep annotationResult as a fallback to safely support old views, but write the new array
      actions.updateProject(projectId, {
        status: 'completed',
        annotationResults: updatedResults,
        annotationResult: updatedResults, 
        annotatedBy: state.username,
        annotatedAt: new Date().toISOString(),
      });
    }
  // eslint-disable-next-line
  }, []);

  const reDownload = () => {};

  // improvement #4: return to Prolific using completionCode from state
  const returnToProlific = () => {
    const code = state.completionCode || 'C1DEMO';
    window.location.href = `https://app.prolific.com/submissions/complete?cc=${code}`;
  };

  const isProlific = !!state.prolificPid;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4, #ede9fe)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>

          <div style={{ fontSize: 76, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontWeight: 800, fontSize: '1.9rem', marginBottom: 8 }}>Annotation Complete!</h1>
          <p style={{ color: '#475569', marginBottom: 28, lineHeight: 1.7 }}>
            Great work, <strong>{state.username}</strong>! Your annotations for{' '}
            <strong>{state.annotatorData?.length ?? 0} sentences</strong> have been saved.
            {isProlific && <> Return to Prolific to complete your submission.</>}
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 28 }}>
            {[
              ['📝', state.annotatorData?.length ?? 0, 'Sentences'],
              ['✅', Object.keys(state.annotations).length, 'Annotated'],
              ['👤', state.username, 'Annotator'],
            ].map(([icon, val, lbl]) => (
              <div key={lbl} className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontWeight: 800, fontSize: '1.3rem' }}>{val}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Prolific CTA — shown only for Prolific participants */}
          {isProlific && (
            <div style={{
              background: '#fff', border: '2px solid #10b981', borderRadius: 14,
              padding: '20px 24px', marginBottom: 20,
            }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔬</div>
              <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Return to Prolific</h3>
              <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: 16, lineHeight: 1.6 }}>
                Click below to submit your completion on Prolific. Your results have been recorded.
              </p>
              <button
                id="return-to-prolific-btn"
                className="btn btn-success btn-lg w-full"
                style={{ justifyContent: 'center' }}
                onClick={returnToProlific}
              >
                ✅ Return to Prolific →
              </button>
              <p style={{ marginTop: 10, fontSize: '0.74rem', color: '#94a3b8' }}>
                Completion code: <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>{state.completionCode || 'C1DEMO'}</code>
              </p>
            </div>
          )}

          {/* Standard action buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary"   onClick={() => { actions.reset(); navigate('/annotator/annotate'); }}>🔄 Annotate Again</button>
            <button className="btn btn-outline"   onClick={() => { actions.logout(); navigate('/login-annotator'); }}>🏠 Home</button>
          </div>

        </div>
      </div>
    </div>
  );
}
