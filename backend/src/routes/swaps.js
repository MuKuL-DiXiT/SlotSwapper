const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createSwapRequest, getIncomingAndOutgoing, respondToSwap } = require('../controllers/swapController');

router.post('/swap-request', auth, createSwapRequest);
router.get('/swap-requests', auth, getIncomingAndOutgoing);
router.post('/swap-response/:requestId', auth, respondToSwap);

module.exports = router;
