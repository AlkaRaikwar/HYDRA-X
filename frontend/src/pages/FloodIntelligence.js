import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../App';
import { ZONES, RISK_TIMELINE, getRiskLevel, getTrendIcon } from '../data/hydraData';

// ── Zone-specific detail data ────────────────────────────────────────────────
const ZONE_DETAIL = {
  PALDI: {
    why: [
      'Rainfall intensity +32% above seasonal average',
      '2 drainage assets at high blockage risk (DRN-1047, DRN-4410)',
      '4 citizen reports received and verified',
      'Historical waterlogging probability high (78%)',
    ],
    actions: [
      'Inspect and clear DRN-1047 immediately — blockage probability 78%',
      'Dispatch drainage team to Paldi junction within 30 minutes',
      'Prepare traffic diversion for SP Ring Road near Paldi',
      'Monitor water levels on nearby roads every 15 minutes',
    ],
    drainId: 'DRN-1047',
    confidence: 91,
  },
  VASTRAPUR: {
    why: [
      'Rainfall intensity +41% above seasonal average',
      '3 drainage assets at high blockage risk (DRN-2031 critical)',
      '6 citizen reports received — highest in city',
      'Historical waterlogging probability elevated (71%)',
    ],
    actions: [
      'Inspect and clear DRN-2031 — blockage probability 65%',
      'Dispatch drainage team to Vastrapur residential area',
      'Coordinate with Metro Station for precautionary measures',
      'Issue advisory to low-lying residential pockets near lake',
    ],
    drainId: 'DRN-2031',
    confidence: 93,
  },
  MANINAGAR: {
    why: [
      'Rainfall intensity +24% above seasonal average',
      '1 drainage asset at moderate blockage risk (DRN-3014)',
      '3 citizen reports — waterlogging near underpass',
      'Historical waterlogging probability moderate (62%)',
    ],
    actions: [
      'Inspect DRN-3014 before peak rainfall window at 12:00',
      'Position dewatering pump at Maninagar underpass',
      'Coordinate with Maninagar Railway Station for contingency',
      'Monitor water table sensors every 20 minutes',
    ],
    drainId: 'DRN-3014',
    confidence: 86,
  },
  BOPAL: {
    why: [
      'Rainfall intensity within normal range (+6%)',
      'Drainage infrastructure in good condition (score 85)',
      '1 citizen report — low confidence signal',
      'Historical waterlogging probability low (31%)',
    ],
    actions: [
      'Routine status check on DRN-5201 per schedule',
      'No immediate dispatch required — monitor remotely',
      'Keep Team T-05 on standby for rapid redeployment if needed',
      'Re-evaluate risk at 13:00 if rainfall intensifies',
    ],
    drainId: 'DRN-5201',
    confidence: 82,
  },
  NAVRANGPURA: {
    why: [
      'Rainfall intensity +18% above seasonal average',
      '1 drainage asset at warning status (DRN-4410)',
      '2 citizen reports — moderate signal',
      'Historical waterlogging probability moderate (55%)',
    ],
    actions: [
      'Schedule cleaning for DRN-4410 within 48 hours',
      'Alert Navrangpura Police Station for road monitoring',
      'Advise school evacuation protocol if risk exceeds 75',
      'Increase sensor polling to every 10 minutes',
    ],
    drainId: 'DRN-4410',
    confidence: 88,
  },
  ADAJAN: {
    why: [
      'Rainfall intensity +45% above seasonal average',
      '2 drainage assets at critical blockage risk',
      '5 citizen reports — hospital road blocked',
      'Historical waterlogging probability high (75%)',
    ],
    actions: [
      'Emergency cleaning of DRN-S1022 — blockage probability 82%',
      'Dispatch Team T-03 to hospital access road immediately',
      'Coordinate with New Civil Hospital for emergency protocol',
      'Request 2 additional pump trucks from Surat North depot',
    ],
    drainId: 'DRN-S1022',
    confidence: 92,
  },
  VESU: {
    why: [
      'Rainfall intensity +38% above seasonal average',
      '1 drainage asset critically blocked (DRN-S2047)',
      '4 citizen reports — residential flooding imminent',
      'Historical waterlogging probability elevated (68%)',
    ],
    actions: [
      'Immediate cleaning of DRN-S2047 — blockage probability 71%',
      'Dispatch Team T-01 to Vesu circle within 20 minutes',
      'Secure Vesu Power Station perimeter — flood risk adjacent',
      'Issue advisory to Vesu residential zone residents',
    ],
    drainId: 'DRN-S2047',
    confidence: 89,
  },
  ATHWA: {
    why: [
      'Rainfall intensity within expected bounds (+10%)',
      'Drainage infrastructure rated GOOD (DRN-S4011)',
      '2 citizen reports — minor waterlogging on side roads',
      'Historical waterlogging probability moderate (42%)',
    ],
    actions: [
      'Routine inspection of DRN-S4011 this week',
      'No immediate escalation required',
      'Athwa Fire Station on standby — coordinates shared',
      'Monitor sensor WL-S303 for water level spikes',
    ],
    drainId: 'DRN-S4011',
    confidence: 84,
  },
  VARACHHA: {
    why: [
      'Rainfall intensity +20% above seasonal average',
      '1 drainage asset at warning status (DRN-S3088)',
      '3 citizen reports — railway station approach road affected',
      'Historical waterlogging probability moderate (59%)',
    ],
    actions: [
      'Inspect DRN-S3088 before 12:00 rainfall peak',
      'Coordinate with Surat Railway Station for crowd management',
      'Position dewatering pump at station approach road',
      'Re-evaluate dispatch priority at 12:30',
    ],
    drainId: 'DRN-S3088',
    confidence: 87,
  },
  KATARGAM: {
    why: [
      'Rainfall intensity at seasonal norm (+2%)',
      'All drainage assets in good condition',
      '1 citizen report — unverified low-severity signal',
      'Historical waterlogging probability low (28%)',
    ],
    actions: [
      'No immediate action required',
      'Schedule routine maintenance per normal calendar',
      'Continue remote monitoring every 30 minutes',
      'Escalate only if risk score exceeds 55',
    ],
    drainId: null,
    confidence: 80,
  },
};

