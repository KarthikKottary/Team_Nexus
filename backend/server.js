require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes  = require('./routes/authRoutes');
const teamRoutes  = require('./routes/teamRoutes');
const alertRoutes = require('./routes/alertRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const exportRoutes = require('./routes/exportRoutes');
const githubRoutes = require('./routes/githubRoutes');

const app  = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

// ──────────────────────────────────────────────
//  Middleware
// ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ──────────────────────────────────────────────
//  Database Connection
// ──────────────────────────────────────────────
async function connectDB() {
  let uri = process.env.MONGO_URI;

  const isPlaceholder =
    !uri ||
    uri === 'your_mongodb_atlas_connection_string_here';

  if (isPlaceholder) {
    console.log('⚙️  No Atlas URI found — starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log(`✅ In-memory MongoDB running at: ${uri}`);
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected successfully');

  // No demo data seeding - real entries only
}

// ──────────────────────────────────────────────
//  Routes
// ──────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({ message: 'Hackathon Backend API is up and running!', timestamp: new Date() });
});

app.use('/api/auth',   authRoutes);
app.use('/api/teams',  teamRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/admin/export-report', exportRoutes);
app.use('/api/github', githubRoutes);

// ──────────────────────────────────────────────
//  Global Error Handler
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

// ──────────────────────────────────────────────
//  Start
// ──────────────────────────────────────────────
connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
