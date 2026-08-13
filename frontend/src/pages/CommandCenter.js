import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { ZONES, DRAINS, INCIDENTS, WEATHER, RESPONSE_TEAMS, getRiskLevel } from '../data/hydraData';
import { EMERGENCY_STEPS } from '../data/simulationEngine';

/* ── Zone pixel positions for SVG viewBox 600x400 ─────────────────────── */
const ZONE_COORDS = {
  AHMEDABAD: {
    PALDI:       { cx: 200, cy: 220 },
    VASTRAPUR:   { cx: 150, cy: 140 },
    MANINAGAR:   { cx: 320, cy: 260 },
    BOPAL:       { cx:  80, cy: 180 },
    NAVRANGPURA: { cx: 185, cy: 165 },
  },
  SURAT: {
    ADAJAN:   { cx: 160, cy: 140 },
    VESU:     { cx: 100, cy: 250 },
    ATHWA:    { cx: 240, cy: 180 },
    VARACHHA: { cx: 340, cy: 130 },
    KATARGAM: { cx: 310, cy:  80 },
  },
};

/* ── AI panel content per city ─────────────────────────────────────────── */
const AI_CONTENT = {
  AHMEDABAD: {
    zone: 'Vastrapur',
    prevRisk: 61,
    currentRisk: 89,
    trend: 'RAPIDLY INCREASING',
    causes: [
      'Intense rainfall at 82 mm/h — 3× above drain capacity',
      'DRN-2031 at 42% condition with 78% blockage probability',
      'Metro Station and mall area generating high foot traffic',
      'Historical flooding index 0.71 — zone highly susceptible',
    ],
    actions: [
      'Deploy T-03 to DRN-2031 for emergency drain cleaning',
      'Issue precautionary advisory for Vastrapur residential',
      'Pre-position pump truck at Vastrapur Metro exit',
      'Activate traffic diversion on Sarkhej–Gandhinagar Highway',
    ],
  },
  SURAT: {
    zone: 'Adajan',
    prevRisk: 65,
    currentRisk: 88,
    trend: 'RAPIDLY INCREASING',
    causes: [
      'Rainfall at 80 mm/h — highest recorded this monsoon cycle',
      'DRN-S1022 at 39% condition, emergency cleaning required',
      'Hospital access road at critical flood depth risk',
      'Historical flooding index 0.75 — recurrent flood zone',
    ],
    actions: [
      'Dispatch T-01 to Adajan Patiya for flood containment',
      'Emergency drain cleaning on DRN-S1022 within 1 hour',
      'Alert New Civil Hospital to activate contingency access route',
      'Request 2 additional pump trucks from Surat North depot',
    ],
  },
};

/* ── Global timeline events ────────────────────────────────────────────── */
const GLOBAL_EVENTS = [
  { time: '10:08', event: 'Officer approved road closure — Paldi junction', type: 'approval' },
  { time: '10:06', event: 'Risk raised to CRITICAL for Vastrapur (89/100)', type: 'risk' },
  { time: '10:04', event: '3 duplicate reports auto-clustered → INC-1024', type: 'ai' },
  { time: '10:03', event: 'AI classified flooding in Paldi (94% confidence)', type: 'ai' },
];

