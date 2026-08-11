const express = require('express');
const router = express.Router();
const { getTeleconsultOptions, bookAppointment, getAppointments } = require('../agents/teleconsultAgent');

// GET /api/teleconsult/options/:caseId — get doctor + slot options for a case
router.get('/options/:caseId', async (req, res) => {
  try {
    const options = await getTeleconsultOptions(req.params.caseId);
    if (!options) return res.status(404).json({ error: 'Case not found' });
    res.json(options);
  } catch (err) {
    console.error('[Teleconsult Route]', err);
    res.status(500).json({ error: 'Failed to get teleconsult options', details: err.message });
  }
});

// POST /api/teleconsult/book — book an appointment
router.post('/book', async (req, res) => {
  try {
    const { caseId, doctorName, slotDatetime } = req.body;
    if (!caseId || !doctorName || !slotDatetime) {
      return res.status(400).json({ error: 'caseId, doctorName, and slotDatetime are required.' });
    }
    const appt = await bookAppointment(caseId, doctorName, slotDatetime);
    res.json(appt);
  } catch (err) {
    console.error('[Teleconsult Book]', err);
    res.status(500).json({ error: 'Booking failed', details: err.message });
  }
});

// GET /api/teleconsult/appointments — list all appointments
router.get('/appointments', (req, res) => {
  res.json(getAppointments());
});

module.exports = router;
