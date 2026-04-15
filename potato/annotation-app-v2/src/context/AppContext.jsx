import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ── helpers ────────────────────────────────────────────────────────────────────
/** Parse a JSONL file (one JSON object per line) */
export function parseJSONL(text) {
  return text.trim().split('\n').filter(l => l.trim()).map(l => JSON.parse(l));
}

/** Normalise a record from either JSON-array format or JSONL format into a
 *  consistent shape:
 *  { id, english, target, english_tokens, target_tokens, alignment }
 *  alignment items: { en_word, ml_word }   (always)
 */
export function normalizeRecord(obj, idx) {
  const r = { ...obj };
  r.id = r.id ?? idx + 1;

  // sentences
  r.english = r.english ?? r.en_sentence ?? '';
  r.target  = r.target  ?? r.hindi ?? r.marathi ?? r.bengali ?? r.ml_sentence ?? r.mr_sentence ?? r.bn_sentence ?? r.malayalam ?? '';

  // tokens – auto-split if not provided
  r.english_tokens = r.english_tokens ?? r.english.trim().split(/\s+/).filter(Boolean);
  r.target_tokens  = r.target_tokens  ?? r.hindi_tokens ?? r.marathi_tokens ?? r.bengali_tokens ?? r.ml_tokens ?? r.mr_tokens ?? r.bn_tokens
                     ?? r.target.trim().split(/\s+/).filter(Boolean);

  // alignment – normalise to { en_word, ml_word } regardless of source format
  if (Array.isArray(r.alignment)) {
    r.alignment = r.alignment.map(a => {
      if (a.en_word !== undefined) return { ...a };
      // old format: { en: [idx], hi: [idx] }
      if (Array.isArray(a.en)) {
        const enW = (r.english_tokens[a.en[0]] ?? '');
        const hiW = (r.target_tokens[ a.hi?.[0] ?? a.mr?.[0] ?? a.bn?.[0] ?? a.ml?.[0] ] ?? '');
        return { en_word: enW, ml_word: hiW };
      }
      return { en_word: '', ml_word: '' };
    });
  } else {
    r.alignment = [];
  }

  return r;
}

