require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const swapRoutes = require('./routes/swaps');

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

// Connect DB
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapRoutes);

app.get('/', (req, res) => res.send({ ok: true, name: 'SlotSwapper API' }));

// uptime monitors (returns 200 when app + DB connected)
app.get('/health', async (req, res) => {
	try {
		const state = mongoose.connection.readyState;
		const dbConnected = state === 1;
		const status = dbConnected ? 'ok' : 'degraded';
		return res.status(dbConnected ? 200 : 503).json({ status, dbState: state, timestamp: new Date().toISOString() });
	} catch (err) {
		return res.status(500).json({ status: 'error', error: err.message });
	}
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
