import React, { useContext } from 'react';
import { AppContext } from '../App';
import { AGENTS } from '../data/hydraData';

const METRICS = {
  totalRuns: 1247,
  successRate: 0.962,
  avgLatency: 342,
  avgConfidence: 0.89,
  totalToolCalls: 4830,
  errors: 47,
  humanOverrides: 23,
  overrideAccepted: 17,
  overrideRejected: 4,
  overrideModified: 2,
};

const EVAL_TESTS = [
  { scenario: 'Heavy rainfall + blocked drain + historical flooding', expected: 'HIGH / CRITICAL', actual: 'CRITICAL', score: 92, pass: true, latency: 280, confidence: 0.91 },
  { scenario: 'Moderate rain + clean drains + no reports', expected: 'LOW / MODERATE', actual: 'MODERATE', score: 38, pass: true, latency: 198, confidence: 0.94 },
  { scenario: 'Extreme rain + multiple blocked drains + citizen reports', expected: 'CRITICAL', actual: 'CRITICAL', score: 97, pass: true, latency: 312, confidence: 0.96 },
  { scenario: 'Normal weather + overdue maintenance', expected: 'MODERATE / ELEVATED', actual: 'ELEVATED', score: 55, pass: true, latency: 224, confidence: 0.87 },
  { scenario: 'Heavy rain + fully staffed response teams', expected: 'HIGH with RESPONSE_READY', actual: 'HIGH', score: 74, pass: true, latency: 298, confidence: 0.89 },
];

const DATA_QUALITY = [
  { source: 'Weather Provider', type: 'Rainfall', freshness: '2 min', quality: 'HIGH', confidence: 0.92, icon: '🌧️' },
  { source: 'IoT Drain Sensor', type: 'Water Level', freshness: '1 min', quality: 'HIGH', confidence: 0.95, icon: '🔧' },
  { source: 'Citizen Reports', type: 'Ground Truth', freshness: '4 min', quality: 'MEDIUM', confidence: 0.82, icon: '👥' },
  { source: 'Historical DB', type: 'Incident History', freshness: '24h (static)', quality: 'HIGH', confidence: 0.97, icon: '📊' },
  { source: 'Simulated Sensor', type: 'Road Status', freshness: '5 min', quality: 'SIMULATED', confidence: 0.75, icon: '🛣️' },
];

function MiniBar({ value, max = 1, color = 'var(--cyan)' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 36 }}>
        {typeof value === 'number' && value < 1 ? `${(value * 100).toFixed(0)}%` : value}
      </span>
    </div>
  );
}

