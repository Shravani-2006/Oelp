import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

/**
 * ProlificEntryPage — auto-authenticates Prolific participants.
 *
 * Reads from URL:
 *   ?PROLIFIC_PID=xxx        → used as annotator username
 *   ?projectId=yyy           → links annotation to a specific project  (improvement #3)
 *   ?completionCode=ABC123   → overrides default Prolific completion code (improvement #4)
 *   ?STUDY_ID=zzz            → stored for reference (optional)
 *
 * No login form shown — auto-redirects to /annotator/instructions after 1.2s.
 */
export default function ProlificEntryPage() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Connecting to Prolific study…');

  useEffect(() => {
    const pid            = searchParams.get('PROLIFIC_PID') || searchParams.get('prolific_pid') || 'prolific_user';
    const projectId      = searchParams.get('projectId')    || null;
    const completionCode = searchParams.get('completionCode') || 'C1DEMO';  // improvement #4: from URL or default
    // studyId is logged but not strictly needed in frontend
    // const studyId = searchParams.get('STUDY_ID') || null;

    // Auto-authenticate the Prolific participant
    actions.login(pid);
    actions.setRole('annotator');
    actions.setProlificPid(pid);
    actions.setCompletionCode(completionCode);  // improvement #4

    // improvement #3: link annotation to project if provided
    if (projectId) {
      actions.setCurrentProjectId(projectId);
      // If the project data is loaded, mark it in-progress
      actions.updateProject(projectId, { status: 'in-progress' });
    }

    setStatus(`Welcome, ${pid}! Loading your annotation task…`);

    const timer = setTimeout(() => navigate('/annotator/instructions'), 1400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: 24,
    }}>
      {/* Spinner */}
      <div style={{
        width: 64, height: 64,
        border: '5px solid rgba(255,255,255,0.25)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'prolific-spin 0.9s linear infinite',
      }} />

      <div style={{ textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 10 }}>
          Prolific Study
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', maxWidth: 340 }}>
          {status}
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.12)', borderRadius: 10,
        padding: '12px 24px', fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.7)', textAlign: 'center',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        You will be redirected automatically. Please do not close this tab.
      </div>

      <style>{`
        @keyframes prolific-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
