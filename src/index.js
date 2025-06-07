const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database');
const initializeDatabase = require('./config/initDb');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Go Tripping Backend API' });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.user.id);

  // Join a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const { roomId, receiverId, content } = data;
      const senderId = socket.user.id;
      
      // Save message to database
      const message = await Message.create({
        sender_id: senderId,
        receiver_id: receiverId,
        content
      });

      // Broadcast message to room
      io.to(roomId).emit('receive_message', message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Start server immediately
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize database in the background
sequelize.authenticate()
  .then(async () => {
    console.log('Database connection established successfully.');
    const initialized = await initializeDatabase();
    if (!initialized) {
      console.warn('Database initialization completed with warnings');
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });