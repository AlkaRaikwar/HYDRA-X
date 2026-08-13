import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { INCIDENTS, CITIZEN_REPORTS } from '../data/hydraData';

const SEV_COLORS = { CRITICAL: 'var(--red)', HIGH: 'var(--orange)', MODERATE: 'var(--yellow)', LOW: 'var(--cyan)' };

function IncidentCard({ incident, isSelected, onClick }) {
  const sevColor = SEV_COLORS[incident.severity] || 'var(--text-dim)';
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '14px 16px',
        borderRadius: 10,
        border: isSelected ? `1px solid ${sevColor}` : '1px solid var(--border)',
        background: isSelected ? `${sevColor}08` : 'var(--surface)',
        transition: 'all 0.2s',
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--cyan)', fontWeight: 700, marginBottom: 2 }}>{incident.id}</div>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>{incident.zone} — {incident.type.replace(/_/g, ' ')}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
          <span className={`risk-badge ${{ CRITICAL: 'CRITICAL', HIGH: 'HIGH', MODERATE: 'ELEVATED', LOW: 'LOW' }[incident.severity]}`}>{incident.severity}</span>
          <span style={{ fontSize: 10, color: incident.status === 'ACTIVE' ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
            ● {incident.status}
          </span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 8, lineHeight: 1.5 }}>{incident.description}</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Priority: <strong style={{ color: sevColor }}>{incident.priorityScore}/100</strong>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Reports: <strong style={{ color: 'var(--cyan)' }}>{incident.reportsCount}</strong>
        </div>
        {incident.teamAssigned && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Team: <strong style={{ color: 'var(--green)' }}>{incident.teamAssigned}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IncidentsPage() {
  const { city, showToast } = useContext(AppContext);
  const incidents = INCIDENTS[city] || [];
  const reports   = CITIZEN_REPORTS.filter(r => r.city === city);

  const [selected, setSelected] = useState(incidents[0]?.id || null);
  const selInc = incidents.find(i => i.id === selected);
  const relatedReports = selInc ? reports.filter(r => r.clusteredTo === selInc.id || r.zone === selInc.zone) : [];

  const totalReports = reports.length;
  const verifiedIncidents = incidents.length;

  return (
    <div className="hx-page">
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">⚠️ INCIDENT INTELLIGENCE</div>
          <div className="hx-page-sub">AI-Verified Incidents · Citizen Report Clustering · Emergency Priority Scoring</div>
        </div>
        <div className="demo-banner">⬡ SIMULATED DATA</div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card critical">
          <div className="kpi-label">ACTIVE INCIDENTS</div>
          <div className="kpi-value critical">{incidents.filter(i => i.status === 'ACTIVE').length}</div>
          <div className="kpi-sub">Requiring response</div>
        </div>
        <div className="kpi-card high">
          <div className="kpi-label">CITIZEN REPORTS</div>
          <div className="kpi-value high">{totalReports}</div>
          <div className="kpi-sub">Received this cycle</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-label">VERIFIED INCIDENTS</div>
          <div className="kpi-value info">{verifiedIncidents}</div>
          <div className="kpi-sub">After AI clustering</div>
        </div>
        <div className="kpi-card elevated">
          <div className="kpi-label">CLUSTERING RATIO</div>
          <div className="kpi-value elevated">{totalReports}</div>
          <div className="kpi-sub">→ {verifiedIncidents} incidents</div>
        </div>
        <div className="kpi-card normal">
          <div className="kpi-label">AI CONFIDENCE</div>
          <div className="kpi-value normal">94%</div>
          <div className="kpi-sub">Clustering accuracy</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Incidents list */}
        <div>
          <div className="section-head" style={{ marginBottom: 14 }}>
            <div className="section-title">🚨 ACTIVE INCIDENTS</div>
          </div>
          {incidents.map(inc => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              isSelected={selected === inc.id}
              onClick={() => setSelected(inc.id)}
            />
          ))}

          {/* Citizen report clustering visualizer */}
          <div className="hx-card" style={{ marginTop: 4 }}>
            <div className="hx-card-title">🤖 AI CLUSTERING — REPORT DEDUPLICATION</div>
            <div style={{ padding: '10px 12px', background: 'var(--bg2)', borderRadius: 7, border: '1px solid var(--border)', marginBottom: 10, fontSize: 11.5, color: 'var(--text-dim)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--cyan)' }}>{totalReports} citizen reports</strong> received →
              AI duplicate detection →
              <strong style={{ color: 'var(--green)' }}> {verifiedIncidents} verified incidents</strong>
              <br />Confidence: <strong style={{ color: 'var(--green)' }}>94%</strong> · Method: GPS clustering + text similarity + timestamp analysis
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {reports.map(r => {
                const confColor = r.confidence > 0.88 ? 'var(--green)' : r.confidence > 0.75 ? 'var(--yellow)' : 'var(--orange)';
                return (
                  <div key={r.id} style={{
                    display: 'flex', gap: 10, alignItems: 'center',
                    padding: '8px 10px', borderRadius: 7,
                    background: 'var(--bg3)', border: '1px solid var(--border2)',
                  }}>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', minWidth: 56 }}>{r.id}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, color: 'var(--text)', fontWeight: 600 }}>{r.description.slice(0, 50)}…</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{r.zone} · {r.type.replace(/_/g, ' ')} · {r.timestamp.slice(11, 16)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: confColor }}>{Math.round(r.confidence * 100)}%</div>
                      {r.clusteredTo && (
                        <div style={{ fontSize: 9, color: 'var(--cyan)', marginTop: 1 }}>→ {r.clusteredTo}</div>
                      )}
                      <div style={{
                        fontSize: 9, fontWeight: 800, marginTop: 2,
                        color: r.status === 'VERIFIED' ? 'var(--green)' : 'var(--yellow)'
                      }}>{r.status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Incident detail */}
        <div>
          {selInc ? (
            <>
              <div className="hx-card" style={{ border: `1px solid ${SEV_COLORS[selInc.severity]}40`, marginBottom: 12 }}>
                <div className="hx-card-title">📋 INCIDENT DETAIL</div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', letterSpacing: 0.5 }}>{selInc.zone}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{selInc.id} · {selInc.type.replace(/_/g, ' ')}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: SEV_COLORS[selInc.severity] }}>{selInc.priorityScore}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Priority Score</div>
                    <span className={`risk-badge ${{ CRITICAL: 'CRITICAL', HIGH: 'HIGH', MODERATE: 'ELEVATED' }[selInc.severity] || 'LOW'}`}>{selInc.severity}</span>
                  </div>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 14 }}>{selInc.description}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'Reports', value: selInc.reportsCount },
                    { label: 'Verified', value: selInc.verifiedReports },
                    { label: 'Team', value: selInc.teamAssigned || 'Unassigned' },
                  ].map(m => (
                    <div key={m.label} style={{ background: 'var(--bg2)', borderRadius: 6, padding: '8px 10px', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--cyan)', marginTop: 3 }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {selInc.teamAssigned ? (
                  <div style={{ padding: '8px 12px', background: 'var(--green-ghost)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 7, fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
                    ✓ Team {selInc.teamAssigned} dispatched to this incident
                  </div>
                ) : (
                  <button
                    className="btn btn-danger w-full"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => showToast(`Response team requested for ${selInc.id}`, 'warn')}
                  >🚨 REQUEST RESPONSE TEAM</button>
                )}
              </div>

              {/* Incident Timeline */}
              {selInc.timeline && selInc.timeline.length > 0 && (
                <div className="hx-card">
                  <div className="hx-card-title">⏱️ INCIDENT TIMELINE</div>
                  <div className="event-timeline">
                    {selInc.timeline.map((evt, i) => (
                      <div className="timeline-item" key={i}>
                        <div className="timeline-time">{evt.time}</div>
                        <div className={`timeline-dot ${evt.type}`}>
                          {evt.type === 'report' ? '📍' : evt.type === 'ai' ? '🤖' : evt.type === 'risk' ? '⚠' : evt.type === 'approval' ? '👤' : '🚨'}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-event">{evt.event}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related reports */}
              {relatedReports.length > 0 && (
                <div className="hx-card" style={{ marginTop: 12 }}>
                  <div className="hx-card-title">👥 RELATED CITIZEN REPORTS ({relatedReports.length})</div>
                  {relatedReports.map(r => (
                    <div key={r.id} style={{ padding: '8px 10px', borderBottom: '1px solid var(--border2)', fontSize: 12, color: 'var(--text-dim)' }}>
                      <strong style={{ color: 'var(--cyan)', fontFamily: 'monospace' }}>{r.id}</strong> · {r.description.slice(0, 60)}…
                      <span style={{ float: 'right', color: 'var(--green)', fontSize: 11, fontWeight: 700 }}>{Math.round(r.confidence * 100)}% conf.</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="hx-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, flexDirection: 'column', gap: 8, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 24 }}>⚠️</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Select an incident to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
