const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database');
const { User, TokenBlocklist, Message } = require('./models');
const { verifyToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const communityRoutes = require('./routes/communityRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const reactionRoutes = require('./routes/reactionRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const profilePostRoutes = require('./routes/profilePostRoutes');
const feedRoutes = require('./routes/feedRoutes');
const exploreRoutes = require('./routes/exploreRoutes');
const communityChatRoutes = require('./routes/communityChatRoutes');
const avatarRoutes = require('./routes/avatarRoutes');
const avatarChatRoutes = require('./routes/avatarChatRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userProgressRoutes = require('./routes/userProgressRoutes');

require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

// Make Socket.IO instance available to route handlers/controllers
app.set('io', io);

// Rate limiting - DISABLED for both development and production
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: process.env.RATE_LIMIT_MAX || 10000, // limit each IP to 10000 requests per windowMs (very high for development)
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   skip: (req) => {
//     // Skip rate limiting for health checks and certain endpoints in development
//     if (process.env.NODE_ENV === 'development') {
//       return req.path === '/api/health' || req.path === '/api/test-db';
//     }
//     return false;
//   }
// });

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Rate limiting is now applied conditionally below

// Auth rate limiting - DISABLED for both development and production
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: process.env.AUTH_RATE_LIMIT_MAX || 50, // limit each IP to 50 auth requests per windowMs
//   message: {
//     error: 'Too many authentication attempts from this IP, please try again later.'
//   },
//   skip: (req) => {
//     // Skip rate limiting for health checks in development
//     if (process.env.NODE_ENV === 'development') {
//       return req.path === '/api/health' || req.path === '/api/test-db';
//     }
//     return false;
//   }
// });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Rate limiting completely disabled
console.log('🚀 Rate limiting DISABLED for all environments');

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    const [result] = await sequelize.query('SELECT current_database() as db_name, version() as db_version');
    res.json({
      message: 'Database connection successful',
      database: result[0].db_name,
      version: result[0].db_version,
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

// Routes
app.use('/api', authRoutes); // No rate limiting
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/profile', profilePostRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/explore', exploreRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/avatars', avatarRoutes); // alias for plural path
app.use('/api/avatar-chat', avatarChatRoutes);
app.use('/api/avatar/chat', avatarChatRoutes); // alias for alternate path style
app.use('/api/community-chat', communityChatRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', userProgressRoutes);
app.use('/api/user-progress', userProgressRoutes); // Add alias for user-progress

// Add profile route for user profile information
app.get('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: User,
          as: 'Following',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toJSON();
    
    // Add followers/following counts
    userData.followers_count = user.Followers ? user.Followers.length : 0;
    userData.following_count = user.Following ? user.Following.length : 0;

    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    user.updateFromDict(req.body);
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Go Tripping Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api',
      users: '/api/users',
      communities: '/api/communities',
      posts: '/api/posts',
      comments: '/api/comments',
      reactions: '/api/reactions',
      bookmarks: '/api/bookmarks',
      profile: '/api/profile',
      feed: '/api/feed',
      explore: '/api/explore',
      avatar: '/api/avatar',
      chat: '/api/chat',
      progress: '/api/progress'
    }
  });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.sub;
    
    if (!userId) {
      return next(new Error('No user ID in token'));
    }

    socket.userId = userId;
    next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Handle joining community rooms (original event)
  socket.on('join_community', async (communityId) => {
    try {
      const user = await User.findByPk(socket.userId);
      const community = await user.getCommunities_joined({
        where: { id: communityId }
      });

      if (community.length > 0) {
        socket.join(`community_${communityId}`);
        socket.emit('joined_community', { communityId });
      }
    } catch (error) {
      console.error('Error joining community:', error);
    }
  });

  // Handle joining community rooms (alias used by frontend)
  socket.on('join_community_room', async (communityId) => {
    try {
      const user = await User.findByPk(socket.userId);
      const community = await user.getCommunities_joined({ where: { id: communityId } });
      if (community.length > 0) {
        socket.join(`community_${communityId}`);
        socket.emit('joined_community', { communityId });
      } else {
        socket.emit('message_error', { error: 'Not a member of this community' });
      }
    } catch (error) {
      console.error('Error joining community (alias):', error);
    }
  });

  // Handle leaving community rooms (original event)
  socket.on('leave_community', (communityId) => {
    socket.leave(`community_${communityId}`);
    socket.emit('left_community', { communityId });
  });

  // Handle leaving rooms (alias used by frontend)
  socket.on('leave_room', (roomOrId) => {
    const communityId = typeof roomOrId === 'string' && roomOrId.startsWith('community_')
      ? roomOrId.replace('community_', '')
      : roomOrId;
    const roomName = `community_${communityId}`;
    socket.leave(roomName);
    socket.emit('left_community', { communityId });
  });

  // Handle private messages
  socket.on('private_message', async (data) => {
    console.log('Received private message:', data);
    try {
      const { receiverId, content } = data;
      
      console.log(`User ${socket.userId} sending message to ${receiverId}: ${content}`);
      
      // Save message to database
      const message = await Message.create({
        sender_id: socket.userId,
        receiver_id: receiverId,
        content,
        message_type: 'private'
      });

      const payload = {
        id: message.id,
        sender_id: socket.userId,
        receiver_id: receiverId,
        content,
        created_at: message.created_at
      };

      console.log('Emitting to receiver room:', `user_${receiverId}`);
      // Emit to receiver using both event names for compatibility
      io.to(`user_${receiverId}`).emit('private_message', payload);
      io.to(`user_${receiverId}`).emit('receive_private_message', payload);

      // Emit back to sender
      socket.emit('message_sent', payload);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending private message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  // Handle community messages
  socket.on('community_message', async (data) => {
    try {
      const { communityId, content } = data;
      
      // Check if user is member of community
      const user = await User.findByPk(socket.userId);
      const community = await user.getCommunities_joined({
        where: { id: communityId }
      });

      if (community.length === 0) {
        socket.emit('message_error', { error: 'Not a member of this community' });
        return;
      }

      // Save message to database
      const message = await Message.create({
        sender_id: socket.userId,
        community_id: communityId,
        content,
        message_type: 'community'
      });

      const payload = {
        id: message.id,
        sender_id: socket.userId,
        community_id: communityId,
        content,
        created_at: message.created_at
      };

      // Emit to all community members using both event names for compatibility
      io.to(`community_${communityId}`).emit('community_message', payload);
      io.to(`community_${communityId}`).emit('receive_community_message', payload);
    } catch (error) {
      console.error('Error sending community message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

async function startServer() {
  try {
    // Sync database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synced successfully');

    const PORT = process.env.PORT || 5002;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Go Tripping Backend Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();