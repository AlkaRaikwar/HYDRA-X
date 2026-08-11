import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Video } from 'lucide-react';
import { getTeleconsultOptions, bookAppointment, getAppointments, getTriageCases } from '../services/api';
import { ToastContext } from '../App';

export default function TeleconsultPage() {
  const { caseId } = useParams();
  const showToast = useContext(ToastContext);
  const [allCases, setAllCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(caseId || '');
  const [options, setOptions] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    getTriageCases().then(r => setAllCases(r.data)).catch(() => {});
    getAppointments().then(r => setAppointments(r.data)).catch(() => {});
  }, []);

  const loadOptions = useCallback(async (id) => {
    setLoadingOptions(true);
    setOptions(null);
    setSelectedDoctor('');
    setSelectedSlot('');
    try {
      const r = await getTeleconsultOptions(id);
      setOptions(r.data);
    } catch { showToast('Could not load teleconsult options.', 'error'); }
    finally { setLoadingOptions(false); }
  }, [showToast]);

  useEffect(() => {
    if (selectedCase) loadOptions(selectedCase);
  }, [selectedCase, loadOptions]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) { showToast('Please select a doctor and time slot.', 'error'); return; }
    setBooking(true);
    try {
      const r = await bookAppointment({ caseId: selectedCase, doctorName: selectedDoctor, slotDatetime: selectedSlot });
      setConfirmed(r.data);
      showToast('Teleconsultation booked successfully!', 'success');
      getAppointments().then(r2 => setAppointments(r2.data));
    } catch { showToast('Booking failed.', 'error'); }
    finally { setBooking(false); }
  };

  const groupedSlots = options?.availableSlots?.reduce((acc, s) => {
    const d = s.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {}) || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📹 Teleconsultation Agent</h2>
          <p>Schedule doctor consultations for triaged patients — Demo scheduling data</p>
        </div>
      </div>
      <div className="page-body">

        <div className="alert alert-warning mb-4">
          <span>🔶</span>
          <span><strong>Demo Note:</strong> Doctor availability and appointment slots are simulated for demonstration purposes. This is not a real telemedicine booking system.</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Case selector & booking */}
          <div>
            <div className="card mb-4">
              <div className="section-header"><h3>1. Select Patient Case</h3></div>
              <div className="form-group">
                <label>Patient Case</label>
                <select className="form-select" value={selectedCase} onChange={e => setSelectedCase(e.target.value)}>
                  <option value="">— Select a case —</option>
                  {allCases.filter(c => c.teleconsultRecommended).map(c => (
                    <option key={c.caseId} value={c.caseId}>
                      {c.patient?.name || 'Anonymous'} · {c.severity} · {c.patient?.village}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loadingOptions && <div className="loading-overlay"><div className="spinner" /><span>Loading options…</span></div>}

            {options && !confirmed && (
              <>
                <div className="card mb-4">
                  <div className="section-header"><h3>2. AI Recommendation</h3></div>
                  <div style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--blue-700)', marginBottom: '4px' }}>Why teleconsultation is recommended:</div>
                    <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{options.aiReason}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div><span className="text-muted text-sm">Specialty: </span><strong style={{ fontSize: '13px' }}>{options.specialty}</strong></div>
                    <div><span className="text-muted text-sm">Severity: </span><span className={`badge badge-${options.severity}`}>{options.severity}</span></div>
                  </div>
                </div>

                <div className="card mb-4">
                  <div className="section-header"><h3>3. Choose Doctor</h3></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {options.availableDoctors?.map(d => (
                      <div key={d.name} onClick={() => setSelectedDoctor(d.name)}
                        style={{ padding: '12px', border: `2px solid ${selectedDoctor === d.name ? 'var(--blue-600)' : 'var(--gray-200)'}`, borderRadius: '8px', cursor: 'pointer', background: selectedDoctor === d.name ? 'var(--blue-50)' : '#fff' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px' }}>{d.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{d.experience} · Languages: {d.lang}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card mb-4">
                  <div className="section-header"><h3>4. Choose Time Slot</h3></div>
                  {Object.entries(groupedSlots).map(([date, slots]) => (
                    <div key={date} style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--gray-600)', marginBottom: '6px' }}>{date}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {slots.map(s => (
                          <button key={s.datetime} type="button"
                            onClick={() => setSelectedSlot(s.datetime)}
                            className={`btn btn-sm ${selectedSlot === s.datetime ? 'btn-primary' : 'btn-ghost'}`}>
                            {s.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-success" style={{ width: '100%' }} onClick={handleBook} disabled={booking || !selectedDoctor || !selectedSlot}>
                  {booking ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Booking…</> : <><CheckCircle size={14} /> Confirm Appointment</>}
                </button>
              </>
            )}

            {confirmed && (
              <div className="card" style={{ border: '2px solid #86efac', background: 'var(--green-50)' }}>
                <div style={{ color: 'var(--green-700)', fontWeight: 800, fontSize: '16px', marginBottom: '12px' }}>✅ Appointment Confirmed!</div>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Patient:</strong> {confirmed.patientName}</div>
                  <div><strong>Doctor:</strong> {confirmed.doctor}</div>
                  <div><strong>Specialty:</strong> {confirmed.specialty}</div>
                  <div><strong>Date/Time:</strong> {new Date(confirmed.slot).toLocaleString()}</div>
                  <div><strong>Status:</strong> <span className="badge badge-CONFIRMED">CONFIRMED</span></div>
                </div>
                <div className="disclaimer mt-3">
                  <span>🔶</span>
                  <span style={{ fontSize: '11px' }}>Demo data — not a real appointment</span>
                </div>
                <button className="btn btn-ghost btn-sm mt-3" onClick={() => { setConfirmed(null); setSelectedCase(''); setOptions(null); }}>
                  Book Another
                </button>
              </div>
            )}
          </div>

          {/* Appointments list */}
          <div className="card">
            <div className="section-header">
              <h3>📋 Scheduled Appointments</h3>
              <span className="badge badge-DEMO">Demo Data</span>
            </div>
            {appointments.length === 0 ? (
              <div className="empty-state"><Video size={32} /><h3>No appointments yet</h3><p>Book a teleconsultation to see it here.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {appointments.map(a => (
                  <div key={a.appointmentId} style={{ border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '13px' }}>{a.patientName}</strong>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>🏥 {a.village}</div>
                      <div>👨‍⚕️ {a.doctor} · {a.specialty}</div>
                      <div>📅 {new Date(a.slot).toLocaleString()}</div>
                      <div className="mt-2" style={{ color: 'var(--gray-700)', fontSize: '12px' }}>{a.reason}</div>
                    </div>
                    <span className={`badge badge-${a.severity} mt-2`}>{a.severity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