/** Find ALL token indices (0-based) where the token text matches `word` */
export function findTokenIndices(tokens, word) {
  if (!word) return [];
  // Include standard punctuation and Indic Danda (।) and Double Danda (॥)
  const clean = w => w.replace(/^["""'''()\[\]{},;:!?.।॥]+/g, '').replace(/["""'''()\[\]{},;:!?.।॥]+$/g, '').toLowerCase();
  const cw = clean(word);
  const results = [];
  tokens.forEach((tok, i) => {
    if (tok === word || clean(tok) === cw) results.push(i);
  });
  return results;
}

// ── State ──────────────────────────────────────────────────────────────────────
const initialState = {
  // ── Existing fields (unchanged) ──
  isLoggedIn: false,
  username: '',
  role: null,          // 'user' | 'annotator' | 'admin'
  uploadedData: null,  // normalised array
  purpose: null,
  annotatorData: null,
  sentenceIdx: 0,
  annotations: {},     // annotations[sIdx][pIdx] = { answer, correctedWord }
  // ── New fields ──
  projectType: null,         // 'word-alignment' | 'ner'
  language: null,            // 'hindi' | 'malayalam'
  prolificPid: null,         // Prolific participant ID (auto-auth)
  completionCode: 'C1DEMO', // Prolific completion code (overridable via URL)
  currentProjectId: null,   // project currently being annotated
  projects: [],              // [{ id, name, type, language, status, createdBy, createdAt, sentenceCount, annotationResult }]
};

const ACTIONS = {
  // Existing
  LOGIN: 'LOGIN', LOGOUT: 'LOGOUT',
  SET_ROLE: 'SET_ROLE',
  SET_UPLOADED: 'SET_UPLOADED',
  SET_PURPOSE: 'SET_PURPOSE',
  SET_ANNOTATOR_DATA: 'SET_ANNOTATOR_DATA',
  SET_SENTENCE: 'SET_SENTENCE',
  SET_PAIR_ANSWER: 'SET_PAIR_ANSWER',
  RESET: 'RESET',
  // New
  SET_PROJECT_TYPE: 'SET_PROJECT_TYPE',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_PROLIFIC_PID: 'SET_PROLIFIC_PID',
  SET_COMPLETION_CODE: 'SET_COMPLETION_CODE',
  SET_CURRENT_PROJECT_ID: 'SET_CURRENT_PROJECT_ID',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  LOAD_PROJECT_DATA: 'LOAD_PROJECT_DATA',
};

function generateProjectId() {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function reducer(state, { type, payload }) {
  switch (type) {
    // ── Existing cases (logic unchanged) ──────────────────────────────────────
    case ACTIONS.LOGIN:  return { ...state, isLoggedIn: true, username: payload };
    case ACTIONS.LOGOUT: return { ...initialState, projects: state.projects }; // keep project history on logout
    case ACTIONS.SET_ROLE: return { ...state, role: payload };
    case ACTIONS.SET_UPLOADED: return { ...state, uploadedData: payload };
    case ACTIONS.SET_PURPOSE: return { ...state, purpose: payload };
    case ACTIONS.SET_ANNOTATOR_DATA: {
      // Auto-create a project record when user activates a task
      const newProj = {
        id: generateProjectId(),
        name: `Task ${(state.projects || []).length + 1}`,
        type: state.projectType || 'word-alignment',
        language: state.language || 'malayalam',
        purpose: state.purpose,
        status: 'uploaded',     // improvement #2: status field
        createdBy: state.username,
        createdAt: new Date().toISOString(),
        sentenceCount: payload?.length ?? 0,
        dataset: payload,       // Store dataset in project record
        annotationResult: null,
      };
      return {
        ...state,
        annotatorData: payload,
        annotations: {},
        sentenceIdx: 0,
        currentProjectId: newProj.id,   // improvement #3: link projectId
        projects: [...(state.projects || []), newProj],
      };
    }
    case ACTIONS.SET_SENTENCE: return { ...state, sentenceIdx: payload };
    case ACTIONS.SET_PAIR_ANSWER: {
      const { sIdx, pIdx, answer } = payload;
      return {
        ...state,
        annotations: {
          ...state.annotations,
          [sIdx]: { ...(state.annotations[sIdx] || {}), [pIdx]: answer },
        },
      };
    }
    case ACTIONS.RESET: return { ...state, annotations: {}, sentenceIdx: 0 };
    // ── New cases ──────────────────────────────────────────────────────────────
    case ACTIONS.SET_PROJECT_TYPE:    return { ...state, projectType: payload };
    case ACTIONS.SET_LANGUAGE:        return { ...state, language: payload };
    case ACTIONS.SET_PROLIFIC_PID:    return { ...state, prolificPid: payload };
    case ACTIONS.SET_COMPLETION_CODE: return { ...state, completionCode: payload };
    case ACTIONS.SET_CURRENT_PROJECT_ID: return { ...state, currentProjectId: payload };
    case ACTIONS.ADD_PROJECT: return { ...state, projects: [...(state.projects || []), payload] };
    case ACTIONS.UPDATE_PROJECT: {
      return {
        ...state,
        projects: (state.projects || []).map(p =>
          p.id === payload.id ? { ...p, ...payload.updates } : p
        ),
      };
    }
    case ACTIONS.LOAD_PROJECT_DATA: {
      const proj = (state.projects || []).find(p => p.id === payload);
      if (!proj) return state;
      return {
        ...state,
        currentProjectId: proj.id,
        annotatorData: proj.dataset || state.uploadedData, // Use stored dataset if available
        annotations: {},
        sentenceIdx: 0,
      };
    }
    default: return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, () => {
    try {
      const s = localStorage.getItem('wa_app_state');
      if (s) return { ...initialState, ...JSON.parse(s) };
    } catch {}
    return initialState;
  });

  useEffect(() => {
    try { localStorage.setItem('wa_app_state', JSON.stringify(state)); } catch {}
  }, [state]);

  const actions = {
    // ── Existing actions (unchanged) ────────────────────────────────────────────
    login:           (u)   => dispatch({ type: ACTIONS.LOGIN, payload: u }),
    logout:          ()    => { localStorage.removeItem('wa_app_state'); dispatch({ type: ACTIONS.LOGOUT }); },
    setRole:         (r)   => dispatch({ type: ACTIONS.SET_ROLE, payload: r }),
    setUploadedData: (d)   => dispatch({ type: ACTIONS.SET_UPLOADED, payload: d }),
    setPurpose:      (p)   => dispatch({ type: ACTIONS.SET_PURPOSE, payload: p }),
    setAnnotatorData:(d)   => dispatch({ type: ACTIONS.SET_ANNOTATOR_DATA, payload: d }),
    setSentenceIdx:  (i)   => dispatch({ type: ACTIONS.SET_SENTENCE, payload: i }),
    setPairAnswer:   (sIdx, pIdx, answer) =>
      dispatch({ type: ACTIONS.SET_PAIR_ANSWER, payload: { sIdx, pIdx, answer } }),
    reset:           ()    => dispatch({ type: ACTIONS.RESET }),
    // ── New actions ─────────────────────────────────────────────────────────────
    setProjectType:       (t)   => dispatch({ type: ACTIONS.SET_PROJECT_TYPE,       payload: t }),
    setLanguage:          (l)   => dispatch({ type: ACTIONS.SET_LANGUAGE,            payload: l }),
    setProlificPid:       (pid) => dispatch({ type: ACTIONS.SET_PROLIFIC_PID,        payload: pid }),
    setCompletionCode:    (c)   => dispatch({ type: ACTIONS.SET_COMPLETION_CODE,     payload: c }),
    setCurrentProjectId:  (id)  => dispatch({ type: ACTIONS.SET_CURRENT_PROJECT_ID, payload: id }),
    addProject:           (p)   => dispatch({ type: ACTIONS.ADD_PROJECT,             payload: p }),
    updateProject:        (id, updates) =>
      dispatch({ type: ACTIONS.UPDATE_PROJECT, payload: { id, updates } }),
    loadProjectData:       (id) => dispatch({ type: ACTIONS.LOAD_PROJECT_DATA, payload: id }),
  };

  const helpers = {
    getPairAnswer: (sIdx, pIdx) => (state.annotations[sIdx] || {})[pIdx] ?? null,
    getSentenceAnnotations: (sIdx) => state.annotations[sIdx] || {},
    isSentenceComplete: (sIdx) => {
      const sentence = state.annotatorData?.[sIdx];
      if (!sentence) return false;
      const total = sentence.alignment?.length ?? 0;
      const done  = Object.keys(state.annotations[sIdx] || {}).length;
      return done >= total;
    },
    buildFinalOutput: () => {
      if (!state.annotatorData) return [];
      return state.annotatorData.map((sentence, sIdx) => {
        const annMap = state.annotations[sIdx] || {};
        const pairs = (sentence.alignment || []).map((pair, pIdx) => ({
          alignment_index: pIdx,
          en_word:  pair.en_word,
          ml_word:  pair.ml_word,
          answer:   annMap[pIdx]?.answer ?? null,
          corrected_word: annMap[pIdx]?.correctedWord ?? null,
        }));
        return {
          sentence_id: sentence.id,
          english:   sentence.english,
          target:    sentence.target,
          annotations: pairs,
        };
      });
    },
  };

  return (
    <AppContext.Provider value={{ state, actions, helpers }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
