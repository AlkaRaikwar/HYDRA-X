import React, { useEffect, useState, useContext } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { getStock, updateStock } from '../services/api';
import { ToastContext } from '../App';

const STATUS_COLORS = {
  NORMAL: 'badge-NORMAL',
  LOW_STOCK: 'badge-LOW_STOCK',
  CRITICAL: 'badge-CRITICAL',
  EXPIRING_SOON: 'badge-EXPIRING_SOON',
  OUT_OF_STOCK: 'badge-CRITICAL',
};

export default function StockPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);
  const showToast = useContext(ToastContext);

  const load = React.useCallback(() => {
    setLoading(true);
    getStock().then(r => setData(r.data)).catch(() => showToast('Failed to load stock data.', 'error')).finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id) => {
    if (isNaN(editQty) || editQty === '') { showToast('Enter a valid quantity.', 'error'); return; }
    setSaving(true);
    try {
      await updateStock(id, parseInt(editQty));
      showToast('Stock updated.', 'success');
      setEditId(null);
      load();
    } catch { showToast('Update failed.', 'error'); }
    finally { setSaving(false); }
  };

  const stockAll = data?.stock || [];
  const alerts = data?.alerts || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>💊 Medicine Stock Agent</h2>
          <p>AI-monitored medicine inventory — PHC & CHC across tribal belt</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}><RefreshCw size={13} /> Refresh</button>
      </div>
      <div className="page-body">

        <div className="alert alert-info mb-4">
          <span>🔶</span>
          <span><strong>Demo Data:</strong> Medicine stock data is simulated for demonstration. Not sourced from real government inventory systems.</span>
        </div>

        {loading ? <div className="loading-overlay"><div className="spinner" /><span>Running Stock Agent…</span></div> : (
          <>
            {/* Summary stats */}
            <div className="stat-grid mb-6">
              <div className="stat-card stat-blue"><div className="stat-label">Total Medicines</div><div className="stat-value">{data?.summary?.total}</div></div>
              <div className="stat-card stat-green"><div className="stat-label">Normal Stock</div><div className="stat-value">{data?.summary?.normal}</div></div>
              <div className="stat-card stat-yellow"><div className="stat-label">Low Stock</div><div className="stat-value">{data?.summary?.lowStock}</div></div>
              <div className="stat-card stat-red"><div className="stat-label">Critical / Out</div><div className="stat-value">{data?.summary?.critical}</div></div>
              <div className="stat-card stat-orange"><div className="stat-label">Expiring Soon</div><div className="stat-value">{data?.summary?.expiringSoon}</div></div>
            </div>

            {/* AI Summary */}
            {data?.summary?.aiSummary && (
              <div className="card mb-4">
                <div className="section-header">
                  <h3>🤖 Stock Agent Summary</h3>
                  <span className="badge badge-DEMO">Agent Output</span>
                </div>
                <div className="alert alert-warning">
                  <AlertTriangle size={15} />
                  <p style={{ lineHeight: 1.6 }}>{data.summary.aiSummary}</p>
                </div>
              </div>
            )}

            {/* Alerts section */}
            {alerts.length > 0 && (
              <div className="card mb-4">
                <div className="section-header"><h3>🔔 Active Alerts ({alerts.length})</h3></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {alerts.map(m => (
                    <div key={m.id} style={{ border: `1px solid ${m.status === 'CRITICAL' ? '#fca5a5' : m.status === 'LOW_STOCK' ? '#fde68a' : '#fed7aa'}`, borderRadius: '8px', padding: '14px', background: m.status === 'CRITICAL' ? '#fef2f2' : '#fff7ed' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{m.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px' }}>📍 {m.location}</div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <span className={`badge ${STATUS_COLORS[m.status]}`}>{m.statusLabel}</span>
                        <span style={{ fontSize: '12px' }}>Qty: <strong>{m.quantity}</strong> / Min: {m.minThreshold}</span>
                      </div>
                      <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--gray-700)', background: 'rgba(255,255,255,0.6)', padding: '8px', borderRadius: '6px' }}>{m.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full inventory table */}
            <div className="card">
              <div className="section-header"><h3>📦 Full Inventory</h3></div>
              <div className="table-wrapper">
                <table>
                  <thead><tr>
                    <th>Medicine</th><th>Location</th><th>Qty</th><th>Min Threshold</th><th>Expiry</th><th>Days Left</th><th>Status</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    {stockAll.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.name}</strong></td>
                        <td style={{ fontSize: '12px' }}>{m.location}</td>
                        <td>
                          {editId === m.id
                            ? <input type="number" className="form-input" style={{ width: '70px', padding: '4px 8px' }} value={editQty} onChange={e => setEditQty(e.target.value)} autoFocus />
                            : <strong style={{ color: m.quantity < m.minThreshold ? 'var(--red-600)' : 'inherit' }}>{m.quantity}</strong>
                          }
                        </td>
                        <td>{m.minThreshold}</td>
                        <td style={{ fontSize: '12px' }}>{m.expiryDate}</td>
                        <td style={{ fontSize: '12px', color: m.daysToExpiry <= 90 ? 'var(--orange-600)' : 'var(--gray-500)' }}>{m.daysToExpiry}d</td>
                        <td><span className={`badge ${STATUS_COLORS[m.status]}`}>{m.statusLabel}</span></td>
                        <td>
                          {editId === m.id
                            ? <div style={{ display: 'flex', gap: '4px' }}>
                                <button className="btn btn-success btn-sm" onClick={() => handleSave(m.id)} disabled={saving}>Save</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                              </div>
                            : <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(m.id); setEditQty(m.quantity); }}>Update</button>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
