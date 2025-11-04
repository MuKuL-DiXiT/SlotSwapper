const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createEvent, getMyEvents, updateEvent, deleteEvent, getSwappableSlots } = require('../controllers/eventController');

router.post('/', auth, createEvent);
router.get('/mine', auth, getMyEvents);
router.put('/:id', auth, updateEvent);
router.delete('/:id', auth, deleteEvent);
router.get('/swappable', auth, getSwappableSlots);

module.exports = router;
