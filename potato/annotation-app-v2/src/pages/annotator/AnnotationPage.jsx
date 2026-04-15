import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { findTokenIndices } from '../../context/AppContext';
import Navbar from '../../components/Navbar';
import { ReactTransliterate } from 'react-transliterate';
<<<<<<< HEAD

=======
import 'react-transliterate/dist/index.css';
>>>>>>> 74eda9f (some changes)
// ── helpers ────────────────────────────────────────────────────────────────────
function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// ── SentencePanel (sticky) ─────────────────────────────────────────────────────
function SentencePanel({ sentence, hoveredPairIdx, answers }) {
  const { state } = useApp();
  const enTokens = sentence.english_tokens || [];
  const mlTokens = sentence.target_tokens  || [];
  const pairs    = sentence.alignment       || [];

  // Compute which token indices to highlight for the hovered pair
  const hovered = hoveredPairIdx !== null ? pairs[hoveredPairIdx] : null;
  const hlEnIdx  = hovered ? findTokenIndices(enTokens, hovered.en_word) : [];
  const hlMlIdx  = hovered ? findTokenIndices(mlTokens, hovered.ml_word) : [];

  // "answered" indices — all pairs that have an answer already
  const answeredEnIdx = new Set();
  const answeredMlIdx = new Set();
  pairs.forEach((pair, pi) => {
    if (answers[pi]) {
      findTokenIndices(enTokens, pair.en_word).forEach(i => answeredEnIdx.add(i));
      findTokenIndices(mlTokens, pair.ml_word).forEach(i => answeredMlIdx.add(i));
    }
  });

  const isHovering = hoveredPairIdx !== null;

  return (
    <div style={{
      background: '#fff',
      borderBottom: '2px solid #e2e8f0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
      flexShrink: 0,
      zIndex: 50,
      maxHeight: '32vh',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '10px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* English */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }}></span>
            English
          </div>
<<<<<<< HEAD
          <div className={isHovering ? 'tokens-dimmed' : ''} style={{ lineHeight: 1.6, flexWrap: 'wrap', display: 'flex', gap: 2, fontSize: '0.86rem' }}>
=======
          <div className={isHovering ? 'tokens-dimmed' : ''} style={{ lineHeight: 2.2, fontSize: '1.05rem', color: '#1e293b' }}>
>>>>>>> 74eda9f (some changes)
            {enTokens.map((tok, i) => {
              const isHl = hlEnIdx.includes(i);
              const isAns = answeredEnIdx.has(i) && !isHl;
              return (
                <React.Fragment key={i}>
                  <span
                    className={`token ${isHl ? 'token-en hl-hover' : isAns ? 'token-en hl-answered' : ''}`}
                    title={`index ${i}`}
                    style={(!isHl && !isAns) ? { 
                      display: 'inline', padding: 0, margin: 0, background: 'transparent', border: 'none', color: 'inherit' 
                    } : undefined}
                  >
                    {tok}
                  </span>
                  {' '}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Target Language */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
            {state.language === 'hindi' ? 'Hindi' : 'Malayalam'} / Target
          </div>
<<<<<<< HEAD
          <div className={isHovering ? 'tokens-dimmed' : ''} style={{ lineHeight: 1.6, flexWrap: 'wrap', display: 'flex', gap: 2, fontSize: '0.86rem' }}>
=======
          <div className={isHovering ? 'tokens-dimmed' : ''} style={{ lineHeight: 2.2, fontSize: '1.05rem', color: '#1e293b' }}>
>>>>>>> 74eda9f (some changes)
            {mlTokens.map((tok, i) => {
              const isHl = hlMlIdx.includes(i);
              const isAns = answeredMlIdx.has(i) && !isHl;
              return (
                <React.Fragment key={i}>
                  <span
                    className={`token ml ${isHl ? 'token-ml hl-hover' : isAns ? 'token-ml hl-answered' : ''}`}
                    title={`index ${i}`}
                    style={(!isHl && !isAns) ? { 
                      display: 'inline', padding: 0, margin: 0, background: 'transparent', border: 'none', color: 'inherit' 
                    } : undefined}
                  >
                    {tok}
                  </span>
                  {' '}
                </React.Fragment>
              );
            })}
          </div>
        </div>

      </div>

      {/* Hover legend */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px 10px', display: 'flex', gap: 16, fontSize: '0.75rem', color: '#64748b' }}>
        <span>💡 Hover an alignment question below to highlight the word pair</span>
        {/* Highlighting label — only if active to save space */}
        {hovered && (
          <div style={{ textAlign: 'center', fontSize: '0.74rem', borderTop: '1px solid #f1f5f9', padding: '6px 0', marginTop: 4 }}>
            Highlighting: <span style={{ background: '#fef3c7', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>{hovered.en_word}</span>
            <span style={{ margin: '0 6px', color: '#94a3b8' }}>↔</span>
            <span className={state.language === 'hindi' ? 'hi' : 'ml'} style={{ background: '#dcfce7', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>
              {hovered.ml_word || hovered.hi_word}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AlignmentCard ──────────────────────────────────────────────────────────────
<<<<<<< HEAD
function AlignmentCard({ pair, pairIdx, answer, onAnswer, onHoverChange, isFocused, targetTokens, language }) {
  const [correctedWord, setCorrectedWord] = useState(answer?.correctedWord ?? '');
  const [subType, setSubType]           = useState(answer?.subType || 'manual'); // 'manual' or 'exists'
=======
function AlignmentCard({ pair, pairIdx, answer, onAnswer, onHoverChange, isFocused, mlTokens }) {
  const [correctedWord, setCorrectedWord] = useState(answer?.correctedWord ?? '');
  const [existsInSentence, setExistsInSentence] = useState(answer?.existsInSentence ?? null);
>>>>>>> 74eda9f (some changes)

  // Sync corrected word into answer state when it changes
  useEffect(() => {
    if (answer?.answer === 'no') {
<<<<<<< HEAD
      onAnswer(pairIdx, { 
        answer: 'no', 
        correctedWord: correctedWord.trim(),
        subType: subType 
      });
    }
  // eslint-disable-next-line
  }, [correctedWord, subType]);
=======
      onAnswer(pairIdx, { answer: 'no', correctedWord: correctedWord.trim(), existsInSentence });
    }
  // eslint-disable-next-line
  }, [correctedWord, existsInSentence]);
>>>>>>> 74eda9f (some changes)

  // If answer changes from outside, sync local state
  useEffect(() => {
    setCorrectedWord(answer?.correctedWord ?? '');
<<<<<<< HEAD
    setSubType(answer?.subType || 'manual');
  }, [answer?.answer]);

  const markYes = (e) => { e.stopPropagation(); onAnswer(pairIdx, { answer: 'yes' }); };
  const markNo  = (e) => { e.stopPropagation(); onAnswer(pairIdx, { answer: 'no', subType: 'manual', correctedWord: '' }); };
=======
    setExistsInSentence(answer?.existsInSentence ?? null);
  }, [answer?.answer]);

  const markYes = (e) => { e.stopPropagation(); setExistsInSentence(null); onAnswer(pairIdx, { answer: 'yes', correctedWord: '', existsInSentence: null }); };
  const markNo  = (e) => { e.stopPropagation(); setExistsInSentence(null); onAnswer(pairIdx, { answer: 'no',  correctedWord: '', existsInSentence: null }); };
>>>>>>> 74eda9f (some changes)

  const isYes = answer?.answer === 'yes';
  const isNo  = answer?.answer === 'no';
  const isAnswered = !!answer?.answer;

  return (
    <div
      onMouseEnter={() => onHoverChange(pairIdx)}
      onMouseLeave={() => onHoverChange(null)}
      style={{
        border: `2px solid ${
          isFocused  ? '#4f46e5' :
          isYes      ? '#10b981' :
          isNo       ? '#f59e0b' :
          '#e2e8f0'
        }`,
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 8,
        background: isYes ? '#f0fdf4' : isNo ? '#fffbeb' : isFocused ? '#ede9fe' : '#fff',
        transition: 'all 0.18s ease',
        boxShadow: isFocused ? '0 0 0 4px rgba(79,70,229,0.12)' : isAnswered ? '0 1px 4px rgba(0,0,0,0.05)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        {/* Pair number */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: isYes ? '#10b981' : isNo ? '#f59e0b' : isFocused ? '#4f46e5' : '#e2e8f0',
          color: isAnswered || isFocused ? 'white' : '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.78rem', fontWeight: 700,
        }}>
          {isYes ? '✓' : isNo ? '✗' : pairIdx + 1}
        </div>

        {/* Word pair */}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 3, display: 'block' }}>
            Is this alignment correct?
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 8, background: '#ede9fe',
              border: '2px solid #c4b5fd', fontWeight: 700, fontSize: '0.95rem', color: '#3730a3',
            }}>
              {pair.en_word}
            </span>
            <span style={{ fontSize: '1.1rem', color: '#94a3b8', fontWeight: 700 }}>↔</span>
            <span className={language === 'hindi' ? 'hi' : 'ml'} style={{
              padding: '4px 12px', borderRadius: 8, background: '#dcfce7',
              border: '2px solid #86efac', fontWeight: 700, fontSize: '1rem', color: '#166534',
            }}>
              {pair.ml_word || pair.hi_word}
            </span>
          </div>
        </div>

        {/* Yes / No buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={markYes}
            style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s',
              background: isYes ? '#10b981' : '#f0fdf4',
              color: isYes ? 'white' : '#059669',
              border: `2px solid ${isYes ? '#10b981' : '#86efac'}`,
              boxShadow: isYes ? '0 2px 8px rgba(16,185,129,0.35)' : 'none',
            }}
          >✅ Yes</button>
          <button
            onClick={markNo}
            style={{
              padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s',
              background: isNo ? '#f59e0b' : '#fffbeb',
              color: isNo ? 'white' : '#92400e',
              border: `2px solid ${isNo ? '#f59e0b' : '#fde68a'}`,
              boxShadow: isNo ? '0 2px 8px rgba(245,158,11,0.35)' : 'none',
            }}
          >🚫 No</button>
        </div>
      </div>

      {/* If NO — choice logic */}
      {isNo && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a',
          borderRadius: 8, padding: '10px 12px', marginTop: 8,
        }}>
<<<<<<< HEAD
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button 
              className={`btn btn-sm ${subType === 'exists' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.73rem', padding: '3px 8px' }}
              onClick={() => { setSubType('exists'); setCorrectedWord(''); }}
            >🔍 In Sentence</button>
            <button 
              className={`btn btn-sm ${subType === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.73rem', padding: '3px 8px' }}
              onClick={() => { setSubType('manual'); setCorrectedWord(''); }}
            >⌨️ Manual</button>
          </div>

          {subType === 'exists' ? (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select 
                className={`form-control ${language === 'hindi' ? 'hi' : 'ml'}`}
                style={{ fontSize: '0.9rem', height: 36 }}
                value={correctedWord}
                onChange={e => setCorrectedWord(e.target.value)}
              >
                <option value="">— Select correct word from sentence —</option>
                {(targetTokens || []).map((t, idx) => (
                  <option key={`${t}-${idx}`} value={t}>{t} [{idx + 1}]</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group translit-container" style={{ marginBottom: 0 }}>
              <ReactTransliterate
                renderComponent={(props) => <input {...props} className={`form-control ${language === 'hindi' ? 'hi' : 'ml'}`} style={{ fontSize: '0.92rem', height: 36 }} />}
                value={correctedWord}
                onChangeText={setCorrectedWord}
                lang={language === 'hindi' ? 'hi' : 'ml'}
                placeholder={`Type phonetically (e.g. namaskar)...`}
              />
=======
          {!existsInSentence && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600, color: '#92400e', display: 'block', marginBottom: 6 }}>
                Does the correct alignment exist in the target sentence?
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`btn btn-sm ${existsInSentence === 'yes' ? 'btn-primary' : 'btn-secondary'}`}
                  style={existsInSentence !== 'yes' ? { background: '#fde68a', border: '1px solid #d97706', color: '#92400e' } : {}}
                  onClick={() => { setExistsInSentence('yes'); setCorrectedWord(mlTokens[0] || ''); }}
                >Yes</button>
                <button
                  className={`btn btn-sm ${existsInSentence === 'no' ? 'btn-primary' : 'btn-secondary'}`}
                  style={existsInSentence !== 'no' ? { background: '#fde68a', border: '1px solid #d97706', color: '#92400e' } : {}}
                  onClick={() => { setExistsInSentence('no'); setCorrectedWord(''); }}
                >No</button>
              </div>
            </div>
          )}

          {existsInSentence === 'yes' && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e', display: 'block', marginBottom: 6 }}>
                  Select the correct word from the sentence:
                </label>
                <button onClick={() => setExistsInSentence(null)} style={{ border:'none', background:'transparent', color:'#d97706', cursor:'pointer', fontSize:'0.75rem', textDecoration:'underline' }}>Change choice</button>
              </div>
              <select
                className="form-control ml"
                value={correctedWord}
                onChange={e => setCorrectedWord(e.target.value)}
                style={{ fontSize: '1rem', borderColor: '#fde68a', background: 'white' }}
              >
                {mlTokens.map((tok, i) => (
                  <option key={i} value={tok}>{tok}</option>
                ))}
              </select>
            </div>
          )}

          {existsInSentence === 'no' && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e', display: 'block', marginBottom: 6 }}>
                  Type the correct Malayalam word (leave blank if none):
                </label>
                <button onClick={() => setExistsInSentence(null)} style={{ border:'none', background:'transparent', color:'#d97706', cursor:'pointer', fontSize:'0.75rem', textDecoration:'underline' }}>Change choice</button>
              </div>
              <ReactTransliterate
                value={correctedWord}
                onChangeText={(text) => setCorrectedWord(text)}
                lang="ml"
                containerStyle={{ width: '100%' }}
                containerClassName="react-transliterate-container"
                renderComponent={(props) => <input {...props} className="form-control ml" style={{ fontSize: '1rem', borderColor: '#fde68a', width: '100%' }} />}
                placeholder="Type in English... E.g. 'maram' -> 'മരം'"
              />
            </div>
          )}
          
          {existsInSentence && correctedWord.trim() !== '' && (
            <div style={{ marginTop: 6, fontSize: '0.8rem', color: '#166534' }}>
              ✓ Correction: <strong className="ml">{correctedWord.trim()}</strong>
            </div>
          )}
          {existsInSentence && correctedWord.trim() === '' && (
            <div style={{ marginTop: 6, fontSize: '0.79rem', color: '#92400e' }}>
              Leaving blank = no equivalent word
>>>>>>> 74eda9f (some changes)
            </div>
          )}
          
          <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#92400e' }}>
            {correctedWord ? (
              <span>✓ Correction: <strong className={language === 'hindi' ? 'hi' : 'ml'}>{correctedWord}</strong></span>
            ) : (
              <span>(Leave empty if no equivalent exists)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main AnnotationPage ────────────────────────────────────────────────────────
export default function AnnotationPage() {
  const { state, actions, helpers } = useApp();
  const navigate = useNavigate();

  const data   = state.annotatorData || [];
  const sIdx   = state.sentenceIdx;
  const sentence = data[sIdx];
  const pairs  = sentence?.alignment || [];

  const [hoveredPairIdx,  setHoveredPairIdx]  = useState(null);
  const [focusedPairIdx,  setFocusedPairIdx]  = useState(null);
  const [showSubmitModal, setShowSubmitModal]  = useState(false);

  const answers = helpers.getSentenceAnnotations(sIdx);   // { pairIdx: { answer, correctedWord } }
  const answeredCount = Object.keys(answers).length;
  const isComplete    = answeredCount >= pairs.length && pairs.length > 0;
  const isLastSentence = sIdx === data.length - 1;

  // Save a pair answer
  const handleAnswer = useCallback((pIdx, answer) => {
    actions.setPairAnswer(sIdx, pIdx, answer);
  }, [sIdx, actions]);

  // Sentence navigation
  const goNext = () => {
    if (!isComplete) {
      alert(`Please answer all ${pairs.length} alignment pairs first. (${answeredCount} / ${pairs.length} done)`);
      return;
    }
    if (isLastSentence) { setShowSubmitModal(true); return; }
    actions.setSentenceIdx(sIdx + 1);
    setFocusedPairIdx(null);
  };
  const goPrev = () => {
    if (sIdx > 0) { actions.setSentenceIdx(sIdx - 1); setFocusedPairIdx(null); }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.ctrlKey && e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
      if (e.ctrlKey && e.key === 'ArrowLeft')  { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const confirmSubmit = () => {
    const output = helpers.buildFinalOutput();
    downloadJSON(output, `annotations_${state.username}_${Date.now()}.json`);
    setShowSubmitModal(false);
    navigate('/annotator/done');
  };

  if (!sentence) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 48 }}>📭</div>
        <h2>No data loaded</h2>
        <button className="btn btn-primary" onClick={() => navigate('/user/instructions')}>Upload Data</button>
      </div>
    );
  }

  const pct = Math.round(((sIdx) / data.length) * 100);

  return (
    // Full-height flex column — sentences stay, questions scroll
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f1f5f9' }}>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Progress bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '8px 20px', flexShrink: 0 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>
            <span>Sentence <strong style={{ color: '#1e293b' }}>{sIdx + 1}</strong> of {data.length}</span>
            <span>{answeredCount} / {pairs.length} pairs answered this sentence</span>
          </div>
          <div className="prog-wrap" style={{ borderRadius: 3 }}>
            <div className="prog-fill" style={{ width: `${pct}%` }}></div>
          </div>
        </div>
      </div>

      {/* ── Sticky sentence panel ── */}
      <SentencePanel
        sentence={sentence}
        hoveredPairIdx={hoveredPairIdx}
        answers={answers}
      />

      {/* ── Scrollable alignment questions ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>
                Alignment Pairs — {pairs.length} questions
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Hover a card to highlight its words in the sentences above · {answeredCount}/{pairs.length} answered
              </p>
            </div>
            {/* Mini progress dots */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 200, justifyContent: 'flex-end' }}>
              {pairs.map((_, pi) => {
                const ans = answers[pi];
                return (
                  <div key={pi} title={`Pair ${pi + 1}`}
                    style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: ans?.answer === 'yes' ? '#10b981' : ans?.answer === 'no' ? '#f59e0b' : '#e2e8f0',
                      transition: 'background 0.2s',
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Alignment cards */}
          {pairs.map((pair, pi) => (
            <AlignmentCard
              key={pi}
              pair={pair}
              pairIdx={pi}
              answer={answers[pi] ?? null}
              onAnswer={handleAnswer}
              onHoverChange={setHoveredPairIdx}
              isFocused={focusedPairIdx === pi}
<<<<<<< HEAD
              targetTokens={sentence.target_tokens}
              language={state.language}
=======
              mlTokens={sentence?.target_tokens || []}
>>>>>>> 74eda9f (some changes)
            />
          ))}

          {/* Completion summary */}
          {isComplete && (
            <div className="alert alert-success" style={{ marginTop: 16 }}>
              ✅ All {pairs.length} pairs answered!{' '}
              {isLastSentence
                ? <strong>Click "Final Submit" below to export your annotations.</strong>
                : <strong>Click "Next Sentence" below.</strong>
              }
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed bottom navigation bar ── */}
      <div style={{
        flexShrink: 0, background: '#fff',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}>
        <button className="btn btn-secondary" onClick={goPrev} disabled={sIdx === 0}>
          ⟨⟨ Prev Sentence
        </button>
        <div style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center' }}>
          <span style={{ fontWeight: 700, color: '#1e293b' }}>Sentence {sIdx + 1}</span>/{data.length}
          <span style={{ display: 'block', fontSize: '0.75rem' }}>
            {isComplete ? '✅ Complete' : `${pairs.length - answeredCount} pairs remaining`}
          </span>
        </div>
        {isLastSentence && isComplete ? (
          <button className="btn btn-success btn-lg" onClick={() => setShowSubmitModal(true)}>
            🏁 Final Submit
          </button>
        ) : (
          <button className="btn btn-primary" onClick={goNext} disabled={isLastSentence && !isComplete}>
            Next Sentence ⟩⟩
          </button>
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
              <h2 style={{ fontWeight: 800, marginBottom: 8 }}>Submit All Annotations?</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Downloads a JSON file with your annotations for all <strong>{data.length} sentences</strong>.
              </p>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, marginBottom: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Sentences', data.length], ['Annotated', Object.keys(state.annotations).length], ['Annotator', state.username], ['Format', 'JSON']].map(([l, v]) => (
                <div key={l} style={{ padding: '8px 10px', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{l}</div>
                  <div style={{ fontWeight: 700 }}>{v}</div>
                </div>
              ))}
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
