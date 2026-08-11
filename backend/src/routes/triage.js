const express = require('express');
const router = express.Router();
const { runTriageAgent } = require('../agents/triageAgent');

// POST /api/triage — main triage + severity classification workflow
router.post('/', async (req, res) => {
  try {
    const { name, age, gender, village, symptoms, duration, existingConditions, currentMedicines, language } = req.body;
    if (!symptoms || symptoms.trim().length < 3) {
      return res.status(400).json({ error: 'Symptoms are required (minimum 3 characters).' });
    }
    const result = await runTriageAgent({ name, age, gender, village, symptoms, duration, existingConditions, currentMedicines, language });
    res.json(result);
  } catch (err) {
    console.error('[Triage Route]', err);
    res.status(500).json({ error: 'Triage processing failed', details: err.message });
  }
});

// GET /api/triage/cases — list all triage cases
router.get('/cases', (req, res) => {
  const { getPatientCases } = require('../services/store');
  res.json(getPatientCases());
});

// GET /api/triage/cases/:id — get single case
router.get('/cases/:id', (req, res) => {
  const { getPatientCase } = require('../services/store');
  const c = getPatientCase(req.params.id);
  if (!c) return res.status(404).json({ error: 'Case not found' });
  res.json(c);
});

module.exports = router;
