/**
 * In-memory store for demo/runtime data.
 * In production this would be replaced with a real database.
 */

const { v4: uuidv4 } = require('uuid');

// ─── PATIENT CASES ───────────────────────────────────────────────────────────
const patientCases = [
  {
    caseId: 'demo-001',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    aiMode: 'DEMO',
    patient: { name: 'Ramiben Tadvi', age: 45, gender: 'Female', village: 'Subir, Dangs', language: 'gu' },
    symptoms: 'High fever, severe headache, body ache for 3 days',
    duration: '3 days',
    severity: 'URGENT',
    keySymptoms: ['High fever', 'Severe headache', 'Body ache'],
    reasoning: 'Combination of high fever, severe headache, and body ache in a tribal belt could indicate dengue, malaria, or typhoid. Needs same-day evaluation.',
    recommendedNextStep: 'Teleconsultation recommended today. Blood test (CBC, Malaria RDT) required.',
    teleconsultRecommended: true,
    emergencyCareRequired: false,
    specialty: 'General Physician',
    disclaimer: 'This is preliminary AI-assisted decision support only.'
  },
  {
    caseId: 'demo-002',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    aiMode: 'DEMO',
    patient: { name: 'Naresh Vasava', age: 8, gender: 'Male', village: 'Kevadia, Narmada', language: 'gu' },
    symptoms: 'Cough, runny nose, mild fever for 2 days',
    duration: '2 days',
    severity: 'MODERATE',
    keySymptoms: ['Cough', 'Runny nose', 'Mild fever'],
    reasoning: 'Symptoms are consistent with upper respiratory infection. Monitoring and consultation within 24-48 hours recommended.',
    recommendedNextStep: 'Teleconsultation within 24 hours. Ensure child is well-hydrated.',
    teleconsultRecommended: true,
    emergencyCareRequired: false,
    specialty: 'Pediatrician',
    disclaimer: 'This is preliminary AI-assisted decision support only.'
  },
  {
    caseId: 'demo-003',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    aiMode: 'DEMO',
    patient: { name: 'Sunita Rathwa', age: 62, gender: 'Female', village: 'Bodeli, Chhota Udepur', language: 'en' },
    symptoms: 'Chest pain, shortness of breath, dizziness',
    duration: '1 hour',
    severity: 'EMERGENCY',
    keySymptoms: ['Chest pain', 'Shortness of breath', 'Dizziness'],
    reasoning: 'Chest pain with breathlessness and dizziness are emergency red-flag symptoms. Possible cardiac event requiring immediate care.',
    recommendedNextStep: 'EMERGENCY: Call 108 immediately. Do not delay transport to hospital.',
    teleconsultRecommended: false,
    emergencyCareRequired: true,
    specialty: 'Cardiologist',
    disclaimer: 'This is preliminary AI-assisted decision support only.'
  }
];

function addPatientCase(c) { patientCases.unshift(c); }
function getPatientCases() { return patientCases; }
function getPatientCase(id) { return patientCases.find(c => c.caseId === id); }

// ─── TELECONSULT APPOINTMENTS ─────────────────────────────────────────────────
const appointments = [
  {
    appointmentId: 'apt-001',
    caseId: 'demo-001',
    patientName: 'Ramiben Tadvi',
    village: 'Subir, Dangs',
    severity: 'URGENT',
    specialty: 'General Physician',
    doctor: 'Dr. Priya Mehta',
    slot: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'CONFIRMED',
    reason: 'High fever with headache and body ache — urgent evaluation needed.',
    isDemo: true
  },
  {
    appointmentId: 'apt-002',
    caseId: 'demo-002',
    patientName: 'Naresh Vasava',
    village: 'Kevadia, Narmada',
    severity: 'MODERATE',
    specialty: 'Pediatrician',
    doctor: 'Dr. Rohan Shah',
    slot: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    reason: 'Pediatric respiratory symptoms — monitoring and prescription guidance.',
    isDemo: true
  }
];

function addAppointment(a) { appointments.unshift(a); }
function getAppointments() { return appointments; }
function getAppointmentByCaseId(caseId) { return appointments.find(a => a.caseId === caseId); }
function updateAppointmentStatus(id, status) {
  const a = appointments.find(a => a.appointmentId === id);
  if (a) a.status = status;
}

