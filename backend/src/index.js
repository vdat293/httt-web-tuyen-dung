require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');
const path = require('path');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const User = require('./models/User');

// Route files
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const interviewRoutes = require('./routes/interviews');
const reportRoutes = require('./routes/reports');
const savedJobRoutes = require('./routes/savedJobs');
const profileRoutes = require('./routes/profile');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const startCronJobs = require('./cron/interviewReminder');

const app = express();
const server = http.createServer(app);

// ── Socket.io setup ────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware: attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io authentication & room joining
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      // Allow guest connections
      socket.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      socket.user = null;
      return next();
    }

    socket.user = user;
    next();
  } catch (err) {
    // On token error, treat as guest or fail? Let's treat as guest for stability
    socket.user = null;
    next();
  }
});

io.on('connection', (socket) => {
  if (socket.user) {
    const userId = socket.user._id.toString();
    console.log(`🔌 [Socket] User connected: ${userId}`);
    socket.join(userId);

    if (socket.user.role === 'admin') {
      socket.join('admin_room');
    }
  } else {
    console.log('🔌 [Socket] Guest connected');
  }

  // Job-specific rooms (for real-time status updates)
  socket.on('join_job', (jobId) => {
    if (jobId) {
      socket.join(`job_${jobId}`);
      console.log(`🔌 [Socket] Socket joined job room: job_${jobId}`);
    }
  });

  socket.on('leave_job', (jobId) => {
    if (jobId) {
      socket.leave(`job_${jobId}`);
      console.log(`🔌 [Socket] Socket left job room: job_${jobId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 [Socket] Disconnected: ${socket.user?._id || 'guest'}`);
  });
});

// Expose io globally so controllers can use it via req.io
app.set('io', io);

// ── Connect to database ─────────────────────────────────────────────
connectDB();

// Khởi chạy các cron jobs (gửi email tự động...)
startCronJobs();

// ── Security middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// ── Body parsers ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Serve upload files ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Mount REST routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Recruitment API is running' });
});

// ── Error handlers ───────────────────────────────────────────────────
app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Start server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server + Socket.io running on port ${PORT}`);
});
