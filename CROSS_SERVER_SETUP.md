# Cross-Server Socket.IO Setup Guide

## Overview
When running frontend and backend on different servers, Socket.IO requires specific configuration to handle cross-origin communication.

## Backend Configuration

### 1. CORS Settings (Already Configured)
The backend is configured with:
```javascript
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});
```

### 2. Environment Variables
Add to your `.env` file:
```bash
# For development
CORS_ORIGIN=http://localhost:3000

# For production (replace with your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.com

# Backend server URL (for frontend to connect to)
BACKEND_URL=http://localhost:5002
```

## Frontend Configuration

### 1. Update Socket.IO Connection
In your frontend `chatService.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

class ChatService {
  private socket: Socket | null = null;
  private backendUrl: string;

  constructor() {
    // Use environment variable or default to localhost
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';
  }

  initializeSocket(token: string): Socket {
    this.socket = io(this.backendUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to backend Socket.IO server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    return this.socket;
  }
}
```

### 2. Frontend Environment Variables
Create `.env` file in your frontend project:
```bash
# Development
REACT_APP_BACKEND_URL=http://localhost:5002

# Production (replace with your backend domain)
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

## Deployment Configuration

### 1. Backend Server (Port 5002)
- Ensure port 5002 is open in firewall
- Configure CORS_ORIGIN to include frontend domain
- Use HTTPS in production

### 2. Frontend Server (Port 3000)
- Configure REACT_APP_BACKEND_URL to point to backend
- Ensure CORS allows backend domain

## Testing Cross-Server Communication

### 1. Local Testing
```bash
# Backend (Terminal 1)
cd Backend_node
npm start  # Runs on port 5002

# Frontend (Terminal 2)
cd frontend
npm start  # Runs on port 3000
```

### 2. Production Testing
```bash
# Test Socket.IO connection
curl -X GET "https://your-backend-domain.com/api/health"

# Test CORS
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS "https://your-backend-domain.com/api/chat/send"
```

## Common Issues & Solutions

### 1. CORS Errors
**Problem**: `Access to fetch at 'http://localhost:5002' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution**: 
- Ensure `CORS_ORIGIN` includes frontend domain
- Check that `credentials: true` is set
- Verify backend is sending proper CORS headers

### 2. Socket.IO Connection Fails
**Problem**: Socket.IO can't connect to backend

**Solution**:
- Verify backend URL is correct
- Check firewall settings
- Ensure backend is running on correct port
- Test with `curl` or browser dev tools

### 3. Authentication Issues
**Problem**: JWT tokens not working across domains

**Solution**:
- Ensure `Authorization` header is included in CORS allowedHeaders
- Verify token is being sent in Socket.IO auth
- Check token expiration and validity

## Production Checklist

- [ ] Backend CORS_ORIGIN includes frontend domain
- [ ] Frontend REACT_APP_BACKEND_URL points to backend
- [ ] Both servers use HTTPS in production
- [ ] Firewall allows communication between servers
- [ ] SSL certificates are valid
- [ ] Environment variables are set correctly
- [ ] Socket.IO connection is established
- [ ] Real-time features work across servers

## Monitoring

### Backend Logs
```bash
# Check Socket.IO connections
pm2 logs node-backend

# Monitor CORS requests
tail -f /var/log/nginx/access.log
```

### Frontend Debugging
```javascript
// Add to your Socket.IO connection
socket.on('connect', () => {
  console.log('Connected to backend:', socket.connected);
  console.log('Backend URL:', process.env.REACT_APP_BACKEND_URL);
});
```

## Security Considerations

1. **Use HTTPS in production** for both frontend and backend
2. **Validate CORS origins** - don't use `*` in production
3. **Implement proper authentication** for Socket.IO connections
4. **Rate limit Socket.IO events** to prevent abuse
5. **Monitor for suspicious connections**

## Troubleshooting Commands

```bash
# Test backend health
curl http://localhost:5002/api/health

# Test Socket.IO endpoint
curl http://localhost:5002/socket.io/

# Check CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:5002/api/health

# Monitor network connections
netstat -tulpn | grep :5002
```
