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
    uri === 'your_mongodb_atlas_connection_string_here' ||
    uri.startsWith('mongodb://localhost');

  if (isPlaceholder) {
    console.log('⚙️  No Atlas URI found — starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log(`✅ In-memory MongoDB running at: ${uri}`);
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected successfully');

  // Seed demo data on first run
  await seedDemoData();
}

// ──────────────────────────────────────────────
//  Demo Seed Data
// ──────────────────────────────────────────────
async function seedDemoData() {
  const User  = require('./models/User');
  const Team  = require('./models/Team');
  const Alert = require('./models/Alert');

  const userCount = await User.countDocuments();
  if (userCount > 0) return; // Already seeded

  console.log('🌱 Seeding demo data...');

  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@hackathon.dev',
    password: 'admin123',
    role: 'admin',
  });

  // Create participant user
  const participant = await User.create({
    name: 'Alice Johnson',
    email: 'alice@hackathon.dev',
    password: 'alice123',
    role: 'participant',
  });

  // Create teams
  const teams = await Team.insertMany([
    {
      name: 'NeuralKnights',
      repo: 'github.com/neuralkights/hack',
      status: 'active',
      lastCommitAt: new Date(Date.now() - 2 * 60 * 1000),
      members: [
        { name: 'Alice Johnson', role: 'Lead' },
        { name: 'Bob Smith',     role: 'Frontend' },
        { name: 'Charlie Brown', role: 'Backend' },
      ],
      recentCommits: [
        { message: 'fix: auth token refresh', author: 'Alice Johnson', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
        { message: 'feat: add WebSocket support', author: 'Bob Smith',  timestamp: new Date(Date.now() - 30 * 60 * 1000) },
      ],
      owner: participant._id,
    },
    {
      name: 'CodeCrafters',
      repo: 'github.com/codecrafters/app',
      status: 'idle',
      lastCommitAt: new Date(Date.now() - 65 * 60 * 1000),
      members: [
        { name: 'Diana Prince', role: 'Lead' },
        { name: 'Ethan Hunt',   role: 'ML Engineer' },
      ],
      recentCommits: [
        { message: 'chore: update dependencies', author: 'Diana Prince', timestamp: new Date(Date.now() - 65 * 60 * 1000) },
      ],
    },
    {
      name: 'SyntaxError',
      repo: 'github.com/syntaxerror/bot',
      status: 'inactive',
      lastCommitAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      members: [
        { name: 'Frank Castle', role: 'Lead' },
        { name: 'Grace Hopper', role: 'DevOps' },
      ],
      recentCommits: [
        { message: 'init: project scaffold', author: 'Grace Hopper', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      ],
    },
  ]);

  // Create sample alerts
  await Alert.insertMany([
    {
      type: 'Medical',
      location: 'Section B, Table 12',
      description: 'Participant reported dizziness',
      team: teams[0]._id,
      triggeredBy: participant._id,
      active: true,
    },
    {
      type: 'Technical',
      location: 'Server Room',
      description: 'Network switch overheating',
      active: false,
      resolvedAt: new Date(),
    },
  ]);

  console.log('✅ Demo data seeded!');
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('  🔑 DEMO LOGIN CREDENTIALS');
  console.log('═══════════════════════════════════════');
  console.log('  Admin:       admin@hackathon.dev  / admin123');
  console.log('  Participant: alice@hackathon.dev  / alice123');
  console.log('═══════════════════════════════════════');
  console.log('');
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
