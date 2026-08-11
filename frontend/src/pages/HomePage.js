import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getInsights } from '../services/api';
import { ArrowRight, Stethoscope } from 'lucide-react';

export default function HomePage() {
  const [dashboard, setDashboard] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getDashboard(), getInsights()])
      .then(([d, i]) => { setDashboard(d.data); setInsight(i.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = dashboard?.stats || {};

  const statCards = [
    { label: 'Patients Assisted', value: stats.totalPatients ?? '—', sub: 'Total triage cases',       cls: 'stat-blue',   icon: '👥' },
    { label: 'Urgent Cases',       value: stats.urgentCases ?? '—',   sub: 'Same-day care needed',    cls: 'stat-orange', icon: '⚡' },
    { label: 'Emergency Cases',    value: stats.emergencyCases ?? '—',sub: 'Immediate escalation',    cls: 'stat-red',    icon: '🚨' },
    { label: 'Pending Consults',   value: stats.pendingConsultations ?? '—', sub: 'Teleconsultations',cls: 'stat-purple', icon: '📹' },
    { label: 'Overdue Follow-ups', value: stats.overdueFollowUps ?? '—', sub: 'Chronic patients',     cls: 'stat-yellow', icon: '📅' },
    { label: 'Stock Alerts',       value: stats.stockAlerts ?? '—',   sub: 'Low / critical / expiring',cls: 'stat-red',   icon: '💊' },
  ];

  const quickLinks = [
    { icon: '🩺', bg: 'linear-gradient(135deg,#dbeafe,#ede9fe)', label: 'Patient Triage',       desc: 'Submit symptoms for AI triage',     path: '/triage' },
    { icon: '📹', bg: 'linear-gradient(135deg,#f3e8ff,#fce7f3)', label: 'Teleconsultation',     desc: 'Schedule a doctor consultation',    path: '/teleconsult' },
    { icon: '💊', bg: 'linear-gradient(135deg,#ffedd5,#fef9c3)', label: 'Medicine Stock',       desc: 'Monitor PHC inventory alerts',      path: '/stock' },
    { icon: '📅', bg: 'linear-gradient(135deg,#dcfce7,#d1fae5)', label: 'Patient Follow-ups',  desc: 'Track chronic patient schedules',   path: '/followup' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🏥 SwasthyaSetu</h2>
          <p>Agentic AI for tribal belt healthcare · Dangs · Narmada · Chhota Udepur, Gujarat</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/triage')}>
          <Stethoscope size={15} /> Start Patient Triage
        </button>
      </div>

      <div className="page-body">

        {/* ── Hero Banner ── */}
        <div className="hero-banner">
          <h1>Rural &amp; Tribal Healthcare Access Agent</h1>
          <p>AI-powered preliminary triage, teleconsultation scheduling, medicine stock monitoring, and chronic patient follow-up — built for ASHA workers and PHC coordinators in Gujarat's tribal belts.</p>
          <div className="hero-actions">
            <span className="hero-pill">🤖 IBM Granite LLM</span>
            <span className="hero-pill">📍 Dangs · Narmada · Chhota Udepur</span>
            <span className="hero-pill">🗣 Gujarati &amp; English</span>
            <span className="hero-pill">⚕️ Decision Support Only</span>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="disclaimer mb-6">
          <span>⚠️</span>
          <span><strong>Disclaimer:</strong> This AI provides preliminary decision support only. It does not replace a qualified healthcare professional. All outputs require clinical validation. This is a demonstration prototype.</span>
        </div>

        {/* ── KPI Stat Cards ── */}
        {loading ? (
          <div className="loading-overlay"><div className="spinner" /><span>Loading dashboard…</span></div>
        ) : (
          <div className="stat-grid mb-6">
            {statCards.map(s => (
              <div key={s.label} className={`stat-card ${s.cls}`}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── AI Actions + Recent Cases ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          <div className="card">
            <div className="section-header">
              <h3>🤖 AI Recommended Actions</h3>
              <span className={`badge badge-${insight?.aiMode || 'DEMO'}`}>
                {insight?.aiMode === 'IBM_GRANITE' ? 'IBM Granite' : 'Demo AI'}
              </span>
            </div>
            {insight && (
              <div className="insight-panel mb-4" style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--blue-800,#1e40af)' }}>
                  💡 {insight.insight}
                </p>
              </div>
            )}
            {dashboard?.recommendedActions?.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span className={`badge badge-${a.priority === 'HIGH' ? 'URGENT' : a.priority === 'MEDIUM' ? 'MODERATE' : 'ROUTINE'}`}>{a.priority}</span>
                <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{a.action}</span>
              </div>
            ))}
            {!dashboard?.recommendedActions?.length && (
              <div className="empty-state" style={{ padding: 20 }}><p>No actions pending.</p></div>
            )}
          </div>

          <div className="card">
            <div className="section-header">
              <h3>📋 Recent Triage Cases</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
                View All <ArrowRight size={12} />
              </button>
            </div>
            {dashboard?.recentCases?.length ? dashboard.recentCases.map(c => (
              <div key={c.caseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.patient?.name || 'Anonymous'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>
                    📍 {c.patient?.village} · {c.symptoms?.slice(0, 38)}{c.symptoms?.length > 38 ? '…' : ''}
                  </div>
                </div>
                <span className={`badge badge-${c.severity}`}>{c.severity}</span>
              </div>
            )) : <div className="empty-state" style={{ padding: 20 }}><p>No cases yet.</p></div>}
          </div>
        </div>

        {/* ── Agentic Workflow Diagram ── */}
        <div className="card mt-6">
          <div className="section-header"><h3>🔄 Agentic Orchestration Workflow</h3></div>
          <div className="agent-flow">
            {[
              { label: 'Patient Input',    icon: '👤', cls: 'node-done' },
              { arrow: true },
              { label: 'Triage Agent',     icon: '🩺', cls: 'node-done' },
              { arrow: true },
              { label: 'Severity Agent',   icon: '📊', cls: 'node-done' },
              { arrow: true },
              { label: 'Teleconsult Agent',icon: '📹', cls: 'node-active' },
              { arrow: true },
              { label: 'ASHA Dashboard',   icon: '🏥', cls: 'node-active' },
            ].map((n, i) => n.arrow
              ? <div key={i} className="agent-arrow">→</div>
              : <div key={i} className={`agent-node ${n.cls}`}>
                  <div className="node-icon">{n.icon}</div>
                  <div className="node-label">{n.label}</div>
                </div>
            )}
          </div>
          <div className="agent-flow" style={{ marginTop: 8 }}>
            {[
              { label: 'ASHA/PHC Data',  icon: '📂', cls: 'node-done' },
              { arrow: true },
              { label: 'Stock Agent',    icon: '💊', cls: 'node-active' },
              { arrow: true },
              { label: 'Stock Alerts',   icon: '🔔', cls: 'node-alert' },
              { spacer: true },
              { label: 'Follow-up Agent',icon: '📅', cls: 'node-active' },
              { arrow: true },
              { label: 'Overdue Alerts', icon: '⚠️', cls: 'node-alert' },
            ].map((n, i) => n.arrow
              ? <div key={i} className="agent-arrow">→</div>
              : n.spacer
                ? <div key={i} style={{ flex: 1 }} />
                : <div key={i} className={`agent-node ${n.cls}`}>
                    <div className="node-icon">{n.icon}</div>
                    <div className="node-label">{n.label}</div>
                  </div>
            )}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 24 }}>
          {quickLinks.map(q => (
            <div key={q.path} className="quick-link-card" onClick={() => navigate(q.path)}>
              <div className="ql-icon" style={{ background: q.bg }}>{q.icon}</div>
              <h4>{q.label}</h4>
              <p>{q.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
