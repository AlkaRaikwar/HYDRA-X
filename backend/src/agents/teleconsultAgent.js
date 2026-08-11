/**
 * TELECONSULTATION AGENT
 * Generates consultation scheduling and doctor recommendations.
 */

const { callGranite } = require('../services/granite');
const { getPatientCase, addAppointment, getAppointments, getAppointmentByCaseId } = require('../services/store');
const { v4: uuidv4 } = require('uuid');

const DEMO_DOCTORS = {
  'General Physician': [
    { name: 'Dr. Priya Mehta', experience: '12 years', lang: 'Gujarati, Hindi, English' },
    { name: 'Dr. Suresh Parmar', experience: '8 years', lang: 'Gujarati, Hindi' }
  ],
  'Pediatrician': [
    { name: 'Dr. Rohan Shah', experience: '10 years', lang: 'Gujarati, English' },
    { name: 'Dr. Anita Desai', experience: '15 years', lang: 'Gujarati, Hindi, English' }
  ],
  'Cardiologist': [
    { name: 'Dr. Vikram Joshi', experience: '18 years', lang: 'Gujarati, Hindi, English' }
  ],
  'Pulmonologist': [
    { name: 'Dr. Neha Bhatt', experience: '9 years', lang: 'Gujarati, English' }
  ],
  'Gynecologist': [
    { name: 'Dr. Kavita Tadvi', experience: '14 years', lang: 'Gujarati, Hindi' }
  ],
  'Orthopedic': [
    { name: 'Dr. Rajesh Solanki', experience: '11 years', lang: 'Gujarati, Hindi' }
  ],
  'Dermatologist': [
    { name: 'Dr. Smita Vasava', experience: '7 years', lang: 'Gujarati, Hindi, English' }
  ],
  'ENT': [
    { name: 'Dr. Dinesh Rathwa', experience: '9 years', lang: 'Gujarati, Hindi' }
  ],
  'Neurologist': [
    { name: 'Dr. Amit Patel', experience: '16 years', lang: 'Gujarati, Hindi, English' }
  ]
};

function generateSlots() {
  const slots = [];
  const base = new Date();
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  for (let d = 0; d < 3; d++) {
    const date = new Date(base);
    date.setDate(base.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    times.forEach(t => {
      slots.push({ date: dateStr, time: t, datetime: `${dateStr}T${t}:00` });
    });
  }
  return slots;
}

async function getTeleconsultOptions(caseId) {
  const patientCase = getPatientCase(caseId);
  if (!patientCase) return null;

  const specialty = patientCase.specialty || 'General Physician';
  const doctors = DEMO_DOCTORS[specialty] || DEMO_DOCTORS['General Physician'];
  const slots = generateSlots();

  let aiReason = null;
  const graniteResp = await callGranite(
    'You are a healthcare triage assistant. In 2-3 sentences, explain why this patient needs a teleconsultation and what the doctor should focus on. Be concise and use plain language.',
    `Patient: ${patientCase.patient.name || 'Patient'}, Age: ${patientCase.patient.age}, Symptoms: ${patientCase.symptoms}, Severity: ${patientCase.severity}, Specialty needed: ${specialty}`
  );
  if (graniteResp) aiReason = graniteResp.trim();

  return {
    caseId,
    patient: patientCase.patient,
    severity: patientCase.severity,
    specialty,
    aiReason: aiReason || `The patient presents with ${patientCase.keySymptoms?.join(', ')}. A ${specialty} teleconsultation is recommended for proper evaluation and treatment guidance.`,
    availableDoctors: doctors,
    availableSlots: slots,
    isDemo: true,
    demoNote: 'Demo data — not real healthcare provider slots'
  };
}

async function bookAppointment(caseId, doctorName, slotDatetime) {
  const patientCase = getPatientCase(caseId);
  if (!patientCase) throw new Error('Case not found');

  const existing = getAppointmentByCaseId(caseId);
  if (existing) {
    existing.doctor = doctorName;
    existing.slot = slotDatetime;
    existing.status = 'CONFIRMED';
    return existing;
  }

  const appt = {
    appointmentId: uuidv4(),
    caseId,
    patientName: patientCase.patient.name,
    village: patientCase.patient.village,
    severity: patientCase.severity,
    specialty: patientCase.specialty || 'General Physician',
    doctor: doctorName,
    slot: slotDatetime,
    status: 'CONFIRMED',
    reason: patientCase.recommendedNextStep,
    isDemo: true
  };
  addAppointment(appt);
  return appt;
}

module.exports = { getTeleconsultOptions, bookAppointment, getAppointments };
