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
const communityRoutes = require('./routes/communityRoutes');
const communityChatRoutes = require('./routes/communityChatRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const avatarChatRoutes = require('./routes/avatarChatRoutes');
const userProgressRoutes = require('./routes/userProgressRoutes');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    const [result] = await sequelize.query('SELECT current_database() as db_name');
    res.json({
      message: 'Database connection successful',
      database: result[0].db_name,
      env: {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test POST endpoint
app.post('/api/test-post', (req, res) => {
  console.log('POST test endpoint hit:', req.body);
  res.json({ message: 'POST request successful', data: req.body });
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/community-chat', communityChatRoutes);
app.use('/api/avatars', avatarRoutes);
app.use('/api/avatar-chat', avatarChatRoutes);
app.use('/api/user-progress', userProgressRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Go Tripping Chat API' });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Extract user ID from sub field (JWT identity)
    const userId = decoded.sub;
    
    if (!userId) {
      return next(new Error('No user ID in token'));
    }
    
    // Convert string ID to number for database
    const numericUserId = parseInt(userId, 10);
    
    socket.user = { ...decoded, id: numericUserId };
    next();
  } catch (error) {
    return next(new Error('Authentication error'));
  }
});

// Make io available to routes
app.set('io', io);
console.log('Socket.IO instance set on app:', !!io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.user.id);

  // Join a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Join a community chat room
  socket.on('join_community_room', (communityId) => {
    const roomId = `community_${communityId}`;
    socket.join(roomId);
    console.log(`User ${socket.id} joined community room: ${roomId}`);
    console.log(`Total users in room ${roomId}:`, io.sockets.adapter.rooms.get(roomId)?.size || 0);
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const { roomId, receiverId, content } = data;
      const senderId = socket.user.id;
      
      if (!senderId) {
        return;
      }
      
      // Don't save to database here - HTTP API already saves it
      // Just broadcast the message for real-time delivery
      const messageData = {
        id: Date.now().toString(), // Temporary ID for real-time
        sender_id: senderId,
        receiver_id: receiverId,
        content: content,
        is_read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Broadcast message to room
      io.to(roomId).emit('receive_message', messageData);
    } catch (error) {
      console.error('Error broadcasting message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5002;

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Initialize database
    const initialized = await initializeDatabase();
    if (!initialized) {
      console.warn('Database initialization completed with warnings');
    }

    // Sync models to create tables if they do not exist
    await sequelize.sync();

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();