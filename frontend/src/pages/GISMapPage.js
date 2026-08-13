import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import {
  ZONES, INCIDENTS, DRAINS, RESPONSE_TEAMS,
  CRITICAL_INFRASTRUCTURE, WEATHER, getRiskLevel,
} from '../data/hydraData';

/* ─── Time slider config ─────────────────────────────────── */
const TIME_STEPS = [
  { label: '08:00', factor: 0.45 },
  { label: '09:00', factor: 0.60 },
  { label: '10:00', factor: 0.75 },
  { label: '11:00', factor: 1.00 },
  { label: '12:00', factor: 1.05 },
  { label: '13:00', factor: 0.95 },
  { label: '14:00', factor: 0.85 },
  { label: '15:00', factor: 0.70 },
];

/* ─── Zone SVG positions ─────────────────────────────────── */
const ZONE_POS = {
  AHMEDABAD: {
    PALDI:       { cx: 250, cy: 300 },
    VASTRAPUR:   { cx: 180, cy: 200 },
    MANINAGAR:   { cx: 420, cy: 340 },
    BOPAL:       { cx: 100, cy: 250 },
    NAVRANGPURA: { cx: 230, cy: 220 },
  },
  SURAT: {
    ADAJAN:   { cx: 200, cy: 180 },
    VESU:     { cx: 130, cy: 300 },
    ATHWA:    { cx: 300, cy: 230 },
    VARACHHA: { cx: 430, cy: 160 },
    KATARGAM: { cx: 400, cy: 100 },
  },
};

/* ─── Radius by population ───────────────────────────────── */
function zoneRadius(pop) {
  if (pop >= 120000) return 55;
  if (pop >= 100000) return 48;
  if (pop >= 85000)  return 42;
  if (pop >= 72000)  return 36;
  return 30;
}

/* ─── Drain / incident / team / CI positions (derived from zone) ─ */
function offsetPos(cx, cy, dx, dy) { return { x: cx + dx, y: cy + dy }; }

