import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

const NER_LABELS = [
  { id: 'PERSON', label: 'PERSON', color: '#ef4444', bg: '#fecaca', icon: '👤' },
  { id: 'ORG',    label: 'ORG',    color: '#3b82f6', bg: '#bfdbfe', icon: '🏢' },
  { id: 'LOC',    label: 'LOC',    color: '#10b981', bg: '#bbf7d0', icon: '📍' },
  { id: 'MISC',   label: 'MISC',   color: '#8b5cf6', bg: '#ddd6fe', icon: '🏷️' },
  { id: 'O',      label: 'Clear / O', color: '#64748b', bg: '#e2e8f0', icon: '🧹' },
];

function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function NERAnnotationPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();

  const data = state.annotatorData || [];
  const sIdx = state.sentenceIdx;
  const sentence = data[sIdx];
  const tokens = sentence?.tokens || [];

  const [activeLabel, setActiveLabel] = useState(NER_LABELS[0].id);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // currentSentenceAnswers: { [tokenIndex]: "PERSON" }
  const currentAnswers = state.annotations[sIdx] || {};
  const isComplete = true; // For NER, all tokens default to 'O' (Outside), so it's technically always completing the requirements.
  const isLastSentence = sIdx === data.length - 1;

  const handleTokenClick = (tIdx) => {
    let newAnswers = { ...currentAnswers };
    if (activeLabel === 'O') {
      delete newAnswers[tIdx];
    } else {
      newAnswers[tIdx] = activeLabel;
    }
    // Set this into the global state (reusing SET_PAIR_ANSWER by treating the entire object as the "answer" payload on pIdx 0)
    // Wait, SET_PAIR_ANSWER maps to: annotations[sIdx][pIdx] = answer.
    // Instead we can map tokenIndex entirely to pIdx in the actions.
    actions.setPairAnswer(sIdx, tIdx, activeLabel === 'O' ? null : { answer: activeLabel });
  };

  const goNext = () => {
    if (isLastSentence) { setShowSubmitModal(true); return; }
    actions.setSentenceIdx(sIdx + 1);
  };
  const goPrev = () => {
    if (sIdx > 0) { actions.setSentenceIdx(sIdx - 1); }
  };

  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      if (e.ctrlKey && e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
      // Hotkeys for numbers
      if (e.key >= '1' && e.key <= '5') {
        const lbl = NER_LABELS[parseInt(e.key) - 1];
        if (lbl) setActiveLabel(lbl.id);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const confirmSubmit = () => {
    // Build Output natively specifically for NER
    const output = data.map((rec, i) => {
      const annMap = state.annotations[i] || {};
      const entities = Object.keys(annMap).map(idx => ({
        token_index: parseInt(idx),
        token_text: rec.tokens[idx],
        label: annMap[idx]?.answer
      })).filter(e => e.label);
      
      return {
        sentence_id: rec.id,
        text: rec.text,
        tokens: rec.tokens,
        entities: entities
      };
    });
    downloadJSON(output, `ner_annotations_${state.username}_${Date.now()}.json`);
    setShowSubmitModal(false);
    navigate('/annotator/done');
  };

  if (!sentence) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>📭</div>
        <h2>No active task</h2>
        <button className="btn btn-primary" onClick={() => navigate('/login-annotator')}>Back to Login</button>
      </div>
    );
  }

  const pct = Math.round(((sIdx) / data.length) * 100);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f1f5f9' }}>
      <Navbar />

      {/* ── Progress bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 20px', flexShrink: 0 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            <span>Sentence <strong style={{ color: '#1e293b' }}>{sIdx + 1}</strong> of {data.length}</span>
            <span>NER Mode</span>
          </div>
          <div className="prog-wrap" style={{ borderRadius: 3 }}>
            <div className="prog-fill" style={{ width: `${pct}%`, background: '#0891b2' }}></div>
          </div>
        </div>
      </div>

      {/* ── Label Palette Panel (Sticky) ── */}
      <div style={{
        background: '#fff', borderBottom: '2px solid #e2e8f0',
        padding: '16px 20px', flexShrink: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 12 }}>
            Active Label Palette Tools
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {NER_LABELS.map((lbl, i) => {
              const active = activeLabel === lbl.id;
              return (
                <button
                  key={lbl.id}
                  onClick={() => setActiveLabel(lbl.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                    background: active ? lbl.bg : '#f8fafc',
                    border: `2px solid ${active ? lbl.color : '#e2e8f0'}`,
                    color: active ? lbl.color : '#475569',
                    fontWeight: active ? 700 : 500, fontSize: '0.85rem',
                    transition: 'all 0.15s',
                    boxShadow: active ? `0 2px 8px ${lbl.color}40` : 'none',
                  }}
                >
                  <span>{lbl.icon}</span>
                  {lbl.label}
                  <span style={{ 
                    background: active ? 'rgba(255,255,255,0.5)' : '#e2e8f0', 
                    borderRadius: 4, padding: '1px 5px', fontSize: '0.65rem', marginLeft: 4 
                  }}>{i + 1}</span>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 10 }}>
            💡 Tip: Press numbers 1-5 on your keyboard to quickly switch active tools! Click a word below to paint it with the current tool.
          </div>
        </div>
      </div>

      {/* ── Annotation Board ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '30px 20px 100px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div 
             className={state.language === 'hindi' ? 'hi' : state.language === 'marathi' ? 'mr' : state.language === 'bengali' ? 'bn' : 'ml'}
             style={{ 
             background: 'white', padding: 30, borderRadius: 16, 
             boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
             lineHeight: 2.2, display: 'flex', flexWrap: 'wrap', gap: '4px 6px',
             fontSize: '1.4rem'
          }}>
            {tokens.map((tok, i) => {
              const ansRaw = currentAnswers[i];
              const ans = ansRaw?.answer;
              const lblObj = NER_LABELS.find(l => l.id === ans);
              const hasLabel = !!lblObj;

              return (
                <span
                  key={i}
                  onClick={() => handleTokenClick(i)}
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: hasLabel ? '2px 8px' : '2px 4px',
                    borderRadius: 6, cursor: 'pointer',
                    background: hasLabel ? lblObj.bg : 'transparent',
                    border: `2px solid ${hasLabel ? lblObj.color : 'transparent'}`,
                    color: hasLabel ? lblObj.color : '#1e293b',
                    fontWeight: hasLabel ? 700 : 400,
                    transition: 'all 0.1s',
                    userSelect: 'none',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                      if (!hasLabel) {
                         e.currentTarget.style.background = '#f0fdf4';
                         e.currentTarget.style.border = '2px dashed #86efac';
                      }
                  }}
                  onMouseLeave={(e) => {
                      if (!hasLabel) {
                         e.currentTarget.style.background = 'transparent';
                         e.currentTarget.style.border = '2px solid transparent';
                      }
                  }}
                >
                  {tok}
                  {hasLabel && (
                    <span style={{ 
                      fontSize: '0.65rem', background: lblObj.color, 
                      color: 'white', padding: '1px 5px', borderRadius: 4, 
                      marginLeft: 6, fontWeight: 700, letterSpacing: '0.04em'
                    }}>
                      {lblObj.id}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Fixed Bottom Bar ── */}
      <div style={{
        flexShrink: 0, background: '#fff', borderTop: '1px solid #e2e8f0',
        padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}>
        <button className="btn btn-secondary" onClick={goPrev} disabled={sIdx === 0}>⟨⟨ Prev Sentence</button>
        <div style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center' }}>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>Sentence {sIdx + 1}</span>/{data.length}
        </div>
        {isLastSentence ? (
          <button className="btn btn-success btn-lg" onClick={() => setShowSubmitModal(true)}>🏁 Final Submit</button>
        ) : (
          <button className="btn btn-primary" onClick={goNext}>Next Sentence ⟩⟩</button>
        )}
      </div>

      {/* ── Final Submit Modal ── */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
        }}>
          <div className="card" style={{ maxWidth: 460, width: '90%', padding: 30 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 56, marginBottom: 10 }}>🏁</div>
              <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Submit NER Annotations?</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>Downloads a JSON file with your named entity spans mapped for all <strong>{data.length} sentences</strong>.</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }} onClick={() => setShowSubmitModal(false)}>Cancel</button>
              <button className="btn btn-success w-full" style={{ justifyContent: 'center', fontWeight: 700 }} onClick={confirmSubmit}>⬇️ Download & Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
