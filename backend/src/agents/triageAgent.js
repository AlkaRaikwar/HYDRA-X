/**
 * TRIAGE AGENT + SEVERITY CLASSIFICATION AGENT
 * Orchestrated in a single flow: input → triage → severity → recommendation
 */

const { callGranite } = require('../services/granite');
const { v4: uuidv4 } = require('uuid');
const { addPatientCase } = require('../services/store');

const SYSTEM_PROMPT = `You are a rural healthcare triage assistant for tribal areas in Gujarat, India (Dangs, Narmada, Chhota Udepur). You support patients who speak Gujarati or English.

IMPORTANT SAFETY RULES:
- You provide PRELIMINARY DECISION SUPPORT ONLY, not medical diagnosis.
- Never claim to diagnose a specific disease.
- Never prescribe medication or dosages.
- For EMERGENCY symptoms, always recommend immediate professional emergency care.
- Always recommend consulting a qualified doctor.

Your task: Analyse the patient's symptoms and return a JSON triage result with these exact fields:
{
  "severity": "ROUTINE" | "MODERATE" | "URGENT" | "EMERGENCY",
  "keySymptoms": ["symptom1", "symptom2"],
  "reasoning": "brief explanation in plain language",
  "recommendedNextStep": "clear action for patient/ASHA worker",
  "teleconsultRecommended": true | false,
  "emergencyCareRequired": true | false,
  "specialty": "General Physician" | "Pediatrician" | "Cardiologist" | "Pulmonologist" | "Neurologist" | "Gynecologist" | "Orthopedic" | "Dermatologist" | "ENT",
  "gujaratiSummary": "brief summary in Gujarati script (if language=gu, otherwise empty string)"
}

Severity rules:
- ROUTINE: minor ailments, no red flags
- MODERATE: concerning symptoms needing attention within 24-48 hours
- URGENT: needs same-day medical attention
- EMERGENCY: life-threatening, needs immediate care (chest pain, difficulty breathing, seizures, severe bleeding, altered consciousness, suspected stroke)

Teleconsult is recommended for MODERATE and URGENT cases. Emergency cases need physical emergency care, not teleconsult.`;