const XAI_LOG = [
  {
    decision: 'Dispatch T-07 to Paldi',
    confidence: 91,
    reason: 'Zone risk 87/100 (CRITICAL). DRN-1047 blockage probability 78%. 4 verified citizen reports. Hospital in zone. Nearest available team: T-07 (Heavy Pump Truck, 6 members).',
    alternative: 'Dispatch T-05 — lower capacity, 3 members. Risk: insufficient for industrial pump requirement.',
  },
  {
    decision: 'Issue evacuation advisory for Vastrapur low-lying areas',
    confidence: 86,
    reason: 'Risk projected to exceed 90/100 within 45 minutes at current rainfall rate. Historical flooding 71%. Metro station and 120,000 residents at risk.',
    alternative: 'Shelter-in-place advisory. Risk: insufficient warning for mobility-impaired residents near lake.',
  },
  {
    decision: 'Request 2 additional pump trucks for Surat',
    confidence: 89,
    reason: 'Three simultaneous CRITICAL incidents in ADAJAN, VESU active. Current 3 teams insufficient. Depot response time <25 min.',
    alternative: 'Prioritize INC-2047 only. Risk: VESU flooding becomes uncontrolled, power station at risk.',
  },
];

// ── SVG Timeline Chart ───────────────────────────────────────────────────────
function TimelineChart({ zoneId, zoneName }) {
  const data = RISK_TIMELINE[zoneId] || RISK_TIMELINE[Object.keys(RISK_TIMELINE)[0]];
  const maxRisk = Math.max(...data.map(d => d.risk));
  const { color } = getRiskLevel(maxRisk);
  const currentHour = '11:00'; // simulated "now"

  const W = 500, H = 180, PAD = { top: 12, right: 20, bottom: 32, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const n = data.length;

  const xOf = i => PAD.left + (i / (n - 1)) * innerW;
  const yOf = v => PAD.top + innerH - (v / 100) * innerH;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(d.risk)}`).join(' ');
  const fillPath = `${linePath} L${xOf(n - 1)},${PAD.top + innerH} L${xOf(0)},${PAD.top + innerH} Z`;

  const currentIdx = data.findIndex(d => d.time === currentHour);
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id={`fill-${zoneId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map(v => (
        <g key={v}>
          <line
            x1={PAD.left} y1={yOf(v)} x2={PAD.left + innerW} y2={yOf(v)}
            stroke="rgba(255,255,255,0.05)" strokeWidth="1"
          />
          <text x={PAD.left - 5} y={yOf(v) + 4} fontSize="9" fill="rgba(232,244,255,0.35)" textAnchor="end">
            {v}
          </text>
        </g>
      ))}

      {/* Fill area */}
      <path d={fillPath} fill={`url(#fill-${zoneId})`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Data dots */}
      {data.map((d, i) => {
        const isCurrent = d.time === currentHour;
        return (
          <circle
            key={i}
            cx={xOf(i)} cy={yOf(d.risk)} r={isCurrent ? 5 : 3}
            fill={isCurrent ? '#00d4ff' : color}
            stroke={isCurrent ? 'rgba(0,212,255,0.4)' : 'rgba(8,14,26,0.8)'}
            strokeWidth={isCurrent ? 3 : 1.5}
          />
        );
      })}

      {/* Current hour vertical line */}
      {currentIdx >= 0 && (
        <line
          x1={xOf(currentIdx)} y1={PAD.top} x2={xOf(currentIdx)} y2={PAD.top + innerH}
          stroke="rgba(0,212,255,0.3)" strokeWidth="1" strokeDasharray="3,3"
        />
      )}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={i} x={xOf(i)} y={H - 6} fontSize="9.5"
          fill={d.time === currentHour ? '#00d4ff' : 'rgba(232,244,255,0.4)'}
          textAnchor="middle" fontWeight={d.time === currentHour ? '700' : '400'}
        >
          {d.time}
        </text>
      ))}
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function FloodIntelligence() {
  const { city } = useContext(AppContext);
  const zones = ZONES[city] || [];

  const [selectedZone, setSelectedZone] = useState(null);
  const [timelineZone, setTimelineZone] = useState(zones[0]?.id || '');

  // Update timeline zone when city changes
  const firstZone = zones[0];
  const activeTimelineZone = zones.find(z => z.id === timelineZone) || firstZone;

  const summary = useMemo(() => {
    const critical = zones.filter(z => z.riskScore >= 81).length;
    const avg = zones.length ? Math.round(zones.reduce((s, z) => s + z.riskScore, 0) / zones.length) : 0;
    const fastest = zones.reduce((best, z) => {
      const change = z.riskScore - z.prevRisk;
      return change > (best ? best.riskScore - best.prevRisk : -Infinity) ? z : best;
    }, null);
    return { critical, avg, fastest };
  }, [zones]);

  const selectedZoneData = zones.find(z => z.id === selectedZone);
  const selectedDetail = selectedZone ? ZONE_DETAIL[selectedZone] : null;

  return (
    <div className="hx-page">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">FLOOD INTELLIGENCE</div>
          <div className="hx-page-sub">AI-Powered Zone Risk Analysis · IBM Granite Reasoning Layer</div>
        </div>
        <div className="demo-banner">
          ⬡ DEMONSTRATION / SIMULATED DATA — IBM Granite reasoning layer active
        </div>
      </div>

      {/* ── City-wide Summary KPIs ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <div className="hx-card">
          <div className="hx-card-glow" />
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Total Critical Zones
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--red)', lineHeight: 1 }}>{summary.critical}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Risk score ≥ 81 / 100</div>
        </div>
        <div className="hx-card">
          <div className="hx-card-glow" />
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Avg Risk Score
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, color: getRiskLevel(summary.avg).color, lineHeight: 1 }}>{summary.avg}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Across {zones.length} monitored zones</div>
        </div>
        <div className="hx-card">
          <div className="hx-card-glow" />
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>
            Fastest Rising Zone
          </div>
          {summary.fastest && (
            <>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--orange)', lineHeight: 1.2 }}>
                {summary.fastest.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                +{summary.fastest.riskScore - summary.fastest.prevRisk} pts since last reading
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Zone Risk Table ──────────────────────────────────────────────── */}
      <div className="hx-card" style={{ marginBottom: 20, padding: 0 }}>
        <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--border)' }}>
          <div className="hx-card-title" style={{ marginBottom: 0 }}>
            <span>⬡</span> Zone Risk Matrix — {city}
          </div>
        </div>
        <div className="hx-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table className="hx-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Risk Score</th>
                <th>Level</th>
                <th>Previous</th>
                <th>Change</th>
                <th>Trend</th>
                <th>Confidence</th>
                <th>Top Driver</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => {
                const rl = getRiskLevel(zone.riskScore);
                const change = zone.riskScore - zone.prevRisk;
                const detail = ZONE_DETAIL[zone.id];
                const topDriver = detail?.why[0] || '—';
                const isSelected = selectedZone === zone.id;
                return (
                  <tr
                    key={zone.id}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(0,212,255,0.06)' : undefined,
                      borderLeft: isSelected ? '2px solid var(--cyan)' : '2px solid transparent',
                    }}
                    onClick={() => setSelectedZone(isSelected ? null : zone.id)}
                  >
                    <td style={{ color: 'var(--text)', fontWeight: 700 }}>{zone.name}</td>
                    <td>
                      <span
                        className={`risk-badge ${rl.level}`}
                        style={{ fontSize: 13, padding: '4px 10px' }}
                      >
                        {zone.riskScore}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${rl.level}`}>{rl.level}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{zone.prevRisk}</td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: change > 0 ? 'var(--red)' : change < 0 ? 'var(--green)' : 'var(--text-muted)',
                      }}>
                        {change > 0 ? '↑' : change < 0 ? '↓' : '—'} {Math.abs(change)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: 'rgba(0,212,255,0.07)',
                        color: 'var(--cyan-dim)',
                        letterSpacing: '0.04em',
                      }}>
                        {getTrendIcon(zone.trend)} {zone.trend.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>{Math.round(zone.confidence * 100)}%</td>
                    <td style={{ maxWidth: 220, color: 'var(--text-muted)', fontSize: 11.5 }}>
                      {topDriver.length > 55 ? topDriver.slice(0, 55) + '…' : topDriver}
                    </td>
                    <td>
                      <button
                        style={{
                          padding: '4px 10px',
                          fontSize: 10.5,
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          background: isSelected ? 'rgba(0,212,255,0.15)' : 'rgba(0,212,255,0.07)',
                          border: '1px solid rgba(0,212,255,0.3)',
                          borderRadius: 5,
                          color: 'var(--cyan)',
                          transition: 'all 0.15s',
                        }}
                        onClick={e => { e.stopPropagation(); setSelectedZone(isSelected ? null : zone.id); }}
                      >
                        VIEW DETAILS
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Zone Detail Panel ────────────────────────────────────────────── */}
      {selectedZone && selectedZoneData && selectedDetail && (
        <div
          className="hx-card"
          style={{
            marginBottom: 20,
            borderLeft: '3px solid var(--cyan)',
            background: 'var(--surface2)',
          }}
        >
          <div className="hx-card-glow" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Zone Detail — {selectedZoneData.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 44, fontWeight: 900, color: getRiskLevel(selectedZoneData.riskScore).color, lineHeight: 1 }}>
                    {selectedZoneData.riskScore}
                  </span>
                  <div>
                    <span className={`risk-badge ${getRiskLevel(selectedZoneData.riskScore).level}`} style={{ display: 'block', marginBottom: 4 }}>
                      {getRiskLevel(selectedZoneData.riskScore).level}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Confidence: {selectedDetail.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: '4px 10px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              borderRadius: 5,
              color: 'var(--blue)',
              letterSpacing: '0.05em',
            }}>
              🤖 IBM GRANITE REASONING
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Why section */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--cyan)', marginBottom: 10 }}>
                WHY DID RISK INCREASE?
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {selectedDetail.why.map((reason, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--text-dim)' }}>
                    <span style={{ color: 'var(--cyan)', fontWeight: 700, flexShrink: 0 }}>•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended actions */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--orange)', marginBottom: 10 }}>
                RECOMMENDED ACTIONS
              </div>
              <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {selectedDetail.actions.map((action, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: 'var(--text-dim)' }}>
                    <span style={{
                      minWidth: 20, height: 20, borderRadius: '50%',
                      background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)',
                      color: 'var(--orange)', fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border2)',
            fontSize: 11.5,
            color: 'var(--text-muted)',
          }}>
            🤖 Analysis by IBM Granite · Confidence: {selectedDetail.confidence}% · IBM Granite analyzes structured risk data and provides natural language explanations. Risk scores are computed by the numerical engine.
          </div>
        </div>
      )}

      {/* ── Risk Timeline Chart ──────────────────────────────────────────── */}
      <div className="hx-card" style={{ marginBottom: 20 }}>
        <div className="hx-card-glow" />
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20 }}>
          {/* Zone selector */}
          <div>
            <div className="hx-card-title">Select Zone</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {zones.filter(z => RISK_TIMELINE[z.id]).map(zone => {
                const isActive = (activeTimelineZone?.id === zone.id);
                const rl = getRiskLevel(zone.riskScore);
                return (
                  <button
                    key={zone.id}
                    onClick={() => setTimelineZone(zone.id)}
                    style={{
                      padding: '7px 10px',
                      textAlign: 'left',
                      fontSize: 12,
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(0,212,255,0.35)' : 'var(--border2)'}`,
                      borderRadius: 6,
                      color: isActive ? 'var(--cyan)' : 'var(--text-dim)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                    }}
                  >
                    <span>{zone.name}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '1px 5px',
                      borderRadius: 3, background: rl.bg, color: rl.color, border: `1px solid ${rl.color}44`,
                    }}>
                      {zone.riskScore}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart */}
          <div>
            {activeTimelineZone && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="hx-card-title" style={{ marginBottom: 0 }}>
                    RISK TIMELINE — {activeTimelineZone.name}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 8px',
                    background: 'rgba(0,212,255,0.07)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    borderRadius: 4,
                    color: 'var(--cyan-dim)',
                  }}>
                    {getTrendIcon(activeTimelineZone.trend)} {activeTimelineZone.trend.replace('_', ' ')}
                  </span>
                </div>
                <TimelineChart zoneId={activeTimelineZone.id} zoneName={activeTimelineZone.name} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                  Cyan dot = current hour (11:00) · Fill shows projected risk envelope
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── XAI Decision Log ─────────────────────────────────────────────── */}
      <div className="hx-card">
        <div className="hx-card-glow" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="hx-card-title" style={{ marginBottom: 0 }}>
            ⬡ EXPLAINABLE AI DECISION LOG
          </div>
          <span style={{
            fontSize: 10.5, fontWeight: 700,
            padding: '3px 9px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: 5,
            color: 'var(--blue)',
            letterSpacing: '0.05em',
          }}>
            🤖 IBM GRANITE REASONING
          </span>
        </div>

        <div style={{ marginBottom: 10, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.7 }}>
          IBM Granite analyzes structured risk data and provides natural language explanations. Risk scores are computed by the numerical engine.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {XAI_LOG.map((entry, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>
                  {entry.decision}
                </div>
                <span style={{
                  flexShrink: 0,
                  fontSize: 11, fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 4,
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: 'var(--green)',
                }}>
                  Confidence: {entry.confidence}%
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6, lineHeight: 1.6 }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>Reason: </span>{entry.reason}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>Alternative: </span>{entry.alternative}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