// ─── MEDICINE STOCK ───────────────────────────────────────────────────────────
// Expiry dates are relative offsets from today so the demo always looks current.
function futureDate(days) {
  const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0];
}
const medicineStock = [
  { id: 'm-001', name: 'Paracetamol 500mg',   quantity: 48,  minThreshold: 100, get expiryDate() { return futureDate(220); }, location: 'Subir PHC, Dangs',          _stockStatus: 'LOW_STOCK' },
  { id: 'm-002', name: 'ORS Sachet',           quantity: 12,  minThreshold: 50,  get expiryDate() { return futureDate(300); }, location: 'Subir PHC, Dangs',          _stockStatus: 'CRITICAL' },
  { id: 'm-003', name: 'Cotrimoxazole 480mg',  quantity: 80,  minThreshold: 60,  get expiryDate() { return futureDate(45);  }, location: 'Kevadia CHC, Narmada',      _stockStatus: 'EXPIRING_SOON' },
  { id: 'm-004', name: 'Iron-Folic Acid',      quantity: 200, minThreshold: 150, get expiryDate() { return futureDate(450); }, location: 'Kevadia CHC, Narmada',      _stockStatus: 'NORMAL' },
  { id: 'm-005', name: 'Amoxicillin 250mg',    quantity: 30,  minThreshold: 80,  get expiryDate() { return futureDate(380); }, location: 'Bodeli PHC, Chhota Udepur', _stockStatus: 'CRITICAL' },
  { id: 'm-006', name: 'Metformin 500mg',      quantity: 160, minThreshold: 100, get expiryDate() { return futureDate(60);  }, location: 'Bodeli PHC, Chhota Udepur', _stockStatus: 'NORMAL' },
  { id: 'm-007', name: 'Chloroquine 250mg',    quantity: 55,  minThreshold: 60,  get expiryDate() { return futureDate(250); }, location: 'Subir PHC, Dangs',          _stockStatus: 'LOW_STOCK' },
  { id: 'm-008', name: 'Vitamin A Capsules',   quantity: 90,  minThreshold: 100, get expiryDate() { return futureDate(75);  }, location: 'Kevadia CHC, Narmada',      _stockStatus: 'LOW_STOCK' }
];

function getMedicineStock() {
  return medicineStock.map(m => {
    const today = new Date();
    const expiry = new Date(m.expiryDate);
    const daysToExpiry = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
    let status;
    if (m.quantity <= 0) status = 'OUT_OF_STOCK';
    else if (m.quantity < m.minThreshold * 0.4) status = 'CRITICAL';
    else if (m.quantity < m.minThreshold) status = 'LOW_STOCK';
    else status = 'NORMAL';
    // Expiring soon overrides NORMAL but not CRITICAL/LOW
    if (daysToExpiry <= 90 && daysToExpiry > 0 && status === 'NORMAL') status = 'EXPIRING_SOON';
    return { ...m, status, daysToExpiry };
  });
}
function updateStock(id, qty) {
  const m = medicineStock.find(m => m.id === id);
  if (m) m.quantity = qty;
}

// ─── CHRONIC PATIENT FOLLOW-UPS ───────────────────────────────────────────────
function daysAgo(n) { return new Date(Date.now() - n * 86400000).toISOString().split('T')[0]; }
function daysFromNow(n) { return new Date(Date.now() + n * 86400000).toISOString().split('T')[0]; }

const followUps = [
  { id: 'fu-001', patientId: 'P-1021', name: 'Bhaviben Gamit', condition: 'Type 2 Diabetes', lastVisit: daysAgo(45), nextFollowUp: daysAgo(3), ashaWorker: 'Manjulaben Vasava', village: 'Subir, Dangs', status: 'OVERDUE' },
  { id: 'fu-002', patientId: 'P-1034', name: 'Kantibhai Rathwa', condition: 'Hypertension', lastVisit: daysAgo(28), nextFollowUp: new Date().toISOString().split('T')[0], ashaWorker: 'Sarojben Tadvi', village: 'Bodeli, Chhota Udepur', status: 'DUE_TODAY' },
  { id: 'fu-003', patientId: 'P-1047', name: 'Savitaben Naik', condition: 'Tuberculosis (DOTS)', lastVisit: daysAgo(8), nextFollowUp: daysFromNow(2), ashaWorker: 'Manjulaben Vasava', village: 'Ahwa, Dangs', status: 'UPCOMING' },
  { id: 'fu-004', patientId: 'P-1058', name: 'Ramesh Patel', condition: 'Anaemia (Pregnancy)', lastVisit: daysAgo(18), nextFollowUp: daysAgo(4), ashaWorker: 'Rekha Bhuriya', village: 'Rajpipla, Narmada', status: 'OVERDUE' },
  { id: 'fu-005', patientId: 'P-1065', name: 'Geeta Baria', condition: 'Malaria (Post-treatment)', lastVisit: daysAgo(14), nextFollowUp: daysFromNow(7), ashaWorker: 'Sarojben Tadvi', village: 'Kevadia, Narmada', status: 'UPCOMING' },
  { id: 'fu-006', patientId: 'P-1073', name: 'Dilip Vasava', condition: 'Leprosy (MDT)', lastVisit: daysAgo(32), nextFollowUp: daysAgo(2), ashaWorker: 'Rekha Bhuriya', village: 'Chhota Udepur Town', status: 'OVERDUE' }
];

function getFollowUps() {
  return followUps.map(f => {
    const today = new Date().toISOString().split('T')[0];
    const daysOverdue = Math.round((new Date(today) - new Date(f.nextFollowUp)) / 86400000);
    let status = 'UPCOMING';
    if (daysOverdue > 0) status = 'OVERDUE';
    else if (daysOverdue === 0) status = 'DUE_TODAY';
    return { ...f, status, daysOverdue };
  });
}
function updateFollowUpStatus(id, status, nextDate) {
  const f = followUps.find(f => f.id === id);
  if (f) { f.status = status; if (nextDate) f.nextFollowUp = nextDate; }
}

module.exports = {
  addPatientCase, getPatientCases, getPatientCase,
  addAppointment, getAppointments, getAppointmentByCaseId, updateAppointmentStatus,
  getMedicineStock, updateStock,
  getFollowUps, updateFollowUpStatus
};
