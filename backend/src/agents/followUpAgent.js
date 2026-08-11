/**
 * CHRONIC PATIENT FOLLOW-UP AGENT
 * Tracks overdue / due-today / upcoming follow-ups and recommends ASHA worker actions.
 */

const { callGranite } = require('../services/granite');
const { getFollowUps, updateFollowUpStatus } = require('../services/store');

const CONDITION_PROTOCOLS = {
  'Type 2 Diabetes': 'Check blood glucose, blood pressure, foot examination, and medication compliance. Educate on diet and physical activity.',
  'Hypertension': 'Measure blood pressure, review medication adherence, assess for symptoms (headache, vision changes, chest pain).',
  'Tuberculosis (DOTS)': 'Directly observed treatment — ensure patient takes all pills. Check weight, sputum if applicable, and side effects.',
  'Anaemia (Pregnancy)': 'Review iron-folic acid compliance, check for dizziness/fatigue, measure haemoglobin if possible, refer if severe.',
  'Malaria (Post-treatment)': 'Check for recurrence of fever, confirm treatment completion, and community prevention counselling.',
  'Leprosy (MDT)': 'Check MDT compliance, skin patches, nerve involvement, disability prevention, and referral if needed.'
};

function getDemoRecommendation(followUp) {
  const protocol = CONDITION_PROTOCOLS[followUp.condition] || 'Follow standard care protocol for this condition. Consult PHC doctor if unsure.';
  if (followUp.status === 'OVERDUE') {
    return `⚠️ OVERDUE by ${followUp.daysOverdue} day(s). Immediately contact ${followUp.name} or family member. ${protocol}`;
  } else if (followUp.status === 'DUE_TODAY') {
    return `📅 Due today. Schedule home visit or teleconsultation. ${protocol}`;
  } else {
    return `Upcoming follow-up in ${Math.abs(followUp.daysOverdue)} day(s). Prepare for visit. ${protocol}`;
  }
}

async function runFollowUpAgent() {
  const followUps = getFollowUps();
  const overdue = followUps.filter(f => f.status === 'OVERDUE');
  const dueToday = followUps.filter(f => f.status === 'DUE_TODAY');
  const upcoming = followUps.filter(f => f.status === 'UPCOMING');

  let aiSummary = null;
  if (overdue.length > 0 || dueToday.length > 0) {
    const overdueList = overdue.map(f => `${f.name} (${f.condition}) - overdue by ${f.daysOverdue} days, ASHA: ${f.ashaWorker}`).join('\n');
    const todayList = dueToday.map(f => `${f.name} (${f.condition}) - due today, ASHA: ${f.ashaWorker}`).join('\n');
    const resp = await callGranite(
      'You are an ASHA/PHC coordinator. Provide a brief 2-3 sentence priority summary for follow-up management. Focus on urgent cases.',
      `Overdue follow-ups:\n${overdueList || 'None'}\n\nDue today:\n${todayList || 'None'}`
    );
    if (resp) aiSummary = resp.trim();
  }

  const enriched = followUps.map(f => ({
    ...f,
    recommendation: getDemoRecommendation(f)
  }));

  return {
    followUps: enriched,
    summary: {
      total: followUps.length,
      overdue: overdue.length,
      dueToday: dueToday.length,
      upcoming: upcoming.length,
      aiSummary: aiSummary || (overdue.length > 0
        ? `${overdue.length} patient(s) have overdue follow-ups. Priority action required — ASHA workers should contact these patients immediately.`
        : dueToday.length > 0
        ? `${dueToday.length} patient(s) are due for follow-up today. Schedule visits or teleconsultations.`
        : 'No immediate follow-up actions required. All patients are on schedule.')
    },
    isDemo: true
  };
}

module.exports = { runFollowUpAgent, updateFollowUpStatus };