export default function AIObservability() {
  const { showToast } = useContext(AppContext);
  const overrideRate = METRICS.humanOverrides / METRICS.totalRuns;

  return (
    <div className="hx-page">
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">🔍 AI OBSERVABILITY</div>
          <div className="hx-page-sub">Agent Performance Metrics · AI Evaluation · Data Quality · Human Override Tracking</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => showToast('Metrics refreshed', 'info')}>↺ REFRESH</button>
      </div>

      {/* Top metrics */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card normal">
          <div className="kpi-label">AGENT RUNS</div>
          <div className="kpi-value normal">{METRICS.totalRuns.toLocaleString()}</div>
          <div className="kpi-sub">Total this session</div>
        </div>
        <div className="kpi-card normal">
          <div className="kpi-label">SUCCESS RATE</div>
          <div className="kpi-value normal">{(METRICS.successRate * 100).toFixed(1)}%</div>
          <div className="kpi-sub">All agents</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-label">AVG LATENCY</div>
          <div className="kpi-value info">{METRICS.avgLatency}</div>
          <div className="kpi-sub">ms per run</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-label">AVG CONFIDENCE</div>
          <div className="kpi-value info">{(METRICS.avgConfidence * 100).toFixed(0)}%</div>
          <div className="kpi-sub">All decisions</div>
        </div>
        <div className="kpi-card elevated">
          <div className="kpi-label">HUMAN OVERRIDES</div>
          <div className="kpi-value elevated">{METRICS.humanOverrides}</div>
          <div className="kpi-sub">{(overrideRate * 100).toFixed(1)}% override rate</div>
        </div>
        <div className="kpi-card high">
          <div className="kpi-label">ERRORS</div>
          <div className="kpi-value high">{METRICS.errors}</div>
          <div className="kpi-sub">Fallback triggered</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Agent performance */}
        <div className="hx-card">
          <div className="hx-card-title">⚙️ AGENT PERFORMANCE</div>
          <div className="hx-table-wrap">
            <table className="hx-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Status</th>
                  <th>Conf.</th>
                  <th>Tasks</th>
                  <th>Tools</th>
                </tr>
              </thead>
              <tbody>
                {AGENTS.map(agent => (
                  <tr key={agent.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{agent.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{agent.name.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`agent-badge ${agent.status}`}>{agent.status}</span>
                    </td>
                    <td>
                      <span style={{ color: agent.confidence >= 0.9 ? 'var(--green)' : agent.confidence >= 0.8 ? 'var(--cyan)' : 'var(--yellow)', fontWeight: 700 }}>
                        {(agent.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>{agent.tasks}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{agent.toolCalls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Human override tracking */}
        <div>
          <div className="hx-card" style={{ marginBottom: 16 }}>
            <div className="hx-card-title">👤 HUMAN OVERRIDE ANALYSIS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Accepted', value: METRICS.overrideAccepted, color: 'var(--green)' },
                { label: 'Rejected', value: METRICS.overrideRejected, color: 'var(--red)' },
                { label: 'Modified', value: METRICS.overrideModified, color: 'var(--yellow)' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: 7, border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.6 }}>
              Override rate: <strong style={{ color: 'var(--yellow)' }}>{(overrideRate * 100).toFixed(1)}%</strong> · AI acceptance rate: <strong style={{ color: 'var(--green)' }}>{(METRICS.overrideAccepted / METRICS.humanOverrides * 100).toFixed(0)}%</strong> of reviewed recommendations were accepted.
            </div>
          </div>

          {/* AI Evaluation */}
          <div className="hx-card">
            <div className="hx-card-title">🧪 AI EVALUATION RESULTS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {EVAL_TESTS.map((test, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ flex: 1, fontSize: 11.5, color: 'var(--text-dim)', paddingRight: 10 }}>{test.scenario}</div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                      background: test.pass ? 'var(--green-ghost)' : 'var(--red-ghost)',
                      color: test.pass ? 'var(--green)' : 'var(--red)',
                      border: `1px solid ${test.pass ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>{test.pass ? '✓ PASS' : '✕ FAIL'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 10.5, color: 'var(--text-muted)' }}>
                    <span>Expected: <strong style={{ color: 'var(--text-dim)' }}>{test.expected}</strong></span>
                    <span>Got: <strong style={{ color: test.pass ? 'var(--green)' : 'var(--red)' }}>{test.actual}</strong></span>
                    <span>Conf: <strong style={{ color: 'var(--cyan)' }}>{(test.confidence * 100).toFixed(0)}%</strong></span>
                    <span>{test.latency}ms</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--green-ghost)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 7, fontSize: 11, color: 'var(--green)', fontWeight: 700, textAlign: 'center' }}>
              ✓ PASS RATE: {Math.round(EVAL_TESTS.filter(t => t.pass).length / EVAL_TESTS.length * 100)}% ({EVAL_TESTS.filter(t => t.pass).length}/{EVAL_TESTS.length} tests)
            </div>
          </div>
        </div>
      </div>

      {/* Data Quality */}
      <div className="hx-card" style={{ marginTop: 16 }}>
        <div className="hx-card-title">📡 DATA QUALITY ENGINE</div>
        <div className="hx-table-wrap">
          <table className="hx-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Source</th>
                <th>Data Type</th>
                <th>Freshness</th>
                <th>Quality</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {DATA_QUALITY.map((d, i) => {
                const qualColor = d.quality === 'HIGH' ? 'var(--green)' : d.quality === 'MEDIUM' ? 'var(--yellow)' : d.quality === 'SIMULATED' ? 'var(--text-muted)' : 'var(--orange)';
                return (
                  <tr key={i}>
                    <td style={{ fontSize: 18 }}>{d.icon}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text)' }}>{d.source}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{d.type}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--cyan)', fontSize: 12 }}>{d.freshness}</td>
                    <td>
                      <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: `${qualColor}15`, color: qualColor, border: `1px solid ${qualColor}30` }}>
                        {d.quality}
                      </span>
                    </td>
                    <td><MiniBar value={d.confidence} color={d.confidence > 0.9 ? 'var(--green)' : 'var(--cyan)'} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
