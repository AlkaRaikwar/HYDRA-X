import React, { useEffect, useState, useContext } from 'react';
import { RefreshCw, Lightbulb } from 'lucide-react';
import { getInsights, getDashboard, getStock, getFollowUps } from '../services/api';
import { ToastContext } from '../App';

export default function InsightsPage() {
  const [insight, setInsight] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [stock, setStock] = useState(null);
  const [followUp, setFollowUp] = useState(null);
  const [loading, setLoading] = useState(true);
  const showToast = useContext(ToastContext);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([getInsights(), getDashboard(), getStock(), getFollowUps()])
      .then(([i, d, s, f]) => { setInsight(i.data); setDashboard(d.data); setStock(s.data); setFollowUp(f.data); })
      .catch(() => showToast('Failed to load insights.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>💡 AI Insights</h2>
          <p>Consolidated AI-generated situational awareness for PHC coordinators</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} /> Regenerate</button>
      </div>
      <div className="page-body">

        <div className="disclaimer mb-4">
          <span>⚕️</span>
          <span><strong>Disclaimer:</strong> AI insights are generated for decision support only and must be verified by qualified healthcare professionals before clinical action.</span>
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /><span>Generating AI insights…</span></div> : (
          <>
            {/* Main insight */}
            <div className="card mb-4" style={{ border: '2px solid var(--blue-100)' }}>
              <div className="section-header">
                <h3>🤖 Today's AI Brief</h3>
                <span className={`badge badge-${insight?.aiMode || 'DEMO'}`}>{insight?.aiMode === 'IBM_GRANITE' ? 'IBM Granite (watsonx)' : 'Demo AI Mode'}</span>
              </div>
              <div className="alert alert-info" style={{ marginBottom: '12px' }}>
                <Lightbulb size={16} />
                <p style={{ fontSize: '14px', lineHeight: 1.7 }}>{insight?.insight}</p>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>Generated at: {insight?.generatedAt ? new Date(insight.generatedAt).toLocaleString() : '—'}</div>
            </div>

            {/* Agent-by-agent breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

              {/* Triage agent */}
              <div className="card">
                <div className="section-header"><h3>🩺 Triage Agent Status</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Total cases processed', value: dashboard?.stats?.totalPatients },
                    { label: 'Urgent cases', value: dashboard?.stats?.urgentCases, highlight: true },
                    { label: 'Emergency cases', value: dashboard?.stats?.emergencyCases, highlight: true },
                    { label: 'Teleconsults recommended', value: dashboard?.stats?.pendingConsultations },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{s.label}</span>
                      <strong style={{ color: s.highlight && s.value > 0 ? 'var(--red-600)' : 'var(--gray-800)' }}>{s.value ?? '—'}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock agent */}
              <div className="card">
                <div className="section-header"><h3>💊 Stock Agent Status</h3></div>
                {stock?.summary?.aiSummary && (
                  <div className="alert alert-warning" style={{ marginBottom: '12px', fontSize: '13px' }}>
                    <span>📦</span>
                    <p>{stock.summary.aiSummary}</p>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Total medicines tracked', value: stock?.summary?.total },
                    { label: 'Critical / Out of stock', value: stock?.summary?.critical, highlight: true },
                    { label: 'Low stock', value: stock?.summary?.lowStock, highlight: true },
                    { label: 'Expiring soon', value: stock?.summary?.expiringSoon, highlight: true },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{s.label}</span>
                      <strong style={{ color: s.highlight && s.value > 0 ? 'var(--red-600)' : 'var(--gray-800)' }}>{s.value ?? '—'}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up agent */}
              <div className="card">
                <div className="section-header"><h3>📅 Follow-up Agent Status</h3></div>
                {followUp?.summary?.aiSummary && (
                  <div className="alert alert-info" style={{ marginBottom: '12px', fontSize: '13px' }}>
                    <span>👥</span>
                    <p>{followUp.summary.aiSummary}</p>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Chronic patients tracked', value: followUp?.summary?.total },
                    { label: 'Overdue', value: followUp?.summary?.overdue, highlight: true },
                    { label: 'Due today', value: followUp?.summary?.dueToday, highlight: true },
                    { label: 'Upcoming', value: followUp?.summary?.upcoming },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{s.label}</span>
                      <strong style={{ color: s.highlight && s.value > 0 ? 'var(--orange-600)' : 'var(--gray-800)' }}>{s.value ?? '—'}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* IBM Granite info */}
              <div className="card">
                <div className="section-header"><h3>🔧 IBM Granite Configuration</h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'AI Mode', value: insight?.aiMode === 'IBM_GRANITE' ? '✅ IBM Granite (watsonx)' : '🔶 Demo Mode' },
                    { label: 'Model', value: 'ibm/granite-3-3-8b-instruct' },
                    { label: 'Platform', value: 'IBM watsonx.ai' },
                    { label: 'Agents Active', value: '4 (Triage, Severity, Teleconsult, Stock/Followup)' },
                    { label: 'Language Support', value: 'Gujarati (gu-IN), Hindi, English' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--gray-100)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{s.label}</span>
                      <strong style={{ fontSize: '13px' }}>{s.value}</strong>
                    </div>
                  ))}
                </div>
                {insight?.aiMode !== 'IBM_GRANITE' && (
                  <div className="alert alert-warning mt-3">
                    <span>🔑</span>
                    <span style={{ fontSize: '12px' }}>Set WATSONX_API_KEY, PROJECT_ID, WATSONX_AI_URL in backend/.env to activate real IBM Granite.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended actions */}
            <div className="card">
              <div className="section-header"><h3>⚡ All Recommended Actions</h3></div>
              {dashboard?.recommendedActions?.length > 0
                ? dashboard.recommendedActions.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span className={`badge badge-${a.priority === 'HIGH' ? 'EMERGENCY' : a.priority === 'MEDIUM' ? 'URGENT' : 'MODERATE'}`} style={{ flexShrink: 0 }}>{a.priority}</span>
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--gray-700)' }}>{a.action}</p>
                      <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase' }}>{a.type}</span>
                    </div>
                  </div>
                ))
                : <div className="empty-state" style={{ padding: '20px' }}><p>No priority actions at this time.</p></div>
              }
            </div>
          </>
        )}
      </div>
    </div>
  );
}
