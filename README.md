# Go Tripping Backend

A comprehensive Node.js backend application for the Go Tripping social travel platform, built with Express.js, Socket.IO, and PostgreSQL.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with Firebase integration
- **Real-time Messaging** - Socket.IO powered chat system for communities and private messages
- **Community Management** - Create, join, and manage travel communities
- **Social Feed** - Share posts, comments, reactions, and bookmarks
- **AI-Powered Avatar Chat** - OpenAI integration for interactive travel assistant
- **Location Services** - Google Places API integration for explore functionality
- **User Progress Tracking** - Quest and achievement system
- **File Upload Support** - Image and media handling with Multer

### Technical Features
- **RESTful API** - Well-structured API endpoints with Express.js
- **Real-time Communication** - WebSocket connections via Socket.IO
- **Database ORM** - Sequelize ORM with PostgreSQL
- **Security** - Helmet.js, CORS, rate limiting, and input validation
- **Logging** - Comprehensive logging with Morgan and custom log streams
- **Process Management** - PM2 ecosystem configuration
- **Database Migrations** - Sequelize migrations and seeders

## 📋 Prerequisites

- **Node.js** >= 16.x
- **PostgreSQL** >= 12.x
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend_node
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Configure your `.env` file with the following variables:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_postgres_user
   DB_PASS=your_postgres_password
   DB_NAME=go_tripping
   DB_PORT=5432

   # JWT Configuration
   JWT_SECRET_KEY=your_jwt_secret_key_here
   JWT_REFRESH_SECRET_KEY=your_jwt_refresh_secret_key_here

   # Server Configuration
   PORT=5002
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Firebase Configuration
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----"

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo

   # Google Places API
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

   # Nominatim Configuration
   NOMINATIM_EMAIL=your_email@example.com
   NOMINATIM_USER_AGENT=GoTrippingBackend/1.0
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run migrate

   # Seed the database (optional)
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using PM2 (Recommended for Production)
```bash
pm2 start ecosystem.config.js
```

## 📚 API Documentation

### Base URL
```
http://localhost:5002/api
```

### Available Endpoints

#### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/refresh` - Refresh JWT token

#### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update current user profile

#### Communities
- `GET /api/communities` - Get all communities
- `POST /api/communities` - Create community
- `GET /api/communities/:id` - Get community by ID
- `PUT /api/communities/:id` - Update community
- `DELETE /api/communities/:id` - Delete community
- `POST /api/communities/:id/join` - Join community
- `POST /api/communities/:id/leave` - Leave community

#### Posts & Feed
- `GET /api/feed` - Get user feed
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

#### Comments & Reactions
- `GET /api/comments` - Get comments
- `POST /api/comments` - Create comment
- `POST /api/reactions` - Add reaction
- `DELETE /api/reactions/:id` - Remove reaction

#### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/:id` - Remove bookmark

#### Chat & Messaging
- `GET /api/chat/conversations` - Get user conversations
- `GET /api/chat/messages/:conversationId` - Get conversation messages
- `POST /api/chat/messages` - Send message
- `GET /api/community-chat/:communityId/messages` - Get community messages

#### Avatar Chat (AI)
- `POST /api/avatar-chat` - Chat with AI avatar
- `GET /api/avatar-chat/history` - Get chat history

#### Explore
- `GET /api/explore/places` - Search places
- `GET /api/explore/nearby` - Get nearby places

#### User Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/quest` - Update quest progress

### Health Check
- `GET /api/health` - Server health status
- `GET /api/test-db` - Database connection test

## 🔌 Socket.IO Events

### Client Events (Emit)
- `join_community` - Join a community room
- `leave_community` - Leave a community room
- `private_message` - Send private message
- `community_message` - Send community message

### Server Events (Listen)
- `joined_community` - Confirmation of joining community
- `left_community` - Confirmation of leaving community
- `private_message` - Receive private message
- `community_message` - Receive community message
- `message_sent` - Message sent confirmation
- `message_error` - Message error notification

## 🗄️ Database Schema

### Core Tables
- **Users** - User accounts and profiles
- **Communities** - Travel communities
- **Posts** - User posts and content
- **Comments** - Post comments
- **Messages** - Chat messages (private & community)
- **Reactions** - Post and comment reactions
- **Bookmarks** - Saved posts
- **Images** - File uploads metadata
- **UserProgress** - Quest and achievement tracking
- **TokenBlocklist** - JWT token management

### Relationships
- Users can join multiple Communities (many-to-many)
- Users can create Posts in Communities (one-to-many)
- Posts can have Comments and Reactions (one-to-many)
- Users can send Messages to other Users or Communities
- Users can bookmark Posts (many-to-many)

## 📁 Project Structure

```
Backend_node/
├── src/
│   ├── config/           # Database and Firebase configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Authentication and validation middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routes
│   └── index.js         # Main application entry point
├── migrations/          # Database migrations
├── seeders/            # Database seed files
├── logs/               # Application logs
├── scripts/            # Setup and utility scripts
├── .env.example        # Environment variables template
├── ecosystem.config.js # PM2 configuration
└── package.json        # Dependencies and scripts
```

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run setup` - Run initial setup script
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Undo last migration
- `npm run migrate:undo:all` - Undo all migrations
- `npm run seed` - Run database seeders
- `npm run seed:undo` - Undo database seeders

## 🚀 Deployment

### Using PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor application
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart node-backend
```

### Environment Configuration
Ensure your production environment has:
- PostgreSQL database configured
- All required environment variables set
- Firebase service account credentials
- OpenAI API key for avatar chat
- Google Places API key for explore features

### Database Migration
```bash
# Production migration
NODE_ENV=production npm run migrate
```

## 🔧 Configuration

### CORS Setup
The application supports universal CORS for development. For production, configure specific origins in the CORS middleware.

### Rate Limiting
Rate limiting is currently disabled but can be enabled by uncommenting the rate limit middleware in `src/index.js`.

### Logging
- Access logs: `logs/access.log`
- Error logs: `logs/error.log`
- Application logs: `logs/app.log`

## 🧪 Testing

### Manual API Testing
Use the included test script:
```bash
node test-endpoints.js
```

### Health Checks
- Server health: `GET /api/health`
- Database connection: `GET /api/test-db`

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Firebase Integration** - Additional authentication layer
- **Input Validation** - Express-validator for request validation
- **Helmet.js** - Security headers
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - (Optional) Request rate limiting
- **Token Blacklisting** - JWT token invalidation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the health endpoint: `/api/health`
- Review application logs in the `logs/` directory
- Test database connectivity: `/api/test-db`

## 🔗 Related Documentation

- [Avatar Chat Setup](AVATAR_CHAT_SETUP.md)
- [Cross Server Setup](CROSS_SERVER_SETUP.md)