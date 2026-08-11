/**
 * MEDICINE STOCK AGENT
 * Monitors inventory, detects low/critical/expiring medicines, and recommends actions.
 */

const { callGranite } = require('../services/granite');
const { getMedicineStock, updateStock } = require('../services/store');

const STATUS_LABELS = {
  NORMAL: 'Normal',
  LOW_STOCK: 'Low Stock',
  CRITICAL: 'Critical Stock',
  EXPIRING_SOON: 'Expiring Soon',
  OUT_OF_STOCK: 'Out of Stock'
};

function getDemoRecommendation(med) {
  switch (med.status) {
    case 'CRITICAL':
    case 'OUT_OF_STOCK':
      return `URGENT: Immediately request emergency resupply of ${med.name} from District Medical Store. Current quantity (${med.quantity}) is critically below minimum threshold (${med.minThreshold}).`;
    case 'LOW_STOCK':
      return `Place reorder for ${med.name}. Stock at ${med.quantity} units is below minimum threshold of ${med.minThreshold}. Check if adjacent PHC has surplus stock for temporary transfer.`;
    case 'EXPIRING_SOON':
      return `${med.name} expires in ${med.daysToExpiry} days (${med.expiryDate}). Prioritise use from this batch. Verify stock and notify District Medical Officer if quantity will not be utilised before expiry.`;
    default:
      return `Stock levels for ${med.name} are adequate. Continue routine monitoring.`;
  }
}

async function runStockAgent() {
  const stock = getMedicineStock();
  const alerts = stock.filter(m => m.status !== 'NORMAL');

  // Try to get AI-enhanced summary from Granite
  let aiSummary = null;
  if (alerts.length > 0) {
    const alertList = alerts.map(m => `${m.name} at ${m.location}: ${m.status} (qty: ${m.quantity}/${m.minThreshold})`).join('\n');
    const resp = await callGranite(
      'You are a rural PHC medicine stock coordinator. Provide a brief 2-3 sentence summary of the stock situation and top priority action. Be concise.',
      `Current medicine alerts:\n${alertList}`
    );
    if (resp) aiSummary = resp.trim();
  }

  const stockWithRecommendations = stock.map(m => ({
    ...m,
    statusLabel: STATUS_LABELS[m.status] || m.status,
    recommendation: getDemoRecommendation(m)
  }));

  return {
    stock: stockWithRecommendations,
    alerts: alerts.map(m => ({ ...m, statusLabel: STATUS_LABELS[m.status] || m.status, recommendation: getDemoRecommendation(m) })),
    summary: {
      total: stock.length,
      critical: stock.filter(m => m.status === 'CRITICAL' || m.status === 'OUT_OF_STOCK').length,
      lowStock: stock.filter(m => m.status === 'LOW_STOCK').length,
      expiringSoon: stock.filter(m => m.status === 'EXPIRING_SOON').length,
      normal: stock.filter(m => m.status === 'NORMAL').length,
      aiSummary: aiSummary || (alerts.length > 0
        ? `${alerts.length} medicine alert(s) detected. Immediate action required for critical and low-stock items. Verify expiring stock and initiate reorder process with District Medical Store.`
        : 'All medicine stock levels are within acceptable ranges. Continue routine monitoring.')
    },
    isDemo: true
  };
}

module.exports = { runStockAgent, updateStock };