function buildDemoTriage(data) {
  const s = (data.symptoms || '').toLowerCase();
  const age = parseInt(data.age) || 30;

  // Rule-based demo triage
  let severity = 'ROUTINE';
  let specialty = 'General Physician';
  let teleconsultRecommended = false;
  let emergencyCareRequired = false;
  let reasoning = '';
  let recommendedNextStep = '';
  let keySymptoms = [];
  let gujaratiSummary = '';

  const emergency = ['chest pain', 'difficulty breathing', 'breathlessness', 'seizure', 'unconscious', 'stroke', 'severe bleeding', 'heart attack', 'paralysis'];
  const urgent = ['high fever', 'vomiting blood', 'severe headache', 'snake bite', 'dog bite', 'deep cut', 'broken bone', 'fracture', 'dehydration', 'unable to eat'];
  const moderate = ['fever', 'cough', 'diarrhea', 'stomach pain', 'back pain', 'joint pain', 'skin rash', 'eye pain', 'ear pain', 'toothache', 'weakness', 'fatigue'];

  if (emergency.some(e => s.includes(e))) {
    severity = 'EMERGENCY';
    emergencyCareRequired = true;
    teleconsultRecommended = false;
    reasoning = 'The reported symptoms include emergency red-flag signs that require immediate professional medical attention.';
    recommendedNextStep = 'Proceed to the nearest emergency facility immediately. Call 108 ambulance service. Do not delay.';
    specialty = s.includes('chest') || s.includes('heart') ? 'Cardiologist' : 'General Physician';
  } else if (urgent.some(u => s.includes(u))) {
    severity = 'URGENT';
    teleconsultRecommended = true;
    reasoning = 'Symptoms suggest a condition that needs same-day medical evaluation to prevent complications.';
    recommendedNextStep = 'Schedule a teleconsultation today or visit the nearest PHC/CHC as soon as possible.';
    specialty = s.includes('fever') ? 'General Physician' : s.includes('bone') || s.includes('fracture') ? 'Orthopedic' : 'General Physician';
  } else if (moderate.some(m => s.includes(m))) {
    severity = 'MODERATE';
    teleconsultRecommended = true;
    reasoning = 'Symptoms require medical attention within 24-48 hours. Monitoring at home is possible but a doctor consultation is recommended.';
    recommendedNextStep = 'Book a teleconsultation within 24 hours. Ensure adequate hydration and rest. Contact ASHA worker for guidance.';
    if (s.includes('cough')) specialty = 'Pulmonologist';
    else if (s.includes('rash') || s.includes('skin')) specialty = 'Dermatologist';
    else if (s.includes('eye')) specialty = 'ENT';
    else if (s.includes('ear')) specialty = 'ENT';
    else if (age < 12) specialty = 'Pediatrician';
  } else {
    severity = 'ROUTINE';
    teleconsultRecommended = false;
    reasoning = 'Symptoms appear to be mild. Basic home care and monitoring should be sufficient, but consult a doctor if symptoms worsen.';
    recommendedNextStep = 'Rest, maintain hydration, and monitor symptoms. Visit ASHA worker or PHC if symptoms persist beyond 3 days.';
  }

  // Extract key symptoms from input
  keySymptoms = (data.symptoms || '').split(/[,،\n]/).map(s => s.trim()).filter(Boolean).slice(0, 4);
  if (keySymptoms.length === 0) keySymptoms = ['Reported symptoms'];

  // Simple Gujarati summary
  if (data.language === 'gu') {
    const sevMap = { ROUTINE: 'સામાન્ય', MODERATE: 'મધ્યમ', URGENT: 'તાત્કાલિક', EMERGENCY: 'આपातकालीन' };
    gujaratiSummary = `⚕️ ${sevMap[severity] || severity}: ${recommendedNextStep}`;
  }

  return { severity, keySymptoms, reasoning, recommendedNextStep, teleconsultRecommended, emergencyCareRequired, specialty, gujaratiSummary };
}

async function runTriageAgent(patientData) {
  const caseId = uuidv4();
  const timestamp = new Date().toISOString();

  const userMessage = `Patient Information:
Name: ${patientData.name || 'Anonymous'}
Age: ${patientData.age || 'Unknown'}
Gender: ${patientData.gender || 'Unknown'}
Village/Location: ${patientData.village || 'Unknown'} 
Symptoms: ${patientData.symptoms}
Duration: ${patientData.duration || 'Not specified'}
Existing conditions: ${patientData.existingConditions || 'None mentioned'}
Current medicines: ${patientData.currentMedicines || 'None mentioned'}
Language preference: ${patientData.language || 'en'}

Provide triage assessment as JSON only.`;

  let triageResult = null;
  let aiMode = 'DEMO';

  // Try IBM Granite first
  const graniteResponse = await callGranite(SYSTEM_PROMPT, userMessage);
  if (graniteResponse) {
    try {
      const jsonMatch = graniteResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        triageResult = JSON.parse(jsonMatch[0]);
        aiMode = 'IBM_GRANITE';
      }
    } catch (e) {
      console.warn('[Triage] Failed to parse Granite JSON, falling back to demo');
    }
  }

  // Fallback to demo mode
  if (!triageResult) {
    triageResult = buildDemoTriage(patientData);
    aiMode = 'DEMO';
  }

  const caseRecord = {
    caseId,
    timestamp,
    aiMode,
    patient: {
      name: patientData.name || 'Anonymous',
      age: patientData.age,
      gender: patientData.gender,
      village: patientData.village,
      language: patientData.language
    },
    symptoms: patientData.symptoms,
    duration: patientData.duration,
    ...triageResult,
    disclaimer: 'This is preliminary AI-assisted decision support only. It does not replace a qualified healthcare professional. Always consult a doctor for medical advice.'
  };

  // Persist to in-memory store
  addPatientCase(caseRecord);

  return caseRecord;
}

module.exports = { runTriageAgent };
