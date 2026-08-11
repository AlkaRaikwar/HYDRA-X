import React, { useEffect, useState, useContext } from 'react';
import { RefreshCw, CheckCircle, Users } from 'lucide-react';
import { getFollowUps, updateFollowUp } from '../services/api';
import { ToastContext } from '../App';

const STATUS_BADGE = {
  OVERDUE: 'badge-OVERDUE',
  DUE_TODAY: 'badge-DUE_TODAY',
  UPCOMING: 'badge-UPCOMING',
};

export default function FollowUpPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const showToast = useContext(ToastContext);

  const load = React.useCallback(() => {
    setLoading(true);
    getFollowUps().then(r => setData(r.data)).catch(() => showToast('Failed to load follow-ups.', 'error')).finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const markCompleted = async (id) => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    const nextStr = nextDate.toISOString().split('T')[0];
    setUpdating(id);
    try {
      await updateFollowUp(id, { status: 'COMPLETED', nextFollowUp: nextStr });
      showToast('Follow-up marked as completed. Next follow-up scheduled in 30 days.', 'success');
      load();
    } catch { showToast('Update failed.', 'error'); }
    finally { setUpdating(null); }
  };

  const followUps = data?.followUps || [];
  const overdue = followUps.filter(f => f.status === 'OVERDUE');
  const dueToday = followUps.filter(f => f.status === 'DUE_TODAY');
  const upcoming = followUps.filter(f => f.status === 'UPCOMING');

  const Section = ({ title, items, emptyMsg }) => (
    <div className="card mb-4">
      <div className="section-header">
        <h3>{title} <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--gray-500)' }}>({items.length})</span></h3>
      </div>
      {items.length === 0
        ? <div className="empty-state" style={{ padding: '24px' }}><p>{emptyMsg}</p></div>
        : items.map(f => (
          <div key={f.id} style={{ border: `1px solid ${f.status === 'OVERDUE' ? '#fca5a5' : f.status === 'DUE_TODAY' ? '#fed7aa' : 'var(--gray-200)'}`, borderRadius: '10px', padding: '16px', marginBottom: '12px', background: f.status === 'OVERDUE' ? '#fef2f2' : f.status === 'DUE_TODAY' ? '#fff7ed' : '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{f.name} <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 400 }}>ID: {f.patientId}</span></div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '2px' }}>🏥 {f.condition} · 📍 {f.village}</div>
              </div>
              <span className={`badge ${STATUS_BADGE[f.status]}`}>{f.status.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px' }}><span style={{ color: 'var(--gray-500)' }}>Last Visit:</span><br /><strong>{f.lastVisit}</strong></div>
              <div style={{ fontSize: '12px' }}><span style={{ color: 'var(--gray-500)' }}>Next Due:</span><br /><strong style={{ color: f.status === 'OVERDUE' ? 'var(--red-600)' : 'inherit' }}>{f.nextFollowUp}</strong></div>
              <div style={{ fontSize: '12px' }}><span style={{ color: 'var(--gray-500)' }}>ASHA Worker:</span><br /><strong>{f.ashaWorker}</strong></div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '6px', padding: '10px', marginBottom: '10px', fontSize: '12px', lineHeight: 1.6, color: 'var(--gray-700)' }}>
              💡 {f.recommendation}
            </div>
            <button
              className="btn btn-success btn-sm"
              onClick={() => markCompleted(f.id)}
              disabled={updating === f.id}>
              {updating === f.id ? <><div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Updating…</> : <><CheckCircle size={12} /> Mark Completed</>}
            </button>
          </div>
        ))
      }
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📅 Chronic Patient Follow-ups</h2>
          <p>ASHA worker follow-up tracking — Dangs · Narmada · Chhota Udepur</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} /> Refresh</button>
      </div>
      <div className="page-body">

        <div className="alert alert-info mb-4">
          <span>🔶</span>
          <span><strong>Demo Data:</strong> Patient follow-up records are simulated for demonstration purposes.</span>
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /><span>Running Follow-up Agent…</span></div> : (
          <>
            {/* Summary */}
            <div className="stat-grid mb-6">
              <div className="stat-card stat-blue"><div className="stat-label">Total</div><div className="stat-value">{data?.summary?.total}</div><div className="stat-sub">Chronic patients</div></div>
              <div className="stat-card stat-red"><div className="stat-label">Overdue</div><div className="stat-value">{data?.summary?.overdue}</div><div className="stat-sub">Immediate action</div></div>
              <div className="stat-card stat-orange"><div className="stat-label">Due Today</div><div className="stat-value">{data?.summary?.dueToday}</div><div className="stat-sub">Schedule now</div></div>
              <div className="stat-card stat-green"><div className="stat-label">Upcoming</div><div className="stat-value">{data?.summary?.upcoming}</div><div className="stat-sub">On schedule</div></div>
            </div>

            {/* Agent AI summary */}
            {data?.summary?.aiSummary && (
              <div className="card mb-4">
                <div className="section-header"><h3>🤖 Follow-up Agent Summary</h3></div>
                <div className="alert alert-warning">
                  <Users size={15} />
                  <p style={{ lineHeight: 1.6 }}>{data.summary.aiSummary}</p>
                </div>
              </div>
            )}

            <Section title="🔴 Overdue Follow-ups" items={overdue} emptyMsg="No overdue follow-ups. Great work!" />
            <Section title="🟠 Due Today" items={dueToday} emptyMsg="No follow-ups due today." />
            <Section title="🔵 Upcoming (Next 7 days)" items={upcoming} emptyMsg="No upcoming follow-ups in the next 7 days." />
          </>
        )}
      </div>
    </div>
  );
}
