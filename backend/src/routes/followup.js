const express = require('express');
const router = express.Router();
const { runFollowUpAgent } = require('../agents/followUpAgent');
const { updateFollowUpStatus } = require('../services/store');

// GET /api/followup — get all follow-ups with status and recommendations
router.get('/', async (req, res) => {
  try {
    const result = await runFollowUpAgent();
    res.json(result);
  } catch (err) {
    console.error('[FollowUp Route]', err);
    res.status(500).json({ error: 'Follow-up agent failed', details: err.message });
  }
});

// PATCH /api/followup/:id — mark follow-up as completed and set next date
router.patch('/:id', (req, res) => {
  try {
    const { status, nextFollowUp } = req.body;
    updateFollowUpStatus(req.params.id, status || 'COMPLETED', nextFollowUp);
    res.json({ success: true, message: 'Follow-up updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update follow-up', details: err.message });
  }
});

module.exports = router;
