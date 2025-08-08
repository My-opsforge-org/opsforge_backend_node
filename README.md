# Go Tripping Backend (Node.js)

A modern, scalable backend API for the Go Tripping application built with Node.js, Express, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with token blacklisting
- **Real-time Communication**: Socket.IO for live chat and notifications
- **Social Features**: Posts, comments, reactions, bookmarks, and communities
- **Exploration**: Location-based place discovery and geocoding
- **AI Integration**: OpenAI-powered avatar chat system
- **Progress Tracking**: User progress and gamification system
- **File Upload**: Image upload and management
- **Rate Limiting**: Built-in rate limiting for API protection
- **Security**: Helmet.js for security headers and CORS protection

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend_node
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```
   This will:
   - Create a `.env` file from the template
   - Install dependencies
   - Test database connection

3. **Configure environment variables**
   Edit the `.env` file with your actual configuration:
   ```bash
   # Database Configuration
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=go_tripping
   
   # Server Configuration
   PORT=5002
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET_KEY=your-secret-key
   JWT_EXPIRES_IN=24h
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Google Places API
   GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏃‍♂️ Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run setup` - Run the setup script
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with sample data

## 📊 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Communities
- `GET /api/communities` - Get all communities
- `POST /api/communities` - Create community
- `GET /api/communities/:id` - Get community by ID
- `PUT /api/communities/:id` - Update community
- `DELETE /api/communities/:id` - Delete community

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create comment
- `GET /api/comments/:id` - Get comment by ID
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Explore
- `GET /api/explore/geocode` - Geocode address to coordinates
- `GET /api/explore/places` - Get nearby places

### Avatar Chat
- `POST /api/avatar/chat` - Chat with AI avatar

### Progress
- `GET /api/progress` - Get user progress
- `PUT /api/progress` - Update user progress

## 🔌 Socket.IO Events

### Client to Server
- `join_community` - Join a community room
- `leave_community` - Leave a community room
- `private_message` - Send private message
- `community_message` - Send community message

### Server to Client
- `joined_community` - Confirmation of joining community
- `left_community` - Confirmation of leaving community
- `private_message` - Receive private message
- `community_message` - Receive community message
- `message_sent` - Confirmation of message sent
- `message_error` - Message error

## 🗄️ Database Schema

The application uses Sequelize ORM with the following main models:

- **User**: User accounts and profiles
- **Community**: User communities
- **Post**: User posts and content
- **Comment**: Post comments
- **Reaction**: Post reactions (likes, etc.)
- **Bookmark**: User bookmarks
- **Message**: Chat messages
- **UserProgress**: User progress tracking
- **TokenBlocklist**: Invalidated JWT tokens

## 🔒 Security Features

- JWT authentication with token blacklisting
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- SQL injection protection (Sequelize)

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🚀 Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production database URL
3. Set up proper CORS origins
4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5002 |
| `NODE_ENV` | Environment | development |
| `POSTGRES_HOST` | Database host | localhost |
| `POSTGRES_PORT` | Database port | 5432 |
| `POSTGRES_USER` | Database user | postgres |
| `POSTGRES_PASSWORD` | Database password | - |
| `POSTGRES_DB` | Database name | go_tripping |
| `JWT_SECRET_KEY` | JWT secret | - |
| `JWT_EXPIRES_IN` | JWT expiration | 24h |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `GOOGLE_PLACES_API_KEY` | Google Places API key | - |
| `CORS_ORIGIN` | CORS origin | * |
| `RATE_LIMIT_MAX` | Rate limit max requests | 100 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 