/* ── Utility ───────────────────────────────────────────────────────────── */
function riskRadius(score) {
  return Math.round(20 + ((score - 30) / 70) * 20);
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function CommandCenter() {
  const { city, showToast, setSimulationRunning, setSystemAlert } = useContext(AppContext);

  const [selectedZone, setSelectedZone] = useState(null);
  const [simRunning, setSimRunning]     = useState(false);
  const [simLog, setSimLog]             = useState([]);

  /* Reset selected zone when city changes */
  useEffect(() => { setSelectedZone(null); }, [city]);

  const zones     = ZONES[city] || [];
  const drains    = DRAINS[city] || [];
  const incidents = INCIDENTS[city] || [];
  const weather   = WEATHER[city] || {};
  const teams     = RESPONSE_TEAMS[city] || [];
  const aiContent = AI_CONTENT[city];

  /* ── KPI derived values ─────────────────────────────────────────────── */
  const drainAlerts = drains.filter(d => d.status === 'CRITICAL' || d.status === 'POOR').length;
  const activeIncidents = incidents.filter(i => i.status === 'ACTIVE').length;
  const availableTeams = teams.filter(t => t.status === 'AVAILABLE').length;
  const totalTeams = teams.length;

  /* ── Timeline events ────────────────────────────────────────────────── */
  const cityTimeline = incidents[0]?.timeline?.slice(0, 3) || [];
  const allEvents = [
    ...cityTimeline.map(t => ({ ...t, source: incidents[0]?.zone })),
    ...GLOBAL_EVENTS,
  ].slice(0, 6);

  /* ── Simulation ─────────────────────────────────────────────────────── */
  function startSimulation() {
    if (simRunning) return;
    setSimRunning(true);
    setSimulationRunning(true);
    setSystemAlert(true);
    setSimLog([]);

    EMERGENCY_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setSimLog(prev => [...prev, step]);
        if (idx === EMERGENCY_STEPS.length - 1) {
          setTimeout(() => {
            setSimRunning(false);
            setSimulationRunning(false);
            setSystemAlert(false);
            showToast('✓ Simulation complete', 'success');
          }, 1500);
        }
      }, idx * 3000);
    });
  }

  /* ── SVG city map ───────────────────────────────────────────────────── */
  const coords = ZONE_COORDS[city] || {};

  function CityMap() {
    return (
      <div className="hx-map-container" style={{ height: 420, position: 'relative', overflow: 'hidden' }}>
        {/* Map header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 6px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.08em' }}>
            {city === 'AHMEDABAD' ? 'AHMEDABAD' : 'SURAT'} FLOOD RISK MAP
          </span>
          <span style={{ fontSize: 10, background: 'rgba(0,212,255,0.12)', color: 'var(--cyan)', border: '1px solid var(--cyan)', borderRadius: 3, padding: '2px 8px', letterSpacing: '0.06em' }}>
            ⬡ LIVE SIMULATION
          </span>
        </div>

        {/* SVG map */}
        <svg viewBox="0 0 600 360" style={{ width: '100%', height: 'calc(100% - 38px)', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="600" height="360" fill="var(--bg, #0a0f1e)" />
          <rect width="600" height="360" fill="url(#grid)" />

          {/* City outline */}
          {city === 'AHMEDABAD' ? (
            <rect x="50" y="60" width="480" height="260" rx="6"
              fill="rgba(0,212,255,0.03)" stroke="rgba(0,212,255,0.18)" strokeWidth="1.2" strokeDasharray="6 4"/>
          ) : (
            <ellipse cx="230" cy="180" rx="220" ry="130"
              fill="rgba(0,212,255,0.03)" stroke="rgba(0,212,255,0.18)" strokeWidth="1.2" strokeDasharray="6 4"/>
          )}

          {/* City label */}
          <text x="530" y="80" textAnchor="end" fontSize="11" fill="rgba(0,212,255,0.35)" fontFamily="monospace" letterSpacing="1">
            {city}
          </text>

          {/* Zone circles */}
          {zones.map(zone => {
            const pos = coords[zone.id];
            if (!pos) return null;
            const rl = getRiskLevel(zone.riskScore);
            const r  = riskRadius(zone.riskScore);
            const isSelected = selectedZone?.id === zone.id;

            return (
              <g key={zone.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedZone(isSelected ? null : zone)}>
                {/* Pulse ring for selected */}
                {isSelected && (
                  <circle cx={pos.cx} cy={pos.cy} r={r + 10}
                    fill="none" stroke={rl.color} strokeWidth="1.5" opacity="0.4" strokeDasharray="4 3"/>
                )}
                {/* Outer glow ring */}
                <circle cx={pos.cx} cy={pos.cy} r={r + 5}
                  fill="none" stroke={rl.color} strokeWidth="0.8" opacity="0.25"/>
                {/* Main zone circle */}
                <circle cx={pos.cx} cy={pos.cy} r={r}
                  fill={rl.bg || `${rl.color}22`} stroke={rl.color}
                  strokeWidth={isSelected ? 2.5 : 1.8} opacity="0.95"/>
                {/* Risk score */}
                <text x={pos.cx} y={pos.cy + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="12" fontWeight="700" fill={rl.color} fontFamily="monospace">
                  {zone.riskScore}
                </text>
                {/* Zone name label */}
                <text x={pos.cx} y={pos.cy + r + 13} textAnchor="middle"
                  fontSize="9" fill="rgba(226,232,240,0.8)" fontFamily="monospace" letterSpacing="0.5">
                  {zone.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Connection lines between zones */}
          {zones.map((zone, i) => {
            const a = coords[zone.id];
            if (!a || i === 0) return null;
            const prev = coords[zones[i - 1]?.id];
            if (!prev) return null;
            return (
              <line key={`ln-${zone.id}`} x1={prev.cx} y1={prev.cy} x2={a.cx} y2={a.cy}
                stroke="rgba(0,212,255,0.1)" strokeWidth="0.8" strokeDasharray="3 5"/>
            );
          })}

          {/* Legend */}
          {[['CRITICAL', '#ef4444'], ['HIGH', '#f97316'], ['ELEVATED', '#eab308'], ['MODERATE', '#22c55e']].map(([lbl, clr], i) => (
            <g key={lbl} transform={`translate(${20 + i * 72}, 338)`}>
              <circle cx="5" cy="5" r="4" fill={clr} opacity="0.75"/>
              <text x="12" y="9" fontSize="8" fill="rgba(148,163,184,0.8)" fontFamily="monospace">{lbl}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  /* ── Zone detail panel ──────────────────────────────────────────────── */
  function ZonePanel({ zone }) {
    if (!zone) return null;
    const rl = getRiskLevel(zone.riskScore);
    const zoneIncident = incidents.find(i => i.zone === zone.id);
    const zoneDrain    = drains.find(d => d.zone === zone.id);
    return (
      <div className="zone-panel" style={{
        background: 'var(--surface)', border: `1px solid ${rl.color}44`,
        borderRadius: 6, padding: '14px 16px', marginTop: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: rl.color }}>{zone.name}</span>
          <span style={{ fontSize: 10, background: rl.bg, color: rl.color, padding: '2px 8px', borderRadius: 3 }}>
            {rl.level} — {zone.riskScore}/100
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 11 }}>
          <div>
            <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Rainfall</div>
            <div style={{ color: 'var(--text)' }}>{zone.rainfall} mm/h</div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Population</div>
            <div style={{ color: 'var(--text)' }}>{(zone.population / 1000).toFixed(0)}k</div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Trend</div>
            <div style={{ color: zone.trend.includes('INCREASING') ? '#f97316' : '#22c55e' }}>
              {zone.trend.replace('_', ' ')}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Drainage Risk</div>
            <div style={{ color: zone.drainageRisk === 'HIGH' ? '#ef4444' : 'var(--text)' }}>{zone.drainageRisk}</div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Reports</div>
            <div style={{ color: 'var(--text)' }}>{zone.citizenReports} citizen</div>
          </div>
          <div>
            <div style={{ color: 'var(--muted)', marginBottom: 2 }}>Confidence</div>
            <div style={{ color: 'var(--cyan)' }}>{Math.round(zone.confidence * 100)}%</div>
          </div>
        </div>
        {zone.criticalInfra.length > 0 && (
          <div style={{ marginTop: 8, fontSize: 11 }}>
            <span style={{ color: 'var(--muted)' }}>Critical Infrastructure: </span>
            <span style={{ color: '#f97316' }}>{zone.criticalInfra.join(', ')}</span>
          </div>
        )}
        {zoneIncident && (
          <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(239,68,68,0.08)', borderRadius: 4, fontSize: 11, borderLeft: '2px solid #ef4444' }}>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>{zoneIncident.id}: </span>
            <span style={{ color: 'var(--muted)' }}>{zoneIncident.description}</span>
          </div>
        )}
        {zoneDrain && (
          <div style={{ marginTop: 6, padding: '4px 8px', background: 'rgba(249,115,22,0.07)', borderRadius: 4, fontSize: 11 }}>
            <span style={{ color: '#f97316' }}>{zoneDrain.id} — </span>
            <span style={{ color: 'var(--muted)' }}>{zoneDrain.recommendation}</span>
          </div>
        )}
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ padding: '20px 24px', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.06em', margin: 0 }}>
            HYDRA-X COMMAND CENTER
          </h1>
          <p style={{ fontSize: 11, color: 'var(--muted)', margin: '3px 0 0', letterSpacing: '0.04em' }}>
            {city} · IBM GRANITE AI · REAL-TIME FLOOD INTELLIGENCE
          </p>
        </div>
        <button
          className="btn-emergency"
          disabled={simRunning}
          onClick={startSimulation}
          style={{
            background: simRunning ? 'rgba(239,68,68,0.3)' : 'var(--red, #ef4444)',
            color: '#fff', border: '1px solid #ef4444', borderRadius: 5,
            padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em',
            cursor: simRunning ? 'not-allowed' : 'pointer', opacity: simRunning ? 0.7 : 1,
          }}
        >
          {simRunning ? '⟳ SIMULATION RUNNING...' : '🚨 START FLOOD EMERGENCY SIMULATION'}
        </button>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 18 }}>
        {/* 1 Overall Flood Risk */}
        <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>OVERALL FLOOD RISK</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>87<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/100</span></div>
          <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4, fontWeight: 700, letterSpacing: '0.06em' }}>CRITICAL</div>
        </div>

        {/* 2 Critical Zones */}
        <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>CRITICAL ZONES</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>12</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>city-wide</div>
        </div>

        {/* 3 Active Incidents */}
        <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>ACTIVE INCIDENTS</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#f97316', lineHeight: 1 }}>{activeIncidents}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{city.charAt(0) + city.slice(1).toLowerCase()}</div>
        </div>

        {/* 4 Drainage Alerts */}
        <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>DRAINAGE ALERTS</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{drainAlerts}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>CRITICAL+POOR</div>
        </div>

        {/* 5 Rainfall */}
        <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>RAINFALL</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--cyan)', lineHeight: 1 }}>{weather.current}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}> mm/h</span></div>
          <div style={{ fontSize: 10, color: '#f97316', marginTop: 4, fontWeight: 700 }}>{weather.intensity}</div>
        </div>

        {/* 6 Response Teams */}
        <div className="kpi-card" style={{ background: 'var(--surface)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>RESPONSE TEAMS</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>
            {availableTeams}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/{totalTeams}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>available</div>
        </div>

        {/* 7 Data Status */}
        <div className="kpi-card" style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.4)', borderRadius: 6, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>DATA STATUS</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#eab308', lineHeight: 1.3 }}>SIMULATED</div>
          <div style={{ fontSize: 10, color: '#eab308', marginTop: 4, opacity: 0.8 }}>DEMO DATA</div>
        </div>
      </div>

      {/* ── Main 2-column layout ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, marginBottom: 14 }}>

        {/* LEFT — GIS Map */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <CityMap />
          <div style={{ padding: '0 14px 14px' }}>
            <ZonePanel zone={selectedZone} />
            {!selectedZone && (
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
                Click a zone circle to view details
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — AI Command Panel */}
        <div className="ai-panel" style={{ background: 'var(--surface)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
          {/* AI panel header */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', letterSpacing: '0.06em' }}>🧠 AI COMMAND PANEL — IBM GRANITE</span>
            <span style={{ fontSize: 10, background: 'rgba(0,212,255,0.12)', color: 'var(--cyan)', border: '1px solid var(--cyan)', borderRadius: 3, padding: '2px 7px' }}>94% CONFIDENCE</span>
          </div>

          <div style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
            {/* Top critical alert */}
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '10px 12px', marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 4 }}>TOP CRITICAL ALERT</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>{aiContent.zone} — Risk Escalating</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>
                Risk score: <span style={{ color: '#f97316' }}>{aiContent.prevRisk}</span> → <span style={{ color: '#ef4444', fontWeight: 700 }}>{aiContent.currentRisk}/100</span>
              </div>
              <div style={{ fontSize: 10, color: '#f97316', letterSpacing: '0.04em' }}>⬆ {aiContent.trend}</div>
            </div>

            {/* Causes */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 8 }}>ROOT CAUSES IDENTIFIED</div>
              {aiContent.causes.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, marginBottom: 6, fontSize: 11 }}>
                  <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}>•</span>
                  <span style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{c}</span>
                </div>
              ))}
            </div>

            {/* Recommended actions */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 8 }}>RECOMMENDED ACTIONS</div>
              {aiContent.actions.map((a, i) => (
                <div key={i} className="ai-action-item" style={{ display: 'flex', gap: 8, marginBottom: 6, padding: '6px 8px', background: 'rgba(0,212,255,0.05)', borderRadius: 4, fontSize: 11, borderLeft: '2px solid var(--cyan)' }}>
                  <span style={{ color: 'var(--cyan)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <button style={{ background: 'rgba(0,212,255,0.12)', color: 'var(--cyan)', border: '1px solid var(--cyan)', borderRadius: 4, padding: '7px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}>
              REVIEW PLAN
            </button>
            <button onClick={() => showToast('Action plan approved', 'success')} style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid #22c55e', borderRadius: 4, padding: '7px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}>
              APPROVE
            </button>
            <button style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}>
              MODIFY
            </button>
            <button onClick={() => showToast('Alert dismissed', 'info')} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '7px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer' }}>
              DISMISS
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom row: Timeline + Sim Log ──────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: simLog.length > 0 ? '1fr 360px' : '1fr', gap: 14 }}>

        {/* Live Event Timeline */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.06em', marginBottom: 14 }}>
            LIVE EVENT TIMELINE
            <span style={{ marginLeft: 10, fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>— last 6 events</span>
          </div>
          <div className="event-timeline">
            {allEvents.map((ev, i) => {
              const dotColor = ev.type === 'risk' ? '#ef4444' : ev.type === 'ai' ? 'var(--cyan)' : ev.type === 'approval' ? '#22c55e' : ev.type === 'response' ? '#f97316' : 'var(--muted)';
              return (
                <div key={i} className="timeline-item" style={{ display: 'flex', gap: 12, marginBottom: i < allEvents.length - 1 ? 14 : 0, position: 'relative' }}>
                  {/* Vertical connector */}
                  {i < allEvents.length - 1 && (
                    <div style={{ position: 'absolute', left: 5, top: 12, width: 1, height: 22, background: 'var(--border)' }} />
                  )}
                  <div className="timeline-dot" style={{ width: 11, height: 11, borderRadius: '50%', background: dotColor, flexShrink: 0, marginTop: 2, boxShadow: `0 0 6px ${dotColor}88` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: 'var(--cyan)', fontFamily: 'monospace', fontWeight: 600 }}>{ev.time}</span>
                      {ev.source && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{ev.source}</span>}
                      <span style={{ fontSize: 10, color: dotColor, fontWeight: 600, marginLeft: 'auto' }}>{ev.type?.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ev.event}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulation Event Log (visible during sim) */}
        {simLog.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 8, padding: '14px 16px', overflowY: 'auto', maxHeight: 340 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em', marginBottom: 14 }}>
              🚨 SIMULATION EVENT LOG
              <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>
                {simLog.length}/{EMERGENCY_STEPS.length} steps
              </span>
            </div>
            {simLog.map((step, i) => (
              <div key={step.id} className="sim-step" style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '7px 8px', background: i === simLog.length - 1 ? 'rgba(239,68,68,0.08)' : 'transparent', borderRadius: 4, borderLeft: i === simLog.length - 1 ? '2px solid #ef4444' : '2px solid var(--border)' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{step.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: i === simLog.length - 1 ? 'var(--text)' : 'var(--muted)', marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>{step.description}</div>
                  <div style={{ fontSize: 9, color: 'rgba(0,212,255,0.6)', marginTop: 2, letterSpacing: '0.04em' }}>AGENT: {step.agent}</div>
                </div>
              </div>
            ))}
            {simRunning && (
              <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--cyan)', marginTop: 8, letterSpacing: '0.06em' }}>
                ⟳ PROCESSING NEXT STEP...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
