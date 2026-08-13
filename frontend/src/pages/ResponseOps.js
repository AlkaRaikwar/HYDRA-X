import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { INCIDENTS, RESPONSE_TEAMS, PENDING_APPROVALS } from '../data/hydraData';
import { AUDIT_LOG } from '../data/simulationEngine';

export default function ResponseOps() {
  const { city, showToast } = useContext(AppContext);
  const incidents = INCIDENTS[city] || [];
  const teams = RESPONSE_TEAMS[city] || [];
  const [approvals, setApprovals] = useState(PENDING_APPROVALS);
  const [auditEntries, setAuditEntries] = useState(AUDIT_LOG);

  function handleApprove(id) {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
    const apr = approvals.find(a => a.id === id);
    const entry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: apr?.type || 'ACTION',
      actor: 'Officer (Demo)',
      zone: apr?.zone || '',
      aiRecommendation: true,
      confidence: apr?.confidence || 0.9,
      outcome: 'EXECUTED',
    };
    setAuditEntries(prev => [entry, ...prev]);
    showToast(`✓ Action approved and executed: ${apr?.type}`, 'success');
  }

  function handleReject(id) {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
    const apr = approvals.find(a => a.id === id);
    setAuditEntries(prev => [{
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: apr?.type || 'ACTION',
      actor: 'Officer (Demo)',
      zone: apr?.zone || '',
      aiRecommendation: true,
      confidence: apr?.confidence || 0.9,
      outcome: 'REJECTED',
      reason: 'Officer override',
    }, ...prev]);
    showToast('Action rejected by officer', 'warn');
  }

  const available = teams.filter(t => t.status === 'AVAILABLE').length;
  const deployed  = teams.filter(t => t.status === 'DEPLOYED').length;
  const pendingApprovals = approvals.filter(a => a.status === 'PENDING').length;

  return (
    <div className="hx-page">
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">🚒 RESPONSE OPERATIONS</div>
          <div className="hx-page-sub">Team Dispatch · Human-in-the-Loop Approval · Audit Trail</div>
        </div>
        <div className="demo-banner">⬡ SIMULATION DATA</div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 20 }}>
        <div className={`kpi-card ${available > 0 ? 'normal' : 'critical'}`}>
          <div className="kpi-label">AVAILABLE TEAMS</div>
          <div className={`kpi-value ${available > 0 ? 'normal' : 'critical'}`}>{available}</div>
          <div className="kpi-sub">/ {teams.length} total</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-label">DEPLOYED TEAMS</div>
          <div className="kpi-value info">{deployed}</div>
          <div className="kpi-sub">Active response</div>
        </div>
        <div className="kpi-card critical">
          <div className="kpi-label">ACTIVE INCIDENTS</div>
          <div className="kpi-value critical">{incidents.filter(i => i.status === 'ACTIVE').length}</div>
          <div className="kpi-sub">Requiring teams</div>
        </div>
        <div className={`kpi-card ${pendingApprovals > 0 ? 'high' : 'normal'}`}>
          <div className="kpi-label">PENDING APPROVALS</div>
          <div className={`kpi-value ${pendingApprovals > 0 ? 'high' : 'normal'}`}>{pendingApprovals}</div>
          <div className="kpi-sub">Awaiting officer</div>
        </div>
        <div className="kpi-card elevated">
          <div className="kpi-label">AUDIT ENTRIES</div>
          <div className="kpi-value elevated">{auditEntries.length}</div>
          <div className="kpi-sub">Logged this session</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Teams */}
        <div>
          <div className="hx-card" style={{ marginBottom: 16 }}>
            <div className="hx-card-title">🚒 RESPONSE TEAM STATUS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {teams.map(team => {
                const statusColor = { AVAILABLE: 'var(--green)', DEPLOYED: 'var(--cyan)', STANDBY: 'var(--yellow)' }[team.status] || 'var(--text-muted)';
                const assignedInc = incidents.find(i => i.teamAssigned === team.id);
                return (
                  <div key={team.id} style={{
                    padding: '12px 14px', borderRadius: 10,
                    background: 'var(--bg2)', border: `1px solid ${statusColor}25`,
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: `${statusColor}15`, border: `1px solid ${statusColor}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, flexShrink: 0,
                    }}>🚒</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>{team.id} — {team.name}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: `${statusColor}15`, padding: '2px 8px', borderRadius: 12, border: `1px solid ${statusColor}30` }}>
                          ● {team.status}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        {team.vehicle} · {team.members} members
                      </div>
                      {assignedInc && (
                        <div style={{ fontSize: 11, color: 'var(--cyan)', fontWeight: 600 }}>
                          → Assigned to {assignedInc.id} ({assignedInc.zone})
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                        Equipment: {team.equipment.join(' · ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resource allocation */}
          <div className="hx-card">
            <div className="hx-card-title">⚙️ AI RESOURCE ALLOCATION</div>
            <div style={{ padding: '10px 12px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 7, marginBottom: 12, fontSize: 11.5, color: 'var(--text-dim)' }}>
              🤖 IBM Granite Resource Optimization Agent has allocated teams based on incident severity, team proximity, and equipment fit.
            </div>
            {incidents.map(inc => {
              const assignedTeam = teams.find(t => t.id === inc.teamAssigned);
              const sevColor = { CRITICAL: 'var(--red)', HIGH: 'var(--orange)', MODERATE: 'var(--yellow)' }[inc.severity] || 'var(--cyan)';
              return (
                <div key={inc.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                      background: `${sevColor}15`, color: sevColor, border: `1px solid ${sevColor}30`, whiteSpace: 'nowrap',
                    }}>{inc.severity}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text)' }}>{inc.id} — {inc.zone}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inc.type.replace(/_/g, ' ')}</div>
                    </div>
                    {assignedTeam ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)' }}>✓ {assignedTeam.id}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{assignedTeam.vehicle}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>⚠ UNASSIGNED</div>
                    )}
                  </div>
                </div>
              );
            })}
            {teams.filter(t => t.status === 'AVAILABLE').length < 2 && (
              <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--red-ghost)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, fontSize: 11.5, color: 'var(--red)' }}>
                ⚠️ <strong>Resource Shortage Detected:</strong> AI recommends requesting external municipal resources. {4} incidents may be left uncovered.
              </div>
            )}
          </div>
        </div>

        {/* Approvals + Audit */}
        <div>
          {/* Human-in-the-Loop Approvals */}
          <div className="hx-card" style={{ marginBottom: 16, border: '1px solid rgba(234,179,8,0.25)' }}>
            <div className="hx-card-title">👤 HUMAN-IN-THE-LOOP APPROVALS</div>
            <div style={{ padding: '8px 12px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: 7, marginBottom: 12, fontSize: 11.5, color: 'var(--yellow)', lineHeight: 1.6 }}>
              🛡️ AI provides recommendations. High-impact public-safety actions require officer approval before execution.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {approvals.filter(a => a.city === city || !a.city).map(apr => (
                <div key={apr.id} className="approval-card">
                  <div className="approval-card-header">
                    <div>
                      <div className="approval-type">{apr.type.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{apr.id} · Zone: {apr.zone}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {apr.status !== 'PENDING' ? (
                        <span style={{ fontSize: 11, fontWeight: 800, color: apr.status === 'APPROVED' ? 'var(--green)' : 'var(--red)', padding: '2px 8px', borderRadius: 4, background: apr.status === 'APPROVED' ? 'var(--green-ghost)' : 'var(--red-ghost)' }}>
                          {apr.status}
                        </span>
                      ) : (
                        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--yellow)', animation: 'pulse-dot 1.5s infinite' }}>● AWAITING</span>
                      )}
                    </div>
                  </div>
                  <div className="approval-body">
                    <div className="approval-desc">{apr.description}</div>
                    <div className="approval-reason">{apr.reason}</div>
                    {apr.alternative && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                        Alternative: <em>{apr.alternative}</em>
                      </div>
                    )}
                    <div className="approval-confidence">
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI Confidence:</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: apr.confidence >= 0.9 ? 'var(--green)' : 'var(--yellow)' }}>
                        {Math.round(apr.confidence * 100)}%
                      </span>
                    </div>
                    {apr.status === 'PENDING' && (
                      <div className="approval-actions">
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(apr.id)}>✓ APPROVE</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReject(apr.id)}>✕ REJECT</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => showToast('Modification mode — demo only', 'info')}>✎ MODIFY</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="hx-card">
            <div className="hx-card-title">📋 AUDIT TRAIL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {auditEntries.slice(0, 8).map(entry => (
                <div key={entry.id} style={{ padding: '9px 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--cyan)', minWidth: 50 }}>
                    {new Date(entry.timestamp).toTimeString().slice(0, 5)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{entry.action.replace(/_/g, ' ')}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 1 }}>
                      {entry.actor} · {entry.zone} · Conf: {Math.round(entry.confidence * 100)}%
                    </div>
                    {entry.reason && <div style={{ fontSize: 10, color: 'var(--yellow)', marginTop: 1 }}>{entry.reason}</div>}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                    background: entry.outcome === 'EXECUTED' ? 'var(--green-ghost)' : entry.outcome === 'REJECTED' ? 'var(--red-ghost)' : 'var(--orange-ghost)',
                    color: entry.outcome === 'EXECUTED' ? 'var(--green)' : entry.outcome === 'REJECTED' ? 'var(--red)' : 'var(--orange)',
                    border: `1px solid ${entry.outcome === 'EXECUTED' ? 'rgba(34,197,94,0.3)' : entry.outcome === 'REJECTED' ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}`,
                  }}>{entry.outcome}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
