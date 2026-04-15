import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

const PROJECT_TYPES = [
  {
    id: 'word-alignment',
    label: 'Word Alignment',
    icon: '🔗',
    description: 'Verify English–Indic word alignment pairs sentence by sentence. Each pair is reviewed and corrected if needed.',
    color: '#4f46e5',
    bg: '#ede9fe',
    available: true,
  },
  {
    id: 'ner',
    label: 'NER',
    icon: '🏷️',
    description: 'Named Entity Recognition — identify and label persons, places, organisations and other entities in text.',
    color: '#0891b2',
    bg: '#e0f2fe',
    available: false,   // Coming soon
  },
];

const LANGUAGES = [
  { id: 'hindi',     label: 'Hindi',     flag: '🇮🇳', script: 'हिंदी',     color: '#f97316' },
  { id: 'malayalam', label: 'Malayalam', flag: '🇮🇳', script: 'മലയാളം',   color: '#059669' },
  { id: 'marathi',   label: 'Marathi',   flag: '🇮🇳', script: 'मराठी',     color: '#e11d48' },
  { id: 'bengali',   label: 'Bengali',   flag: '🇮🇳', script: 'বাংলা',     color: '#8b5cf6' },
];

export default function ProjectSelectionPage() {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(state.projectType || null);
  const [selectedLang, setSelectedLang] = useState(state.language   || null);

  const canContinue = !!selectedType && !!selectedLang;

  const handleContinue = () => {
    actions.setProjectType(selectedType);
    actions.setLanguage(selectedLang);
    navigate('/user/instructions');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar showBack backTo="/user/dashboard" backLabel="Dashboard" />
      <div className="page-container">

        {/* Step indicator — Selection is now Step 1 */}
        <div className="step-indicator">
          <div className="step active"><div className="step-num">1</div>Project Type</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">2</div>Instructions</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">3</div>Upload</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">4</div>Purpose</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">5</div>Configure</div>
        </div>

        <div className="card">
          <div className="card-header" style={{ background: '#ede9fe' }}>
            <span>🎛️</span> Project Selection
            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>Step 1 of 5</span>
          </div>
          <div className="card-body">

            {/* ── Annotation Type ── */}
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 6, fontSize: '0.95rem' }}>
                1️⃣ Select Annotation Type
              </h3>
              <p style={{ fontSize: '0.83rem', color: '#64748b', marginBottom: 14 }}>
                Choose the type of annotation task. Project types are defined by the Admin.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {PROJECT_TYPES.map(pt => (
                  <div
                    key={pt.id}
                    id={`project-type-${pt.id}`}
                    onClick={() => pt.available && setSelectedType(pt.id)}
                    style={{
                      border: `2px solid ${selectedType === pt.id ? pt.color : '#e2e8f0'}`,
                      borderRadius: 12, padding: 20,
                      cursor: pt.available ? 'pointer' : 'not-allowed',
                      background: selectedType === pt.id ? pt.bg : pt.available ? 'white' : '#f8fafc',
                      transition: 'all 0.18s',
                      opacity: pt.available ? 1 : 0.6,
                      boxShadow: selectedType === pt.id ? `0 0 0 4px ${pt.color}20` : 'none',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { if (pt.available) e.currentTarget.style.boxShadow = `0 4px 16px ${pt.color}30`; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = selectedType === pt.id ? `0 0 0 4px ${pt.color}20` : 'none'; }}
                  >
                    {!pt.available && (
                      <span style={{
                        position: 'absolute', top: 10, right: 10,
                        background: '#fef3c7', color: '#92400e',
                        borderRadius: 999, padding: '2px 9px',
                        fontSize: '0.7rem', fontWeight: 700,
                      }}>Coming Soon</span>
                    )}
                    <div style={{ fontSize: 30, marginBottom: 10 }}>{pt.icon}</div>
                    <h4 style={{ fontWeight: 700, marginBottom: 6 }}>
                      {pt.label}{selectedType === pt.id && <span style={{ color: pt.color }}> ✓</span>}
                    </h4>
                    <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.55 }}>{pt.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <hr className="divider" />

            {/* ── Language ── */}
            <section style={{ marginBottom: 28 }}>
              <h3 style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 6, fontSize: '0.95rem' }}>
                2️⃣ Select Target Language
              </h3>
              <p style={{ fontSize: '0.83rem', color: '#64748b', marginBottom: 14 }}>
                Choose the Indic language your dataset is in.
              </p>
              <div style={{ display: 'flex', gap: 14 }}>
                {LANGUAGES.map(lang => (
                  <div
                    key={lang.id}
                    id={`language-${lang.id}`}
                    onClick={() => setSelectedLang(lang.id)}
                    style={{
                      flex: 1,
                      border: `2px solid ${selectedLang === lang.id ? lang.color : '#e2e8f0'}`,
                      borderRadius: 12, padding: '20px 16px',
                      cursor: 'pointer', textAlign: 'center',
                      background: selectedLang === lang.id ? '#f0fdf4' : 'white',
                      transition: 'all 0.18s',
                      boxShadow: selectedLang === lang.id ? `0 0 0 4px ${lang.color}20` : 'none',
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{lang.flag}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                      {lang.label}{selectedLang === lang.id && <span style={{ color: lang.color }}> ✓</span>}
                    </div>
                    <div style={{ fontSize: '1.1rem', color: '#475569' }}>{lang.script}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Summary */}
            {canContinue && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ✓ <strong>{PROJECT_TYPES.find(p => p.id === selectedType)?.label}</strong>
                {' '}in <strong>{LANGUAGES.find(l => l.id === selectedLang)?.label}</strong> — ready to upload your dataset.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => navigate('/user/dashboard')}>← Back</button>
              <button
                id="project-selection-continue"
                className="btn btn-primary btn-lg"
                disabled={!canContinue}
                onClick={handleContinue}
              >
                Continue to Upload →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
