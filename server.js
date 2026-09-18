const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const { startRealtimeTelemetry } = require('./services/realtimeTelemetryService');
const { getFirebaseClientConfig, isFirebaseConfigured } = require('./config/firebaseConfig');

// Route Imports
const stationRoutes = require('./routes/stationRoutes');
const demandRoutes = require('./routes/demandRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const systemRoutes = require('./routes/systemRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const server = http.createServer(app);

const frontendOrigin = process.env.FRONTEND_ORIGIN || `http://localhost:${process.env.PORT || '5500'}`;
const isAllowedFrontendOrigin = (origin, callback) => {
  const allowed = !origin
    || origin === 'null'
    || origin === frontendOrigin
    || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  callback(null, allowed);
};

// Allow the configured frontend origin for optional separate frontend hosting.
const io = new Server(server, {
  cors: {
    origin: isAllowedFrontendOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({ origin: isAllowedFrontendOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.IO instance to all incoming Express requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// REST API Endpoints
app.use('/api/stations', stationRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/config/firebase', (req, res) => {
  const config = getFirebaseClientConfig();
  res.json({ configured: isFirebaseConfigured(config), config });
});

// Keep unknown API requests JSON so a frontend never receives an HTML 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Serve Static Frontend Files from project root
app.use(express.static(path.join(__dirname)));

// Avoid a noisy 404 when browsers request the conventional site icon.
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Root fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] 🔌 Client connected: ${socket.id}`);

  // Send immediate initial sync
  socket.emit('system:ready', {
    status: 'connected',
    db: db.getDbStatus(),
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] 🔌 Client disconnected: ${socket.id}`);
  });
});

// Server Initialization
const PORT = parseInt(process.env.PORT || '5500', 10);

async function startServer() {
  try {
    // 1. Initialize Database Schema & Seed Data
    await db.initializeDatabase();

    // 2. Start Real-time Grid & Sensor Telemetry Broadcaster
    const intervalMs = parseInt(process.env.TELEMETRY_INTERVAL_MS || '3500', 10);
    startRealtimeTelemetry(io, intervalMs);

    // 3. Listen for connections
    server.listen(PORT, () => {
      console.log('====================================================');
      console.log(`⚡ AI EV CHARGING DEMAND PREDICTION SERVER RUNNING`);
      console.log(`🚀 Access Dashboard at: http://localhost:${PORT}`);
      console.log(`📡 Real-time WebSockets: Active on port ${PORT}`);
      console.log(`🗄️ Database: ${db.getDbStatus().engine} (${db.getDbStatus().database})`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('[Server Start Error]', err);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };
