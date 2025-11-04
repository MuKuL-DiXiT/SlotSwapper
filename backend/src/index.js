require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const swapRoutes = require('./routes/swaps');

const app = express();
// CORS options to avoid cors issues
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000';
const corsOptions = {
	origin: FRONTEND_ORIGIN,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
	credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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

const http = require('http');
const { Server } = require('socket.io');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
initSocket(io);

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
