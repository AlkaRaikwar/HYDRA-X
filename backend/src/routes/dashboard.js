const express = require('express');
const router = express.Router();
const { getPatientCases } = require('../services/store');
const { getAppointments } = require('../agents/teleconsultAgent');
const { getMedicineStock, getFollowUps } = require('../services/store');

// GET /api/dashboard — aggregate dashboard stats for ASHA/PHC workers
router.get('/', (req, res) => {
  try {
    const cases = getPatientCases();
    const appointments = getAppointments();
    const stock = getMedicineStock();
    const followUps = getFollowUps();

    const urgentCases = cases.filter(c => c.severity === 'URGENT').length;
    const emergencyCases = cases.filter(c => c.severity === 'EMERGENCY').length;
    const pendingConsults = appointments.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED').length;
    const overdueFollowUps = followUps.filter(f => f.status === 'OVERDUE').length;
    const dueTodayFollowUps = followUps.filter(f => f.status === 'DUE_TODAY').length;
    const stockAlerts = stock.filter(m => m.status !== 'NORMAL').length;
    const criticalStock = stock.filter(m => m.status === 'CRITICAL' || m.status === 'OUT_OF_STOCK');
    const lowStock = stock.filter(m => m.status === 'LOW_STOCK' || m.status === 'EXPIRING_SOON');

    // AI recommended actions (rule-based for demo)
    const recommendedActions = [];
    if (emergencyCases > 0) recommendedActions.push({ priority: 'HIGH', action: `${emergencyCases} emergency case(s) require immediate escalation to emergency medical care.`, type: 'emergency' });
    if (overdueFollowUps > 0) recommendedActions.push({ priority: 'HIGH', action: `${overdueFollowUps} chronic patient follow-up(s) are overdue. ASHA workers should contact patients immediately.`, type: 'followup' });
    if (criticalStock.length > 0) recommendedActions.push({ priority: 'HIGH', action: `Critical stock levels for: ${criticalStock.map(m => m.name).join(', ')}. Emergency resupply needed.`, type: 'stock' });
    if (urgentCases > 0) recommendedActions.push({ priority: 'MEDIUM', action: `${urgentCases} urgent case(s) pending teleconsultation. Schedule within today.`, type: 'teleconsult' });
    if (dueTodayFollowUps > 0) recommendedActions.push({ priority: 'MEDIUM', action: `${dueTodayFollowUps} patient follow-up(s) are due today.`, type: 'followup' });
    if (lowStock.length > 0) recommendedActions.push({ priority: 'LOW', action: `Low stock / expiring soon: ${lowStock.map(m => m.name).join(', ')}. Initiate reorder.`, type: 'stock' });

    res.json({
      stats: {
        totalPatients: cases.length,
        urgentCases,
        emergencyCases,
        pendingConsultations: pendingConsults,
        overdueFollowUps,
        dueTodayFollowUps,
        stockAlerts,
        criticalStockCount: criticalStock.length
      },
      recommendedActions,
      recentCases: cases.slice(0, 5),
      upcomingConsultations: appointments.slice(0, 3),
      isDemo: true
    });
  } catch (err) {
    console.error('[Dashboard Route]', err);
    res.status(500).json({ error: 'Dashboard failed', details: err.message });
  }
});

module.exports = router;
