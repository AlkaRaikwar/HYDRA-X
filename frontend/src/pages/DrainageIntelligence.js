import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { DRAINS, getRiskLevel } from '../data/hydraData';
import { computeDrainHealth, computeBlockageProbability } from '../data/riskEngine';

function DrainHealthBar({ value }) {
  const color = value >= 80 ? 'var(--green)' : value >= 60 ? 'var(--yellow)' : value >= 40 ? 'var(--orange)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>{value}</span>
    </div>
  );
}

function ProbBar({ value }) {
  const color = value >= 70 ? 'var(--red)' : value >= 50 ? 'var(--orange)' : 'var(--yellow)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 32 }}>{value}%</span>
    </div>
  );
}

export default function DrainageIntelligence() {
  const { city, showToast } = useContext(AppContext);
  const drains = (DRAINS[city] || []).map(d => ({
    ...d,
    health: computeDrainHealth(d),
    blockageProb: computeBlockageProbability(d),
  })).sort((a, b) => b.riskScore - a.riskScore);

  const [selected, setSelected] = useState(null);
  const [scheduled, setScheduled] = useState({});

  const criticalCount = drains.filter(d => d.status === 'CRITICAL').length;
  const poorCount     = drains.filter(d => d.status === 'POOR').length;
  const avgHealth     = Math.round(drains.reduce((s, d) => s + d.health, 0) / (drains.length || 1));

  function scheduleTask(drainId, action) {
    setScheduled(prev => ({ ...prev, [drainId]: action }));
    showToast(`✓ Task scheduled: ${action} for ${drainId}`, 'success');
  }

  const sel = drains.find(d => d.id === selected);

  return (
    <div className="hx-page">
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">🔧 DRAINAGE INTELLIGENCE</div>
          <div className="hx-page-sub">AI-Powered Drain Health Monitoring · Predictive Maintenance Queue</div>
        </div>
        <div className="demo-banner">⬡ SIMULATED SENSOR DATA</div>
      </div>

      {/* KPI row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card critical">
          <div className="kpi-label">CRITICAL DRAINS</div>
          <div className="kpi-value critical">{criticalCount}</div>
          <div className="kpi-sub">Immediate action</div>
        </div>
        <div className="kpi-card high">
          <div className="kpi-label">POOR CONDITION</div>
          <div className="kpi-value high">{poorCount}</div>
          <div className="kpi-sub">Clean today</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-label">TOTAL DRAINS</div>
          <div className="kpi-value info">{drains.length}</div>
          <div className="kpi-sub">Monitored</div>
        </div>
        <div className="kpi-card elevated">
          <div className="kpi-label">AVG HEALTH</div>
          <div className="kpi-value elevated">{avgHealth}</div>
          <div className="kpi-sub">/ 100</div>
        </div>
        <div className="kpi-card normal">
          <div className="kpi-label">TASKS SCHEDULED</div>
          <div className="kpi-value normal">{Object.keys(scheduled).length}</div>
          <div className="kpi-sub">This session</div>
        </div>
      </div>

      {/* Priority Queue + Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>

        {/* Priority Queue */}
        <div className="hx-card">
          <div className="hx-card-title">📋 PREDICTIVE MAINTENANCE QUEUE — AI PRIORITIZED</div>
          <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(0,212,255,0.06)', borderRadius: 7, border: '1px solid var(--border)', fontSize: 11.5, color: 'var(--text-dim)' }}>
            🤖 IBM Granite has analyzed drain health, rainfall forecast, maintenance history, and citizen reports to generate this prioritized maintenance queue.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {drains.map((drain, idx) => {
              const statusColor = { CRITICAL: 'var(--red)', POOR: 'var(--orange)', WARNING: 'var(--yellow)', GOOD: 'var(--green)' }[drain.status] || 'var(--cyan)';
              const isScheduled = !!scheduled[drain.id];
              return (
                <div
                  key={drain.id}
                  className={`drain-card ${drain.status}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s', border: selected === drain.id ? `1px solid ${statusColor}` : undefined }}
                  onClick={() => setSelected(selected === drain.id ? null : drain.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--cyan)', fontFamily: 'monospace' }}>
                          PRIORITY {idx + 1}
                        </span>
                        <span className="drain-id">{drain.id}</span>
                        {isScheduled && <span style={{ fontSize: 9, background: 'var(--green-ghost)', color: 'var(--green)', padding: '1px 6px', borderRadius: 4, fontWeight: 800, border: '1px solid rgba(34,197,94,0.3)' }}>SCHEDULED</span>}
                      </div>
                      <div className="drain-zone">Zone: {drain.zone} · {drain.city}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`drain-health-val ${drain.status}`}>{drain.health}<span style={{ fontSize: 12 }}>/100</span></div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Health Score</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Blockage Probability</div>
                      <ProbBar value={drain.blockageProb} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Drain Health</div>
                      <DrainHealthBar value={drain.health} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      padding: '5px 10px', borderRadius: 6,
                      background: `${statusColor}15`, border: `1px solid ${statusColor}40`,
                      fontSize: 11, fontWeight: 800, color: statusColor,
                    }}>
                      🤖 {drain.recommendation}
                    </div>
                    {drain.status !== 'GOOD' && !isScheduled && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={e => { e.stopPropagation(); scheduleTask(drain.id, drain.recommendation); }}
                      >SCHEDULE</button>
                    )}
                    {isScheduled && (
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ Task queued</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Detail + Explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sel ? (
            <div className="hx-card" style={{ border: '1px solid rgba(0,212,255,0.25)' }}>
              <div className="hx-card-title">🔍 DRAIN ANALYSIS</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--cyan)', fontFamily: 'monospace' }}>{sel.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Zone: {sel.zone} · Capacity: {sel.capacity} L/s</div>
                </div>
                <div className={`risk-badge ${{ CRITICAL: 'CRITICAL', POOR: 'HIGH', WARNING: 'ELEVATED', GOOD: 'LOW' }[sel.status]}`}>{sel.status}</div>
              </div>

              {/* Metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Health Score', value: `${sel.health}/100`, color: sel.health < 50 ? 'var(--red)' : sel.health < 70 ? 'var(--orange)' : 'var(--green)' },
                  { label: 'Blockage Prob', value: `${sel.blockageProb}%`, color: sel.blockageProb > 70 ? 'var(--red)' : 'var(--orange)' },
                  { label: 'Risk Score', value: `${sel.riskScore}/100`, color: getRiskLevel(sel.riskScore).color },
                  { label: 'Historical', value: `${sel.historicalIncidents} incidents`, color: 'var(--text-dim)' },
                  { label: 'Last Cleaned', value: sel.lastCleaned, color: 'var(--text-dim)' },
                  { label: 'Nearby Pop.', value: sel.nearbyPopulation.toLocaleString(), color: 'var(--text-dim)' },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--bg2)', borderRadius: 6, padding: '8px 10px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: m.color, marginTop: 3 }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* IBM Granite explanation */}
              <div style={{ padding: 12, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 7, marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>🤖 IBM GRANITE ANALYSIS</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text)' }}>{sel.id}</strong> has a{' '}
                  <strong style={{ color: 'var(--red)' }}>{sel.blockageProb}% probability</strong> of becoming operationally critical during the next heavy rainfall event.
                  Maintenance is overdue by {Math.max(0, Math.floor((Date.now() - new Date(sel.lastCleaned)) / 86400000) - sel.cleaningFrequency)} days.
                  {sel.historicalIncidents > 2 && ` Historical data shows ${sel.historicalIncidents} previous blockage incidents at this location.`}
                  {sel.nearbyPopulation > 20000 && ` This drain serves a high-population area (${sel.nearbyPopulation.toLocaleString()} residents).`}
                </div>
              </div>

              <button
                className="btn btn-danger w-full"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => scheduleTask(sel.id, sel.recommendation)}
                disabled={!!scheduled[sel.id]}
              >
                {scheduled[sel.id] ? '✓ Task Already Scheduled' : `🚨 SCHEDULE: ${sel.recommendation}`}
              </button>
            </div>
          ) : (
            <div className="hx-card" style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 24 }}>🔧</div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Select a drain for detailed analysis</div>
            </div>
          )}

          {/* System health summary */}
          <div className="hx-card">
            <div className="hx-card-title">📊 DRAINAGE SYSTEM HEALTH</div>
            {[
              { status: 'CRITICAL', label: 'Critical', count: drains.filter(d => d.status === 'CRITICAL').length, color: 'var(--red)' },
              { status: 'POOR', label: 'Poor', count: drains.filter(d => d.status === 'POOR').length, color: 'var(--orange)' },
              { status: 'WARNING', label: 'Warning', count: drains.filter(d => d.status === 'WARNING').length, color: 'var(--yellow)' },
              { status: 'GOOD', label: 'Good', count: drains.filter(d => d.status === 'GOOD').length, color: 'var(--green)' },
            ].map(s => (
              <div key={s.status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border2)' }}>
                <span style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>● {s.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.count} drains</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              ⬡ SIMULATED SENSOR DATA · IBM Granite Drainage Intelligence Agent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
