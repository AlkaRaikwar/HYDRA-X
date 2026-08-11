const express = require('express');
const router = express.Router();
const { callGranite } = require('../services/granite');
const { getPatientCases, getMedicineStock, getFollowUps } = require('../services/store');

// GET /api/insights — AI-generated insights summary for the ASHA/PHC coordinator
router.get('/', async (req, res) => {
  try {
    const cases = getPatientCases();
    const stock = getMedicineStock();
    const followUps = getFollowUps();

    const urgentCount = cases.filter(c => c.severity === 'URGENT' || c.severity === 'EMERGENCY').length;
    const stockAlerts = stock.filter(m => m.status !== 'NORMAL').length;
    const overdueFollowUps = followUps.filter(f => f.status === 'OVERDUE' || f.status === 'DUE_TODAY').length;

    const context = `Current healthcare situation:
- Total triage cases: ${cases.length} (${urgentCount} urgent/emergency)
- Medicine stock alerts: ${stockAlerts}
- Overdue/due today follow-ups: ${overdueFollowUps}
- Villages covered: Dangs, Narmada, Chhota Udepur (tribal belt, Gujarat)`;

    const resp = await callGranite(
      'You are an AI health coordinator for rural tribal healthcare in Gujarat. Provide a concise 3-4 sentence situational briefing for the PHC/ASHA team today. Focus on most critical actions needed.',
      context
    );

    const aiMode = process.env.WATSONX_API_KEY ? 'IBM_GRANITE' : 'DEMO';

    res.json({
      insight: resp?.trim() || `Today's situation: ${urgentCount} urgent/emergency cases require immediate attention. ${stockAlerts} medicine stock alerts need action — prioritize critical stock replenishment. ${overdueFollowUps} patient follow-ups are overdue or due today. ASHA workers should coordinate with PHC to address these cases urgently.`,
      aiMode,
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI-generated decision support summary. Verify with PHC doctor before taking clinical action.'
    });
  } catch (err) {
    console.error('[Insights Route]', err);
    res.status(500).json({ error: 'Insights generation failed', details: err.message });
  }
});

module.exports = router;
