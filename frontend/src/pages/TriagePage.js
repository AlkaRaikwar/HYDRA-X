import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, RotateCcw, Video, AlertCircle } from 'lucide-react';
import { submitTriage } from '../services/api';
import { ToastContext } from '../App';

const WORKFLOW_STEPS = [
  { id: 'input', label: 'Patient Input', icon: '👤' },
  { id: 'triage', label: 'Triage Agent', icon: '🩺' },
  { id: 'severity', label: 'Severity Agent', icon: '📊' },
  { id: 'result', label: 'Recommendation', icon: '✅' },
];

const SEVERITY_CONFIG = {
  ROUTINE: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', emoji: '🟢', label: 'Routine — Home Care Advised' },
  MODERATE: { color: '#ca8a04', bg: '#fefce8', border: '#fde68a', emoji: '🟡', label: 'Moderate — Consultation Recommended' },
  URGENT: { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', emoji: '🟠', label: 'Urgent — Same-day Care Required' },
  EMERGENCY: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', emoji: '🔴', label: 'EMERGENCY — Seek Immediate Care' },
};

export default function TriagePage() {
  const navigate = useNavigate();
  const showToast = useContext(ToastContext);
  const [lang, setLang] = useState('en');
  const [form, setForm] = useState({ name: '', age: '', gender: '', village: '', symptoms: '', duration: '', existingConditions: '', currentMedicines: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Web Speech API (Gujarati / English)
  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Voice input not supported in this browser. Please use Chrome.', 'error'); return; }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = lang === 'gu' ? 'gu-IN' : 'en-IN';
    r.onresult = e => { set('symptoms', form.symptoms + ' ' + e.results[0][0].transcript); };
    r.onerror = () => showToast('Voice input error. Please type symptoms.', 'error');
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
    showToast(`Listening in ${lang === 'gu' ? 'Gujarati' : 'English'}... Speak now.`, 'info');
  };

  const validate = () => {
    const e = {};
    if (!form.symptoms.trim() || form.symptoms.trim().length < 5) e.symptoms = 'Please describe symptoms (min 5 characters).';
    if (!form.age || isNaN(form.age) || form.age < 0 || form.age > 120) e.age = 'Please enter a valid age.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setWorkflowStep(0);
    try {
      setTimeout(() => setWorkflowStep(1), 600);
      setTimeout(() => setWorkflowStep(2), 1400);
      const res = await submitTriage({ ...form, language: lang });
      setWorkflowStep(3);
      setResult(res.data);
      showToast('Triage completed successfully.', 'success');
    } catch (err) {
      showToast('Triage failed. Check backend connection.', 'error');
      setWorkflowStep(-1);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setForm({ name: '', age: '', gender: '', village: '', symptoms: '', duration: '', existingConditions: '', currentMedicines: '' }); setResult(null); setWorkflowStep(-1); setErrors({}); };

  const sev = result ? SEVERITY_CONFIG[result.severity] : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🩺 Patient Triage</h2>
          <p>AI-assisted preliminary symptom assessment — Gujarati & English supported</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setLang('en')}>English</button>
          <button className={`btn btn-sm ${lang === 'gu' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setLang('gu')}>ગુજરાતી</button>
        </div>
      </div>
      <div className="page-body">

        {/* Disclaimer */}
        <div className="disclaimer mb-4">
          <span>⚠️</span>
          <span><strong>Important:</strong> This triage tool provides preliminary AI-based decision support only. It does NOT diagnose disease, prescribe medicine, or replace a qualified doctor. For emergencies, call 108 immediately.</span>
        </div>

        {/* Workflow indicator */}
        {workflowStep >= 0 && (
          <div className="card mb-4">
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '12px' }}>AGENT WORKFLOW</div>
            <div className="agent-flow">
              {WORKFLOW_STEPS.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div className={`agent-node ${i < workflowStep ? 'node-done' : i === workflowStep ? 'node-active' : 'node-pending'}`}>
                    <div className="node-icon">
                      {i < workflowStep ? '✓' : step.icon}
                    </div>
                    <div className="node-label">{step.label}</div>
                    <div className="node-status">{i < workflowStep ? 'Done' : i === workflowStep ? 'Running…' : 'Waiting'}</div>
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && <div className="agent-arrow">→</div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '20px' }}>
          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="card">
              <div className="section-header"><h3>{lang === 'gu' ? '🏥 દર્દી માહિતી' : '🏥 Patient Information'}</h3></div>
              <div className="form-grid">
                <div className="form-group">
                  <label>{lang === 'gu' ? 'નામ (વૈકલ્પિક)' : 'Name (Optional)'}</label>
                  <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder={lang === 'gu' ? 'દર્દીનું નામ' : 'Patient name'} />
                </div>
                <div className="form-group">
                  <label>{lang === 'gu' ? 'ઉંમર *' : 'Age *'}</label>
                  <input className={`form-input ${errors.age ? 'error' : ''}`} type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 35" min="0" max="120" />
                  {errors.age && <span className="form-error">{errors.age}</span>}
                </div>
                <div className="form-group">
                  <label>{lang === 'gu' ? 'જાતિ' : 'Gender'}</label>
                  <select className="form-select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="Male">{lang === 'gu' ? 'પુરૂષ' : 'Male'}</option>
                    <option value="Female">{lang === 'gu' ? 'સ્ત્રી' : 'Female'}</option>
                    <option value="Other">{lang === 'gu' ? 'અન્ય' : 'Other'}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{lang === 'gu' ? 'ગામ / સ્થળ' : 'Village / Location'}</label>
                  <input className="form-input" value={form.village} onChange={e => set('village', e.target.value)} placeholder="e.g. Subir, Dangs" />
                </div>
                <div className="form-group full-width">
                  <label>{lang === 'gu' ? 'લક્ષણો *' : 'Symptoms *'}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <textarea
                      className={`form-textarea ${errors.symptoms ? 'error' : ''}`}
                      rows={3}
                      value={form.symptoms}
                      onChange={e => set('symptoms', e.target.value)}
                      placeholder={lang === 'gu' ? 'તમારા લક્ષણો વર્ણવો...' : 'Describe symptoms, e.g. high fever, headache, body ache for 3 days'}
                      style={{ flex: 1 }}
                    />
                    <button type="button" className={`btn btn-sm ${listening ? 'btn-danger' : 'btn-ghost'}`} onClick={toggleVoice} title={listening ? 'Stop recording' : `Voice input (${lang === 'gu' ? 'Gujarati' : 'English'})`} style={{ alignSelf: 'flex-start' }}>
                      {listening ? <MicOff size={14} /> : <Mic size={14} />}
                    </button>
                  </div>
                  {lang === 'gu' && <div className="hint">🎤 ગુજરાતીમાં બોલો અથવા ટાઇપ કરો</div>}
                  {errors.symptoms && <span className="form-error">{errors.symptoms}</span>}
                </div>
                <div className="form-group">
                  <label>{lang === 'gu' ? 'કેટલા સમયથી' : 'Duration'}</label>
                  <input className="form-input" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 2 days / 3 hours" />
                </div>
                <div className="form-group">
                  <label>{lang === 'gu' ? 'અગાઉ ની બીમારી' : 'Existing Conditions'}</label>
                  <input className="form-input" value={form.existingConditions} onChange={e => set('existingConditions', e.target.value)} placeholder="e.g. Diabetes, Hypertension" />
                </div>
                <div className="form-group full-width">
                  <label>{lang === 'gu' ? 'વર્તમાન દવાઓ' : 'Current Medicines'}</label>
                  <input className="form-input" value={form.currentMedicines} onChange={e => set('currentMedicines', e.target.value)} placeholder="e.g. Metformin 500mg" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> {lang === 'gu' ? 'વિશ્લેષણ...' : 'Analysing...'}</> : <><Send size={14} /> {lang === 'gu' ? 'ટ્રાઇજ સબમિટ કરો' : 'Submit for Triage'}</>}
                </button>
                {result && <button type="button" className="btn btn-ghost" onClick={reset}><RotateCcw size={14} /> New Patient</button>}
              </div>
            </div>
          </form>

          {/* TRIAGE RESULT */}
          {result && sev && (
            <div>
              <div className={`triage-result triage-${result.severity}`} style={{ borderColor: sev.border, background: sev.bg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: sev.color }}>{sev.emoji} {result.severity}</div>
                    <div style={{ fontSize: '14px', color: sev.color, fontWeight: 600 }}>{sev.label}</div>
                  </div>
                  <span className={`badge badge-${result.aiMode}`}>{result.aiMode === 'IBM_GRANITE' ? 'IBM Granite' : 'Demo AI'}</span>
                </div>

                {result.gujaratiSummary && (
                  <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', fontSize: '14px', color: '#1e40af', fontFamily: 'sans-serif' }}>
                    {result.gujaratiSummary}
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '6px' }}>Key Symptoms Detected</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.keySymptoms?.map((s, i) => <span key={i} style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '20px', padding: '3px 10px', fontSize: '12px' }}>{s}</span>)}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '4px' }}>AI Reasoning</div>
                  <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{result.reasoning}</p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.8)', borderRadius: '8px', padding: '12px 14px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: '4px' }}>Recommended Next Step</div>
                  <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.6 }}>{result.recommendedNextStep}</p>
                </div>

                {result.emergencyCareRequired && (
                  <div className="alert alert-danger" style={{ marginBottom: '12px' }}>
                    <AlertCircle size={16} />
                    <strong>EMERGENCY: Call 108 immediately. Do not delay emergency care.</strong>
                  </div>
                )}

                {result.teleconsultRecommended && !result.emergencyCareRequired && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/teleconsult/${result.caseId}`)}>
                    <Video size={14} /> Schedule Teleconsultation
                  </button>
                )}

                <div className="disclaimer" style={{ marginTop: '12px' }}>
                  <span>⚕️</span>
                  <span style={{ fontSize: '11px' }}>{result.disclaimer}</span>
                </div>
              </div>

              <div className="alert alert-success mt-3">
                <span>✓</span>
                <span>Case <strong>{result.caseId?.slice(0, 8)}…</strong> recorded in ASHA/PHC Dashboard.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