/* ─── AI recommendation per zone ────────────────────────── */
function aiRec(zone) {
  if (zone.riskScore >= 85) return `Dispatch additional response team to ${zone.name}. Issue public advisory for low-lying areas. Pre-position pumps near ${zone.criticalInfra[0] || 'critical assets'}.`;
  if (zone.riskScore >= 65) return `Monitor ${zone.name} drainage closely. Schedule proactive drain cleaning within 2 hours. Alert residents via SMS.`;
  if (zone.riskScore >= 45) return `Routine inspection recommended for ${zone.name}. Ensure pumping equipment is on standby.`;
  return `No immediate action required for ${zone.name}. Continue standard monitoring cycles.`;
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function GISMapPage() {
  const { city } = useContext(AppContext);

  const [layers, setLayers] = useState({
    floodRisk:      true,
    drainage:       true,
    incidents:      true,
    teams:          true,
    infrastructure: true,
    weather:        false,
  });
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [timeIdx, setTimeIdx] = useState(3); // 11:00 default
  const [selectedZone, setSelectedZone] = useState(null);

  const timeFactor = TIME_STEPS[timeIdx].factor;

  /* Apply time factor to risk scores */
  const zones = useMemo(() => {
    const raw = ZONES[city] || [];
    return raw.map(z => ({
      ...z,
      riskScore: Math.min(100, Math.round(z.riskScore * timeFactor)),
    }));
  }, [city, timeFactor]);

  /* Filter by severity */
  const visibleZones = useMemo(() => {
    if (severityFilter === 'ALL') return zones;
    return zones.filter(z => getRiskLevel(z.riskScore).level === severityFilter);
  }, [zones, severityFilter]);

  const incidents  = INCIDENTS[city]             || [];
  const drains     = DRAINS[city]                || [];
  const teams      = RESPONSE_TEAMS[city]        || [];
  const ciList     = CRITICAL_INFRASTRUCTURE[city] || [];
  const weather    = WEATHER[city];
  const positions  = ZONE_POS[city] || {};

  function toggleLayer(key) {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const zoneDetail = selectedZone
    ? zones.find(z => z.id === selectedZone)
    : null;

  const zoneCI = zoneDetail
    ? ciList.filter(ci => ci.zone === zoneDetail.id)
    : [];

  /* ── Styles (inline so no CSS file changes needed) ── */
  const S = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      overflow: 'hidden',
      background: 'var(--bg)',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)',
      flexShrink: 0,
      height: 52,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: 900,
      letterSpacing: 3,
      background: 'linear-gradient(90deg, #00d4ff, #3b82f6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    headerMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontSize: 11,
      color: 'var(--text-muted)',
    },
    body: {
      display: 'flex',
      flex: 1,
      overflow: 'hidden',
    },
    /* Left sidebar */
    sidebar: {
      width: 180,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '14px 12px',
      gap: 18,
      overflowY: 'auto',
    },
    sideSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },
    sideLabel: {
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginBottom: 2,
    },
    layerRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '5px 0',
      cursor: 'pointer',
      fontSize: 11.5,
      color: 'var(--text-dim)',
      borderRadius: 5,
      userSelect: 'none',
    },
    checkbox: {
      width: 13,
      height: 13,
      accentColor: 'var(--cyan)',
      cursor: 'pointer',
      flexShrink: 0,
    },
    select: {
      padding: '6px 8px',
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      color: 'var(--text)',
      fontSize: 11.5,
      width: '100%',
      outline: 'none',
    },
    sliderWrap: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    sliderLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 10,
      color: 'var(--text-muted)',
    },
    timeValue: {
      fontSize: 18,
      fontWeight: 900,
      color: 'var(--cyan)',
      textAlign: 'center',
      letterSpacing: 1,
      marginBottom: 2,
    },
    /* Map area */
    mapWrap: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      background: '#0a1020',
    },
    mapSvg: {
      width: '100%',
      height: '100%',
    },
    /* Legend overlay */
    legend: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      background: 'rgba(8,14,26,0.88)',
      border: '1px solid rgba(0,212,255,0.15)',
      borderRadius: 8,
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
    },
    legendTitle: {
      fontSize: 9,
      fontWeight: 800,
      letterSpacing: '0.1em',
      color: 'var(--text-muted)',
      marginBottom: 2,
    },
    legendRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      fontSize: 10.5,
      color: 'var(--text-dim)',
    },
    legendDot: {
      width: 9,
      height: 9,
      borderRadius: '50%',
      flexShrink: 0,
    },
    /* Active layers overlay */
    activeLayers: {
      position: 'absolute',
      top: 12,
      right: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      alignItems: 'flex-end',
    },
    layerBadge: {
      padding: '3px 9px',
      borderRadius: 20,
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: '0.05em',
      background: 'rgba(0,212,255,0.12)',
      border: '1px solid rgba(0,212,255,0.22)',
      color: 'var(--cyan)',
    },
    /* Right detail panel */
    detailPanel: {
      width: 300,
      flexShrink: 0,
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    },
  };

  /* ── LAYER DEFINITIONS ── */
  const LAYER_DEFS = [
    { key: 'floodRisk',      label: 'Flood Risk',            color: '#ef4444' },
    { key: 'drainage',       label: 'Drainage Network',      color: '#f97316' },
    { key: 'incidents',      label: 'Active Incidents',      color: '#ef4444' },
    { key: 'teams',          label: 'Response Teams',        color: '#22c55e' },
    { key: 'infrastructure', label: 'Critical Infrastructure', color: '#00d4ff' },
    { key: 'weather',        label: 'Weather',               color: '#3b82f6' },
  ];

  const activeLayerNames = LAYER_DEFS.filter(l => layers[l.key]).map(l => l.label);

  return (
    <div style={S.page}>
      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={S.headerTitle}>GIS OPERATIONS MAP</div>
          <span className="risk-badge CRITICAL" style={{ fontSize: 9.5 }}>LIVE</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{city}</span>
        </div>
        <div style={S.headerMeta}>
          {weather && (
            <>
              <span>🌧 {weather.current} mm/h</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>💧 {weather.humidity}% RH</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span>💨 {weather.windSpeed} km/h</span>
              {weather.stormAlert && (
                <span style={{ color: 'var(--red)', fontWeight: 700, fontSize: 10 }}>⚡ STORM ALERT</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={S.body}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={S.sidebar}>
          {/* Layer toggles */}
          <div style={S.sideSection}>
            <div style={S.sideLabel}>Layers</div>
            {LAYER_DEFS.map(l => (
              <label key={l.key} style={S.layerRow}>
                <input
                  type="checkbox"
                  style={S.checkbox}
                  checked={layers[l.key]}
                  onChange={() => toggleLayer(l.key)}
                />
                <span
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: l.color, flexShrink: 0,
                  }}
                />
                {l.label}
              </label>
            ))}
          </div>

          {/* Severity filter */}
          <div style={S.sideSection}>
            <div style={S.sideLabel}>Severity Filter</div>
            <select
              style={S.select}
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              {['ALL', 'CRITICAL', 'HIGH', 'ELEVATED', 'MODERATE'].map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'All Zones' : s}</option>
              ))}
            </select>
          </div>

          {/* Time slider */}
          <div style={S.sideSection}>
            <div style={S.sideLabel}>Time Simulation</div>
            <div style={S.timeValue}>{TIME_STEPS[timeIdx].label}</div>
            <div style={S.sliderWrap}>
              <input
                type="range"
                className="hx-slider"
                min={0}
                max={7}
                step={1}
                value={timeIdx}
                onChange={e => setTimeIdx(Number(e.target.value))}
              />
              <div style={S.sliderLabel}>
                <span>08:00</span>
                <span>15:00</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              Risk factor: <span style={{ color: 'var(--cyan)' }}>{(timeFactor * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Zone count */}
          <div style={S.sideSection}>
            <div style={S.sideLabel}>Zones Shown</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--cyan)' }}>
              {visibleZones.length}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>
                /{zones.length}
              </span>
            </div>
          </div>
        </div>

        {/* ── MAP ── */}
        <div style={S.mapWrap}>
          <svg
            viewBox="0 0 700 500"
            style={S.mapSvg}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background */}
            <rect width="700" height="500" fill="#0d1629" />

            {/* City grid roads */}
            {/* Horizontal roads */}
            <line x1="0"   y1="120" x2="700" y2="120" stroke="#1a2540" strokeWidth="2" />
            <line x1="0"   y1="230" x2="700" y2="230" stroke="#1a2540" strokeWidth="2" />
            <line x1="0"   y1="310" x2="700" y2="310" stroke="#1a2540" strokeWidth="1.5" />
            <line x1="0"   y1="400" x2="700" y2="400" stroke="#1a2540" strokeWidth="1.5" />
            {/* Vertical roads */}
            <line x1="140" y1="0" x2="140" y2="500" stroke="#1a2540" strokeWidth="2" />
            <line x1="280" y1="0" x2="280" y2="500" stroke="#1a2540" strokeWidth="1.5" />
            <line x1="420" y1="0" x2="420" y2="500" stroke="#1a2540" strokeWidth="2" />
            <line x1="560" y1="0" x2="560" y2="500" stroke="#1a2540" strokeWidth="1.5" />
            {/* Highway */}
            <line x1="0"   y1="170" x2="700" y2="170" stroke="#202e50" strokeWidth="4" />
            <line x1="340" y1="0"   x2="340" y2="500" stroke="#202e50" strokeWidth="4" />

            {/* Sabarmati river (left side, Ahmedabad) or Tapi (Surat, left side) */}
            {city === 'AHMEDABAD' && (
              <g>
                <path
                  d="M 55 0 C 58 60, 48 100, 60 150 C 72 200, 50 240, 58 290 C 66 340, 50 380, 60 430 C 68 460, 55 480, 58 500"
                  fill="none"
                  stroke="#1e3a5f"
                  strokeWidth="18"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M 55 0 C 58 60, 48 100, 60 150 C 72 200, 50 240, 58 290 C 66 340, 50 380, 60 430 C 68 460, 55 480, 58 500"
                  fill="none"
                  stroke="#2563a8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <text x="38" y="260" fontSize="8" fill="#2563a8" opacity="0.7" textAnchor="middle" transform="rotate(-90 38 260)">SABARMATI</text>
              </g>
            )}
            {city === 'SURAT' && (
              <g>
                <path
                  d="M 0 430 C 80 420, 160 440, 240 425 C 320 410, 400 435, 480 420 C 560 405, 620 425, 700 415"
                  fill="none"
                  stroke="#1e3a5f"
                  strokeWidth="18"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M 0 430 C 80 420, 160 440, 240 425 C 320 410, 400 435, 480 420 C 560 405, 620 425, 700 415"
                  fill="none"
                  stroke="#2563a8"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.6"
                />
                <text x="350" y="448" fontSize="8" fill="#2563a8" opacity="0.7" textAnchor="middle">TAPI RIVER</text>
              </g>
            )}

            {/* ── DRAIN MARKERS (small orange squares) ── */}
            {layers.drainage && drains.map(d => {
              const zp = positions[d.zone];
              if (!zp) return null;
              const { x, y } = offsetPos(zp.cx, zp.cy, -14, 14);
              const col = d.status === 'CRITICAL' ? '#ef4444'
                : d.status === 'POOR' ? '#f97316'
                : d.status === 'WARNING' ? '#eab308'
                : '#22c55e';
              return (
                <g key={d.id}>
                  <rect x={x - 5} y={y - 5} width={10} height={10} fill={col} opacity={0.85} rx={1} />
                  <rect x={x - 5} y={y - 5} width={10} height={10} fill="none" stroke={col} strokeWidth={1} opacity={0.4} rx={1} />
                </g>
              );
            })}

            {/* ── INCIDENT MARKERS (red diamonds) ── */}
            {layers.incidents && incidents.map(inc => {
              const zp = positions[inc.zone];
              if (!zp) return null;
              const { x, y } = offsetPos(zp.cx, zp.cy, 16, -16);
              const col = inc.severity === 'CRITICAL' ? '#ef4444'
                : inc.severity === 'HIGH' ? '#f97316'
                : '#eab308';
              const size = 7;
              return (
                <g key={inc.id}>
                  <polygon
                    points={`${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`}
                    fill={col}
                    opacity={0.9}
                  />
                  <polygon
                    points={`${x},${y - size - 2} ${x + size + 2},${y} ${x},${y + size + 2} ${x - size - 2},${y}`}
                    fill="none"
                    stroke={col}
                    strokeWidth={1}
                    opacity={0.3}
                  />
                </g>
              );
            })}

            {/* ── TEAM MARKERS (green triangles) ── */}
            {layers.teams && teams.map(t => {
              const zone = zones.find(z => z.id === t.assignedTo?.replace('INC-', '') || t.assignedTo);
              // place near their lat/lng approximation — use zone position or fixed offset
              const allZones = ZONES[city] || [];
              const assignedZone = allZones.find(z => {
                const inc = incidents.find(i => i.id === t.assignedTo);
                return inc && inc.zone === z.id;
              });
              const fallbackZone = assignedZone || allZones[0];
              const zp = fallbackZone ? positions[fallbackZone.id] : null;
              if (!zp) return null;
              const idx = teams.indexOf(t);
              const { x, y } = offsetPos(zp.cx, zp.cy, -22 + idx * 12, -22);
              const col = t.status === 'DEPLOYED' ? '#22c55e' : '#00d4ff';
              const h = 11;
              return (
                <g key={t.id + city}>
                  <polygon
                    points={`${x},${y - h} ${x + 7},${y + 4} ${x - 7},${y + 4}`}
                    fill={col}
                    opacity={0.88}
                  />
                </g>
              );
            })}

            {/* ── CI MARKERS (cyan crosses) ── */}
            {layers.infrastructure && ciList.map(ci => {
              const zp = positions[ci.zone];
              if (!zp) return null;
              const { x, y } = offsetPos(zp.cx, zp.cy, 14, 14);
              return (
                <g key={ci.id}>
                  <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="#00d4ff" strokeWidth={2.5} opacity={0.85} />
                  <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke="#00d4ff" strokeWidth={2.5} opacity={0.85} />
                  <circle cx={x} cy={y} r={8} fill="none" stroke="#00d4ff" strokeWidth={0.8} opacity={0.25} />
                </g>
              );
            })}

            {/* ── ZONE CIRCLES (flood risk layer) ── */}
            {layers.floodRisk && visibleZones.map(z => {
              const pos = positions[z.id];
              if (!pos) return null;
              const { cx, cy } = pos;
              const r = zoneRadius(z.population);
              const rl = getRiskLevel(z.riskScore);
              const isSelected = selectedZone === z.id;
              return (
                <g
                  key={z.id}
                  onClick={() => setSelectedZone(isSelected ? null : z.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer glow */}
                  <circle cx={cx} cy={cy} r={r + 16} fill={rl.color} opacity={0.10} />
                  <circle cx={cx} cy={cy} r={r + 8}  fill={rl.color} opacity={0.07} />
                  {/* Main circle */}
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill={rl.color}
                    opacity={isSelected ? 0.9 : 0.55}
                    stroke={rl.color}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      cx={cx} cy={cy} r={r + 4}
                      fill="none"
                      stroke={rl.color}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      opacity={0.7}
                    />
                  )}
                  {/* Zone name */}
                  <text
                    x={cx} y={cy - 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight="700"
                    fill="#fff"
                    style={{ pointerEvents: 'none', textShadow: '0 1px 3px #000' }}
                  >
                    {z.name}
                  </text>
                  {/* Risk score */}
                  <text
                    x={cx} y={cy + 11}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight="800"
                    fill={rl.color}
                    style={{ pointerEvents: 'none' }}
                  >
                    {z.riskScore}
                  </text>
                </g>
              );
            })}

            {/* ── ZONES hidden (no floodRisk) — still show labels ── */}
            {!layers.floodRisk && visibleZones.map(z => {
              const pos = positions[z.id];
              if (!pos) return null;
              const { cx, cy } = pos;
              return (
                <g
                  key={z.id}
                  onClick={() => setSelectedZone(selectedZone === z.id ? null : z.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle cx={cx} cy={cy} r={12} fill="rgba(0,212,255,0.08)" stroke="rgba(0,212,255,0.3)" strokeWidth={1} />
                  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="#00d4ff">{z.name.slice(0, 4)}</text>
                </g>
              );
            })}

            {/* ── Weather overlay ── */}
            {layers.weather && weather && (
              <g>
                <rect x={490} y={14} width={195} height={62} rx={7} fill="rgba(8,14,26,0.82)" stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
                <text x={500} y={32} fontSize={9} fill="#3b82f6" fontWeight="800" letterSpacing="1">WEATHER</text>
                <text x={500} y={47} fontSize={11} fill="#e8f4ff">🌧 {weather.current} mm/h · {weather.intensity}</text>
                <text x={500} y={62} fontSize={10.5} fill="rgba(232,244,255,0.55)">
                  {weather.humidity}% RH · {weather.temperature}°C · {weather.windSpeed} km/h
                </text>
                {weather.stormAlert && (
                  <text x={500} y={72} fontSize={9.5} fill="#ef4444" fontWeight="700">⚡ STORM ALERT ACTIVE</text>
                )}
              </g>
            )}
          </svg>

          {/* ── LEGEND overlay ── */}
          <div style={S.legend}>
            <div style={S.legendTitle}>Risk Levels</div>
            {[
              { label: 'CRITICAL',  color: '#ef4444' },
              { label: 'HIGH',      color: '#f97316' },
              { label: 'ELEVATED',  color: '#eab308' },
              { label: 'MODERATE',  color: '#22c55e' },
              { label: 'LOW',       color: '#06b6d4' },
            ].map(l => (
              <div key={l.label} style={S.legendRow}>
                <span style={{ ...S.legendDot, background: l.color }} />
                {l.label}
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(0,212,255,0.1)', marginTop: 6, paddingTop: 6 }}>
              {[
                { shape: '▪', color: '#f97316', label: 'Drain' },
                { shape: '◆', color: '#ef4444', label: 'Incident' },
                { shape: '▲', color: '#22c55e', label: 'Team' },
                { shape: '+', color: '#00d4ff', label: 'Infra' },
              ].map(l => (
                <div key={l.label} style={{ ...S.legendRow, marginBottom: 2 }}>
                  <span style={{ color: l.color, fontSize: 11 }}>{l.shape}</span>
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Active layers overlay ── */}
          <div style={S.activeLayers}>
            {activeLayerNames.map(name => (
              <div key={name} style={S.layerBadge}>{name.toUpperCase()}</div>
            ))}
          </div>
        </div>

        {/* ── RIGHT DETAIL PANEL ── */}
        {zoneDetail && (
          <div style={S.detailPanel}>
            <ZoneDetailPanel
              zone={zoneDetail}
              ciList={zoneCI}
              incidents={incidents.filter(i => i.zone === zoneDetail.id)}
              onClose={() => setSelectedZone(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ZONE DETAIL PANEL
════════════════════════════════════════════════════════════ */
function ZoneDetailPanel({ zone, ciList, incidents, onClose }) {
  const rl = getRiskLevel(zone.riskScore);
  const prevRl = getRiskLevel(zone.prevRisk);
  const change = zone.riskScore - zone.prevRisk;

  const trendLabel = zone.trend === 'RAPIDLY_INCREASING' ? '⬆⬆ RAPID' :
    zone.trend === 'INCREASING' ? '⬆ RISING' :
    zone.trend === 'STABLE' ? '➡ STABLE' : '⬇ FALLING';

  const trendColor = zone.trend === 'RAPIDLY_INCREASING' ? '#ef4444' :
    zone.trend === 'INCREASING' ? '#f97316' :
    zone.trend === 'STABLE' ? '#22c55e' : '#06b6d4';

  const P = {
    wrap: { padding: '0 0 16px 0', display: 'flex', flexDirection: 'column' },
    topBar: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
      background: 'var(--surface2)',
    },
    zoneName: { fontSize: 15, fontWeight: 900, color: 'var(--text)' },
    closeBtn: {
      background: 'none', border: 'none', color: 'var(--text-muted)',
      fontSize: 16, cursor: 'pointer', padding: '2px 6px',
    },
    section: { padding: '12px 16px', borderBottom: '1px solid rgba(0,212,255,0.06)' },
    row: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 8, fontSize: 12,
    },
    rowLabel: { color: 'var(--text-muted)', fontSize: 11, fontWeight: 600 },
    aiBox: {
      margin: '12px 16px',
      padding: '12px',
      background: 'rgba(0,212,255,0.05)',
      border: '1px solid rgba(0,212,255,0.22)',
      borderRadius: 8,
      fontSize: 11.5,
      color: 'var(--text-dim)',
      lineHeight: 1.6,
    },
    aiTitle: {
      fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
      color: 'var(--cyan)', marginBottom: 6, textTransform: 'uppercase',
    },
    ciItem: {
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '5px 0', fontSize: 11.5, color: 'var(--text-dim)',
      borderBottom: '1px solid rgba(0,212,255,0.04)',
    },
  };

  return (
    <div style={P.wrap}>
      {/* Header */}
      <div style={P.topBar}>
        <div>
          <div style={P.zoneName}>{zone.name}</div>
          <div style={{ marginTop: 4 }}>
            <span className={`risk-badge ${rl.level}`}>{rl.level}</span>
          </div>
        </div>
        <button style={P.closeBtn} onClick={onClose}>✕</button>
      </div>

      {/* Risk score section */}
      <div style={P.section}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Risk Metrics
        </div>
        {/* Big score */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: rl.color, lineHeight: 1 }}>
            {zone.riskScore}
          </span>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>/100</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: trendColor, marginLeft: 4 }}>{trendLabel}</span>
        </div>
        <div style={P.row}>
          <span style={P.rowLabel}>Previous</span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{zone.prevRisk}</span>
        </div>
        <div style={P.row}>
          <span style={P.rowLabel}>Change</span>
          <span style={{ fontSize: 12, color: change > 0 ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
            {change > 0 ? '+' : ''}{change}
          </span>
        </div>
        <div style={P.row}>
          <span style={P.rowLabel}>Confidence</span>
          <span style={{ fontSize: 12, color: '#00d4ff' }}>{(zone.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Environmental */}
      <div style={P.section}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Environmental
        </div>
        <div style={P.row}>
          <span style={P.rowLabel}>Rainfall</span>
          <span style={{ fontSize: 12, color: '#3b82f6' }}>{zone.rainfall} mm/h</span>
        </div>
        <div style={P.row}>
          <span style={P.rowLabel}>Drainage Risk</span>
          <span className={`risk-badge ${zone.drainageRisk === 'HIGH' ? 'HIGH' : zone.drainageRisk === 'MODERATE' ? 'ELEVATED' : 'MODERATE'}`} style={{ fontSize: 9 }}>
            {zone.drainageRisk}
          </span>
        </div>
        <div style={P.row}>
          <span style={P.rowLabel}>Citizen Reports</span>
          <span style={{ fontSize: 12, color: 'var(--text)' }}>{zone.citizenReports}</span>
        </div>
        <div style={P.row}>
          <span style={P.rowLabel}>Population</span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{(zone.population / 1000).toFixed(0)}k</span>
        </div>
      </div>

      {/* Active incidents */}
      {incidents.length > 0 && (
        <div style={P.section}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Active Incidents
          </div>
          {incidents.map(inc => (
            <div key={inc.id} style={{ fontSize: 11, padding: '5px 0', borderBottom: '1px solid rgba(0,212,255,0.05)', color: 'var(--text-dim)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{inc.id}</span>
                <span className={`risk-badge ${inc.severity === 'CRITICAL' ? 'CRITICAL' : inc.severity === 'HIGH' ? 'HIGH' : 'ELEVATED'}`} style={{ fontSize: 8.5 }}>
                  {inc.severity}
                </span>
              </div>
              <div style={{ marginTop: 2, fontSize: 10.5, color: 'var(--text-muted)' }}>{inc.type.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Critical Infrastructure */}
      {ciList.length > 0 && (
        <div style={P.section}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Critical Infrastructure
          </div>
          {ciList.map(ci => (
            <div key={ci.id} style={P.ciItem}>
              <span style={{ color: '#00d4ff', fontSize: 12 }}>+</span>
              <span>{ci.name}</span>
              <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginLeft: 'auto' }}>{ci.type}</span>
            </div>
          ))}
        </div>
      )}

      {/* AI Recommendation */}
      <div style={P.aiBox}>
        <div style={P.aiTitle}>⬡ AI RECOMMENDATION</div>
        {aiRec(zone)}
      </div>

      {/* Action button */}
      <div style={{ padding: '0 16px' }}>
        <button
          className="btn btn-outline-cyan btn-sm"
          style={{ width: '100%', justifyContent: 'center', letterSpacing: '0.05em' }}
        >
          VIEW FULL ANALYSIS
        </button>
      </div>
    </div>
  );
}
