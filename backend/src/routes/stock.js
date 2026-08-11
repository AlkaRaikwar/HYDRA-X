const express = require('express');
const router = express.Router();
const { runStockAgent } = require('../agents/stockAgent');
const { updateStock } = require('../services/store');

// GET /api/stock — get full stock report with alerts and recommendations
router.get('/', async (req, res) => {
  try {
    const result = await runStockAgent();
    res.json(result);
  } catch (err) {
    console.error('[Stock Route]', err);
    res.status(500).json({ error: 'Stock agent failed', details: err.message });
  }
});

// PATCH /api/stock/:id — update quantity (for demo restocking)
router.patch('/:id', (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({ error: 'quantity is required and must be a number.' });
    }
    updateStock(req.params.id, parseInt(quantity));
    res.json({ success: true, message: 'Stock updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock', details: err.message });
  }
});

module.exports = router;
