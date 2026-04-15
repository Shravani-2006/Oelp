import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Navbar from '../../components/Navbar';

const SAMPLES = {
  malayalam: {
    json: `[{
  "id": 1,
  "english": "I love apples",
  "target": "ഞാൻ ആപ്പിൾ ഇഷ്ടപ്പെടുന്നു",
  "alignment": [{ "en_word": "I", "ml_word": "ഞാൻ" }]
}]`,
    jsonl: `{"en_sentence":"The cat sat","ml_sentence":"പൂച്ച ഇരുന്നു","alignment":[{"en_word":"cat","ml_word":"പൂച്ച"}]}`,
    langName: 'Malayalam'
  },
  hindi: {
    json: `[{
  "id": 1,
  "english": "I love apples",
  "target": "मुझे सेब पसंद हैं",
  "alignment": [{ "en_word": "apples", "hi_word": "सेब" }]
}]`,
    jsonl: `{"en_sentence":"The cat sat","hi_sentence":"बिल्ली बैठी थी","alignment":[{"en_word":"cat","hi_word":"बिल्ली"}]}`,
    langName: 'Hindi'
  },
  marathi: {
    json: `[{
  "id": 1,
  "english": "I love apples",
  "target": "मला सफरचंद आवडतात",
  "alignment": [{ "en_word": "apples", "mr_word": "सफरचंद" }]
}]`,
    jsonl: `{"en_sentence":"The cat sat","mr_sentence":"मांजर बसली","alignment":[{"en_word":"cat","mr_word":"मांजर"}]}`,
    langName: 'Marathi'
  },
  bengali: {
    json: `[{
  "id": 1,
  "english": "I love apples",
  "target": "আমি আপেল ভালোবাসি",
  "alignment": [{ "en_word": "apples", "bn_word": "আপেল" }]
}]`,
    jsonl: `{"en_sentence":"The cat sat","bn_sentence":"বিড়াল বসেছিল","alignment":[{"en_word":"cat","bn_word":"বিড়াল"}]}`,
    langName: 'Bengali'
  }
};

export default function UserInstructionsPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  const currentLang = state.language || 'malayalam';
  const sampleData = SAMPLES[currentLang];

  const downloadSample = () => {
    const blob = new Blob([sampleData.json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `sample_${currentLang}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <Navbar showBack backTo="/user/project-selection" backLabel="Selection" />
      <div className="page-container">
        <div className="step-indicator">
          <div className="step completed"><div className="step-num">✓</div>Project Type</div>
          <div className="step-line completed"></div>
          <div className="step active"><div className="step-num">2</div>Instructions</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">3</div>Upload</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">4</div>Purpose</div>
          <div className="step-line"></div>
          <div className="step"><div className="step-num">5</div>Configure</div>
        </div>
        <div className="card">
          <div className="card-header" style={{ background: '#ede9fe' }}>
            <span style={{ fontSize: 18 }}>📋</span> {sampleData.langName} Upload Instructions
            <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>Step 2 of 5</span>
          </div>
          <div className="card-body">
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 8 }}>🎯 What this tool does</h3>
              <p style={{ color: '#475569', lineHeight: 1.75, fontSize: '0.91rem' }}>
                Upload a bilingual dataset of English–{sampleData.langName} sentence pairs.
                Each sentence already has word alignment pairs. Annotators will verify whether each
                alignment is correct and correct it if not.
              </p>
            </section>
            <hr className="divider" />
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 10 }}>📁 Supported Formats</h3>
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontWeight: 600, fontSize: '0.87rem', marginBottom: 6 }}>Format 1 — JSON Array ({sampleData.langName})</p>
                <pre className="code-block">{sampleData.json}</pre>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.87rem', marginBottom: 6 }}>Format 2 — JSONL (one JSON per line)</p>
                <pre className="code-block">{sampleData.jsonl}</pre>
              </div>
            </section>
            <hr className="divider" />
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, color: '#4f46e5', marginBottom: 10 }}>✅ Required Fields</h3>
              {[
                ['en_sentence / english', 'English sentence text', true],
                ['ml_sentence / target', 'Malayalam / target language sentence', true],
                ['alignment', 'Array of {en_word, ml_word} pairs', true],
                ['id', 'Unique identifier (auto-assigned if missing)', false],
                ['english_tokens / target_tokens', 'Token arrays (auto-split if missing)', false],
              ].map(([f, d, req]) => (
                <div key={f} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.86rem' }}>
                  <code style={{ background: '#f1f5f9', padding: '1px 7px', borderRadius: 5, flexShrink: 0 }}>{f}</code>
                  <span style={{ color: '#475569' }}>{d}</span>
                  <span className={`badge ${req ? 'badge-success' : 'badge-info'}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>{req ? 'Required' : 'Optional'}</span>
                </div>
              ))}
            </section>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/user/project-selection')}>← Back</button>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/user/upload')}>Continue to Upload →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
