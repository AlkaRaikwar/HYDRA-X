import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getInsights } from '../services/api';
import { ArrowRight, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([getDashboard(), getInsights()])
      .then(([d, i]) => { setData(d.data); setInsight(i.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const stats = data?.stats || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🏥 ASHA / PHC Dashboard</h2>
          <p>Real-time overview for ASHA workers and PHC coordinators — Dangs · Narmada · Chhota Udepur</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} /> Refresh</button>
      </div>
      <div className="page-body">

        <div className="alert alert-info mb-4">
          <span>🔶</span>
          <span><strong>Demo Data:</strong> All patient, stock, and follow-up data shown is simulated for demonstration. Not real government or patient data.</span>
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /><span>Loading dashboard…</span></div> : (
          <>
            {/* Stats */}
            <div className="stat-grid mb-6">
              <div className="stat-card stat-blue"><div className="stat-label">Total Patients</div><div className="stat-value">{stats.totalPatients}</div><div className="stat-sub">Triage cases</div></div>
              <div className="stat-card stat-orange"><div className="stat-label">Urgent Cases</div><div className="stat-value">{stats.urgentCases}</div><div className="stat-sub">Same-day care needed</div></div>
              <div className="stat-card stat-red"><div className="stat-label">Emergencies</div><div className="stat-value">{stats.emergencyCases}</div><div className="stat-sub">Immediate care</div></div>
              <div className="stat-card stat-purple"><div className="stat-label">Pending Consults</div><div className="stat-value">{stats.pendingConsultations}</div><div className="stat-sub">Teleconsultations</div></div>
              <div className="stat-card stat-yellow"><div className="stat-label">Overdue Follow-ups</div><div className="stat-value">{stats.overdueFollowUps}</div><div className="stat-sub">Chronic patients</div></div>
              <div className="stat-card stat-red"><div className="stat-label">Stock Alerts</div><div className="stat-value">{stats.stockAlerts}</div><div className="stat-sub">Low/critical/expiring</div></div>
            </div>

            {/* AI Insights + Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div className="card">
                <div className="section-header">
                  <h3>🤖 AI Situational Brief</h3>
                  <span className={`badge badge-${insight?.aiMode || 'DEMO'}`}>{insight?.aiMode === 'IBM_GRANITE' ? 'IBM Granite' : 'Demo AI'}</span>
                </div>
                {insight && (
                  <div className="alert alert-info">
                    <span>💡</span>
                    <p style={{ lineHeight: 1.6 }}>{insight.insight}</p>
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '8px' }}>
                  {insight?.disclaimer}
                </div>
              </div>

              <div className="card">
                <div className="section-header"><h3>⚡ Recommended Actions</h3></div>
                {data?.recommendedActions?.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span className={`badge badge-${a.priority === 'HIGH' ? 'EMERGENCY' : a.priority === 'MEDIUM' ? 'URGENT' : 'MODERATE'}`}>{a.priority}</span>
                    <span style={{ fontSize: '13px', color: 'var(--gray-700)' }}>{a.action}</span>
                  </div>
                ))}
                {!data?.recommendedActions?.length && <div className="empty-state" style={{ padding: '20px' }}>No actions pending.</div>}
              </div>
            </div>

            {/* Recent cases table */}
            <div className="card mb-4">
              <div className="section-header">
                <h3>📋 Recent Triage Cases</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/triage')}>+ New Triage</button>
              </div>
              {data?.recentCases?.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead><tr>
                      <th>Patient</th><th>Village</th><th>Symptoms</th><th>Severity</th><th>Teleconsult</th><th>Time</th>
                    </tr></thead>
                    <tbody>
                      {data.recentCases.map(c => (
                        <tr key={c.caseId}>
                          <td><strong>{c.patient?.name || 'Anonymous'}</strong><br /><span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Age {c.patient?.age} · {c.patient?.gender}</span></td>
                          <td>{c.patient?.village || '—'}</td>
                          <td style={{ maxWidth: '200px' }}>{(c.symptoms || '').slice(0, 50)}{c.symptoms?.length > 50 ? '…' : ''}</td>
                          <td><span className={`badge badge-${c.severity}`}>{c.severity}</span></td>
                          <td>{c.teleconsultRecommended ? <span style={{ color: 'var(--green-600)', fontSize: '12px' }}>✓ Yes</span> : <span style={{ color: 'var(--gray-400)', fontSize: '12px' }}>—</span>}</td>
                          <td style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{new Date(c.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="empty-state"><p>No cases yet. Start a patient triage.</p></div>}
            </div>

            {/* Upcoming consultations */}
            <div className="card">
              <div className="section-header">
                <h3>📹 Upcoming Consultations</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/teleconsult')}>View All <ArrowRight size={12} /></button>
              </div>
              {data?.upcomingConsultations?.length > 0 ? (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Patient</th><th>Doctor</th><th>Specialty</th><th>Slot</th><th>Status</th></tr></thead>
                    <tbody>
                      {data.upcomingConsultations.map(a => (
                        <tr key={a.appointmentId}>
                          <td>{a.patientName}</td>
                          <td>{a.doctor}</td>
                          <td>{a.specialty}</td>
                          <td style={{ fontSize: '12px' }}>{new Date(a.slot).toLocaleString()}</td>
                          <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="empty-state"><p>No consultations scheduled.</p></div>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
