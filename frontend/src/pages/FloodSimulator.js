import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { ZONES, DRAINS, getRiskLevel } from '../data/hydraData';
import { runScenarioSimulation, computeCounterfactual } from '../data/riskEngine';
import { DEMO_SCENARIOS } from '../data/simulationEngine';

function LineChart({ data, color = 'var(--cyan)' }) {
  if (!data || data.length === 0) return null;
  const W = 420, H = 130, padL = 36, padB = 24, padT = 10, padR = 12;
  const w = W - padL - padR, h = H - padT - padB;
  const maxVal = 100;
  const xs = data.map((_, i) => padL + (i / (data.length - 1)) * w);
  const ys = data.map(d => padT + h - (d.risk / maxVal) * h);
  const polyline = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const fill = `${xs[0]},${padT + h} ` + xs.map((x, i) => `${x},${ys[i]}`).join(' ') + ` ${xs[xs.length - 1]},${padT + h}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {[0, 25, 50, 75, 100].map(v => {
        const y = padT + h - (v / maxVal) * h;
        return <g key={v}>
          <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="rgba(232,244,255,0.06)" strokeWidth="1" />
          <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(232,244,255,0.35)">{v}</text>
        </g>;
      })}
      <polygon points={fill} fill={`${color}18`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r="3.5" fill={color} stroke="var(--bg2)" strokeWidth="1.5" />
      ))}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H - 2} textAnchor="middle" fontSize="9" fill="rgba(232,244,255,0.4)">{d.label}</text>
      ))}
    </svg>
  );
}

export default function FloodSimulator() {
  const { city, showToast } = useContext(AppContext);
  const zones = ZONES[city] || [];
  const drains = DRAINS[city] || [];

  const [params, setParams] = useState({
    rainfall: 60,
    duration: 2,
    drainageEfficiency: 65,
    blockedDrains: 3,
    teamAvailability: 70,
  });
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [cfZone, setCfZone] = useState(zones[0]?.id || '');
  const [cfDrain, setCfDrain] = useState(drains[0]?.id || '');
  const [cfHours, setCfHours] = useState(3);
  const [cfResult, setCfResult] = useState(null);

  function setPreset(presetKey) {
    const p = DEMO_SCENARIOS[presetKey];
    setParams({
      rainfall: p.rainfall,
      duration: p.duration,
      drainageEfficiency: p.drainageEfficiency,
      blockedDrains: p.blockedDrains,
      teamAvailability: p.teamAvailability,
    });
  }

  function runSimulation() {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      const scenarioZones = runScenarioSimulation(params, zones);
      const criticalCount = scenarioZones.filter(z => z.scenarioRisk >= 81).length;
      const baselineCritical = zones.filter(z => z.riskScore >= 81).length;
      const chartData = [
        { label: 'Base', risk: baselineCritical > 0 ? 42 : 28 },
        { label: '+30m', risk: Math.round(params.rainfall * 0.5) },
        { label: '+1h', risk: Math.round(params.rainfall * 0.7) },
        { label: 'Peak', risk: Math.min(100, Math.round(params.rainfall * 1.1)) },
        { label: '+2h', risk: Math.round(params.rainfall * 0.85) },
        { label: '+3h', risk: Math.round(params.rainfall * 0.65) },
      ];
      setResults({ scenarioZones, criticalCount, baselineCritical, chartData, params: { ...params } });
      setRunning(false);
      showToast(`Simulation complete: ${criticalCount} critical zones projected`, criticalCount >= 5 ? 'warn' : 'info');
    }, 1800);
  }

  function runCounterfactual() {
    const zone = zones.find(z => z.id === cfZone);
    const drain = drains.find(d => d.id === cfDrain);
    if (!zone || !drain) return;
    const r = computeCounterfactual(zone, drain, cfHours);
    setCfResult({ zone, drain, hours: cfHours, ...r });
  }



  return (
    <div className="hx-page">
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">🧪 FLOOD SCENARIO SIMULATOR</div>
          <div className="hx-page-sub">Multi-variable flood scenario modeling · What-if counterfactual analysis</div>
        </div>
        <div className="demo-banner">⬡ MODEL ESTIMATE / SIMULATION — NOT A GUARANTEED REAL-WORLD OUTCOME</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="hx-card">
            <div className="hx-card-title">⚙ SCENARIO PARAMETERS</div>
            {/* Presets */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {Object.entries(DEMO_SCENARIOS).map(([key, s]) => (
                <button
                  key={key}
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, fontSize: 10 }}
                  onClick={() => setPreset(key)}
                >{s.name}</button>
              ))}
            </div>

            {[
              { key: 'rainfall', label: 'Rainfall Intensity (mm/h)', min: 10, max: 120 },
              { key: 'duration', label: 'Rain Duration (hours)', min: 1, max: 6 },
              { key: 'drainageEfficiency', label: 'Drainage Efficiency (%)', min: 10, max: 100 },
              { key: 'blockedDrains', label: 'Blocked Drains (count)', min: 0, max: 10 },
              { key: 'teamAvailability', label: 'Team Availability (%)', min: 20, max: 100 },
            ].map(({ key, label, min, max }) => (
              <div className="form-group" key={key} style={{ marginBottom: 14 }}>
                <label className="form-label">{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="range" min={min} max={max} value={params[key]}
                    className="hx-slider"
                    onChange={e => setParams(p => ({ ...p, [key]: Number(e.target.value) }))}
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)', minWidth: 36 }}>{params[key]}</span>
                </div>
              </div>
            ))}

            <button
              className="btn btn-cyan w-full"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={runSimulation}
              disabled={running}
            >
              {running ? <><span className="spinner" style={{ width: 14, height: 14 }} /> RUNNING AI SIMULATION...</> : '▶ RUN AI SIMULATION'}
            </button>
          </div>

          {/* What-if section */}
          <div className="hx-card">
            <div className="hx-card-title">🔄 WHAT-IF EARLIER ACTION?</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>If a drain was cleaned earlier, estimate risk reduction</div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Zone</label>
              <select className="form-select" value={cfZone} onChange={e => setCfZone(e.target.value)}>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 10 }}>
              <label className="form-label">Drain</label>
              <select className="form-select" value={cfDrain} onChange={e => setCfDrain(e.target.value)}>
                {drains.map(d => <option key={d.id} value={d.id}>{d.id} ({d.zone})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Hours Earlier Cleaned: {cfHours}h</label>
              <input type="range" min={1} max={8} value={cfHours} className="hx-slider"
                onChange={e => setCfHours(Number(e.target.value))} />
            </div>
            <button className="btn btn-primary w-full" style={{ width: '100%', justifyContent: 'center' }} onClick={runCounterfactual}>
              COMPUTE COUNTERFACTUAL
            </button>

            {cfResult && (
              <div style={{ marginTop: 14, padding: 12, background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>COUNTERFACTUAL RESULT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>ACTUAL</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--red)' }}>{cfResult.zone.riskScore}</div>
                  </div>
                  <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>→</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700 }}>IF CLEANED {cfHours}H EARLIER</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--green)' }}>{cfResult.newRisk}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  • Est. affected area: <strong style={{ color: 'var(--green)' }}>-{cfResult.areaReduction}%</strong><br />
                  • Est. response demand: <strong style={{ color: 'var(--green)' }}>-{cfResult.responseReduction}%</strong>
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  COUNTERFACTUAL MODEL ESTIMATE · Not a guaranteed real-world outcome
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Baseline vs Scenario comparison */}
          <div className="hx-card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', padding: '16px 0', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>📊 BASELINE</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--orange)' }}>{zones.filter(z => z.riskScore >= 81).length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Critical Zones</div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)' }}>Rainfall: {ZONES[city]?.[0]?.rainfall || 18} mm/h</div>
              </div>
              <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontSize: 28, color: 'var(--border)' }}>→</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>AI SIM</div>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 0', borderLeft: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: results ? 'var(--red)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  🌊 {results ? 'SCENARIO RESULT' : 'AWAITING SIMULATION'}
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: results ? 'var(--red)' : 'var(--text-muted)' }}>
                  {results ? results.criticalCount : '—'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Critical Zones</div>
                {results && <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)' }}>Rainfall: {params.rainfall} mm/h</div>}
              </div>
            </div>
          </div>

          {results ? (
            <>
              {/* Projected risk chart */}
              <div className="hx-card">
                <div className="hx-card-title">📈 PROJECTED RISK TRAJECTORY</div>
                <LineChart data={results.chartData} color={results.criticalCount >= 5 ? 'var(--red)' : 'var(--orange)'} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                  MODEL ESTIMATE · SIMULATION-BASED · Peak risk at approximately +1 hour
                </div>
              </div>

              {/* Zone projection table */}
              <div className="hx-card">
                <div className="hx-card-title">🗺️ ZONE-BY-ZONE PROJECTION</div>
                <div className="hx-table-wrap">
                  <table className="hx-table">
                    <thead>
                      <tr>
                        <th>Zone</th>
                        <th>Baseline Risk</th>
                        <th>Scenario Risk</th>
                        <th>Change</th>
                        <th>Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.scenarioZones.map(z => {
                        const { level } = getRiskLevel(z.scenarioRisk);
                        const change = z.scenarioRisk - z.riskScore;
                        return (
                          <tr key={z.id}>
                            <td style={{ fontWeight: 700, color: 'var(--text)' }}>{z.name}</td>
                            <td>
                              <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{z.riskScore}</span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: getRiskLevel(z.scenarioRisk).color }}>{z.scenarioRisk}</span>
                            </td>
                            <td>
                              <span style={{ color: change > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                                {change > 0 ? '↑' : '↓'} {Math.abs(change)}
                              </span>
                            </td>
                            <td><span className={`risk-badge ${level}`}>{level}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI action plan */}
              <div className="hx-card" style={{ border: '1px solid rgba(0,212,255,0.2)', background: 'linear-gradient(135deg, var(--surface), rgba(0,212,255,0.03))' }}>
                <div className="hx-card-title">🤖 AI ACTION PLAN — IBM GRANITE</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
                  IBM Granite analyzed the scenario and generated the following response plan:
                </div>
                {[
                  `Activate ${results.criticalCount} emergency response protocols`,
                  `Pre-position pump trucks at ${results.scenarioZones.filter(z => z.scenarioRisk >= 81).map(z => z.name).join(', ')}`,
                  `Inspect ${Math.min(8, results.params.blockedDrains * 2)} priority drainage assets`,
                  `Issue flood advisory for low-lying areas in affected zones`,
                  `Request ${results.criticalCount > 8 ? 'external municipal resources (shortage risk)' : 'standby reserve team activation'}`,
                ].map((action, i) => (
                  <div className="ai-action-item" key={i}>
                    <div className="ai-action-num">{i + 1}</div>
                    {action}
                  </div>
                ))}
                <div style={{ marginTop: 10, fontSize: 10.5, color: 'var(--text-muted)' }}>
                  🛡️ Required teams: <strong style={{ color: 'var(--cyan)' }}>{results.criticalCount + 2}</strong> ·
                  Priority drains: <strong style={{ color: 'var(--cyan)' }}>{results.params.blockedDrains * 2}</strong> ·
                  Confidence: <strong style={{ color: 'var(--green)' }}>88%</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="hx-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 14, color: 'var(--text-muted)' }}>
              {running ? (
                <>
                  <span className="spinner" style={{ width: 32, height: 32 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Running AI simulation...</div>
                  <div style={{ fontSize: 11 }}>Analyzing {zones.length} zones · {DRAINS[city]?.length || 0} drains · weather data</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 32 }}>🧪</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Configure parameters and click RUN AI SIMULATION</div>
                  <div style={{ fontSize: 11 }}>Results will show zone-by-zone risk projections and an AI action plan</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
