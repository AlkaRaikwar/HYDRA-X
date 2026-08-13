import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { ZONES } from '../data/hydraData';
import { DAMAGE_ASSESSMENTS } from '../data/simulationEngine';
import { ROOT_CAUSE_CHAINS } from '../data/riskEngine';

const RESILIENCE_DATA = {
  AHMEDABAD: { overall: 74, drainage: 68, response: 82, infrastructure: 71, citizenFlow: 79, preparedness: 65 },
  SURAT:     { overall: 71, drainage: 65, response: 78, infrastructure: 68, citizenFlow: 74, preparedness: 62 },
};

function ResilienceRing({ value, label, color }) {
  const r = 26; const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="68" height="68" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--bg3)" strokeWidth="5" />
        <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      </svg>
      <div style={{ fontSize: 16, fontWeight: 900, color, marginTop: -44, lineHeight: '68px', position: 'relative', zIndex: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function DamageRecovery() {
  const { city, showToast } = useContext(AppContext);
  const damages = DAMAGE_ASSESSMENTS.filter(d => d.city === city);
  const res     = RESILIENCE_DATA[city];
  const chainKeys = Object.keys(ROOT_CAUSE_CHAINS);
  const [selZone, setSelZone] = useState(chainKeys.find(k => (ZONES[city] || []).some(z => z.id === k)) || chainKeys[0]);
  const [uploadSim, setUploadSim] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const chain = ROOT_CAUSE_CHAINS[selZone] || [];

  function simulateUpload() {
    setUploadSim(true);
    setAnalysisResult(null);
    setTimeout(() => {
      setAnalysisResult({
        type: 'Road Damage + Water Depth Indicators',
        severity: 'HIGH',
        confidence: 0.87,
        details: 'Road surface erosion detected. Water depth marker at ~0.35m. Drain overflow visible.',
        action: 'Emergency dewatering + road inspection within 4 hours',
      });
      setUploadSim(false);
      showToast('✓ Demo vision analysis complete', 'success');
    }, 2200);
  }

  return (
    <div className="hx-page">
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">🏗️ DAMAGE & RECOVERY</div>
          <div className="hx-page-sub">Post-Event Assessment · Root Cause Analysis · Urban Resilience Score</div>
        </div>
        <div className="demo-banner">⬡ SIMULATION-BASED ESTIMATE</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Root Cause Chain */}
        <div className="hx-card" style={{ gridRow: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div className="hx-card-title" style={{ marginBottom: 0 }}>🔗 ROOT CAUSE ANALYSIS</div>
            <select className="form-select" style={{ width: 130 }} value={selZone} onChange={e => setSelZone(e.target.value)}>
              {chainKeys.map(k => <option key={k} value={k}>{k.charAt(0) + k.slice(1).toLowerCase()}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 16, padding: '8px 10px', background: 'var(--bg2)', borderRadius: 7, border: '1px solid var(--border)' }}>
            🤖 IBM Granite traced the causal chain from initial trigger to final impact for zone <strong style={{ color: 'var(--cyan)' }}>{selZone}</strong>.
          </div>
          <div className="cause-chain">
            {chain.map((step, i) => (
              <div className="cause-step" key={i}>
                <div className={`cause-node ${step.type}`}>{step.icon}</div>
                <div className="cause-content">
                  <div className="cause-event">{step.event}</div>
                  <div className="cause-type">{step.type.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Before vs After */}
          <div style={{ marginTop: 20 }}>
            <div className="hx-card-title">📊 WITHOUT vs WITH HYDRA-X</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 14, background: 'var(--red-ghost)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>✗ WITHOUT HYDRA-X</div>
                {['Rain falls', 'Flood occurs', 'Citizen complaints', 'Manual detection (delay)', 'Uncoordinated response', 'Extended damage'].map((step, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: 'var(--text-dim)', padding: '5px 0', borderBottom: '1px solid rgba(239,68,68,0.1)', display: 'flex', gap: 7 }}>
                    <span style={{ color: 'var(--red)' }}>→</span> {step}
                  </div>
                ))}
              </div>
              <div style={{ padding: 14, background: 'var(--green-ghost)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>✓ WITH HYDRA-X</div>
                {['Forecast detects risk', 'Drain maintenance scheduled', 'Risk predicted 2h early', 'AI coordinates response', 'Teams pre-positioned', 'Est. -31% affected area'].map((step, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: 'var(--text-dim)', padding: '5px 0', borderBottom: '1px solid rgba(34,197,94,0.1)', display: 'flex', gap: 7 }}>
                    <span style={{ color: 'var(--green)' }}>→</span> {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Damage Assessments */}
        <div className="hx-card">
          <div className="hx-card-title">📋 DAMAGE ASSESSMENT QUEUE</div>
          <div style={{ marginBottom: 12, padding: '8px 10px', background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 7, fontSize: 11, color: 'var(--yellow)' }}>
            ⬡ DEMO VISION ANALYSIS — Simulated damage detection. In production, field photos would be analyzed by IBM Granite Vision.
          </div>
          {damages.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 30 }}>No damage reports for {city}</div>
          ) : (
            damages.map(d => {
              const sevColor = { CRITICAL: 'var(--red)', HIGH: 'var(--orange)', MODERATE: 'var(--yellow)', LOW: 'var(--green)' }[d.severity] || 'var(--cyan)';
              return (
                <div key={d.id} style={{ padding: '12px 14px', marginBottom: 10, background: 'var(--bg2)', borderRadius: 9, border: `1px solid ${sevColor}25` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{d.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{d.type.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.zone} · {d.id}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className={`risk-badge ${{ CRITICAL: 'CRITICAL', HIGH: 'HIGH', MODERATE: 'ELEVATED' }[d.severity] || 'LOW'}`}>{d.severity}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, background: d.priority === 'P0' ? 'var(--red-ghost)' : d.priority === 'P1' ? 'var(--orange-ghost)' : 'var(--bg3)', color: d.priority === 'P0' ? 'var(--red)' : d.priority === 'P1' ? 'var(--orange)' : 'var(--text-muted)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)' }}>{d.priority}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginBottom: 6 }}>{d.action}</div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: 'var(--text-muted)' }}>
                    <span>Evidence: <strong style={{ color: 'var(--cyan)' }}>{d.evidence}</strong></span>
                    <span>Conf: <strong style={{ color: 'var(--green)' }}>{Math.round(d.confidence * 100)}%</strong></span>
                    <span>Est. Cost: <strong style={{ color: 'var(--yellow)' }}>{d.estimatedCost}</strong></span>
                  </div>
                </div>
              );
            })
          )}
          {/* Simulated upload */}
          <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg2)', borderRadius: 9, border: '1px dashed var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>📷 Simulate field photo upload</div>
            <button className="btn btn-ghost w-full" style={{ width: '100%', justifyContent: 'center' }} onClick={simulateUpload} disabled={uploadSim}>
              {uploadSim ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Analyzing...</> : '📷 SIMULATE DAMAGE PHOTO UPLOAD'}
            </button>
            {analysisResult && (
              <div style={{ marginTop: 10, padding: 10, background: 'rgba(0,212,255,0.06)', borderRadius: 7, border: '1px solid rgba(0,212,255,0.15)' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--cyan)', marginBottom: 6, textTransform: 'uppercase' }}>🤖 DEMO VISION ANALYSIS</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>{analysisResult.type}</strong><br />
                  Severity: <strong style={{ color: 'var(--orange)' }}>{analysisResult.severity}</strong> · Confidence: {Math.round(analysisResult.confidence * 100)}%<br />
                  {analysisResult.details}<br />
                  <strong>Action:</strong> {analysisResult.action}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resilience Score */}
        <div className="hx-card">
          <div className="hx-card-title">📊 CITY RESILIENCE SCORE</div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: res.overall >= 75 ? 'var(--green)' : res.overall >= 60 ? 'var(--yellow)' : 'var(--orange)', lineHeight: 1, textShadow: `0 0 30px ${res.overall >= 75 ? 'rgba(34,197,94,0.4)' : 'rgba(234,179,8,0.4)'}` }}>
              {res.overall}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>/ 100 · {city}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Drainage', value: res.drainage, color: 'var(--cyan)' },
              { label: 'Response', value: res.response, color: 'var(--green)' },
              { label: 'Infra', value: res.infrastructure, color: 'var(--blue)' },
              { label: 'Citizens', value: res.citizenFlow, color: 'var(--yellow)' },
              { label: 'Prepared', value: res.preparedness, color: 'var(--orange)' },
            ].map(m => <ResilienceRing key={m.label} {...m} />)}
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg2)', borderRadius: 7, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            🤖 <strong style={{ color: 'var(--text-dim)' }}>IBM Granite Resilience Analysis:</strong> Drainage capacity and preparedness are the lowest-scoring dimensions. Recommend prioritizing proactive drain maintenance schedule and pre-event resource staging.
            <br /><em>SIMULATION-BASED ESTIMATE · Not a real city performance metric.</em>
          </div>
        </div>
      </div>
    </div>
  );
}
