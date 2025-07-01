# Go Tripping Backend

This is the backend server for the Go Tripping application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

3. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm test`: Run tests

## Project Structure

```
src/
  ├── index.js          # Main application file
  ├── routes/           # API routes
  ├── controllers/      # Route controllers
  ├── models/          # Database models
  ├── middleware/      # Custom middleware
  └── config/          # Configuration files
```

## API Endpoints

### Community Chat Endpoints

#### Get Community Chat History
- **GET** `/api/community-chat/:communityId/messages`
- **Auth:** Required (Bearer Token)
- **Query Params:** `limit` (optional, default 50), `before` (optional, ISO date string)
- **Response:**
```json
[
  {
    "id": 1,
    "sender_id": 2,
    "community_id": 3,
    "content": "Hello!",
    "createdAt": "2024-06-20T12:00:00.000Z",
    "is_read": false,
    "sender": { "id": 2, "name": "Alice", "avatarUrl": "..." }
  }
]
```

#### Send a Message to a Community
- **POST** `/api/community-chat/message`
- **Auth:** Required
- **Payload:**
```json
{
  "communityId": 3,
  "content": "Hello, community!"
}
```
- **Response:**
```json
{
  "id": 10,
  "sender_id": 2,
  "community_id": 3,
  "content": "Hello, community!",
  "createdAt": "2024-06-20T12:01:00.000Z",
  "is_read": false
}
```

#### Get Unread Message Count (Community)
- **GET** `/api/community-chat/:communityId/unread-count/:userId`
- **Auth:** Required
- **Response:**
```json
{ "unreadCount": 5 }
```

#### Mark All Messages as Read (Community)
- **POST** `/api/community-chat/:communityId/mark-read`
- **Auth:** Required
- **Response:**
```json
{ "message": "Community messages marked as read", "updatedCount": 10 }
```

#### Delete a Community Message
- **DELETE** `/api/community-chat/message/:messageId`
- **Auth:** Required
- **Response:**
```json
{ "message": "Message deleted successfully" }
```

---

### Direct Chat Endpoints

#### Get Chat History Between Two Users
- **GET** `/api/chat/history/:userId/:otherUserId`
- **Auth:** Required
- **Query Params:** `limit` (optional, default 50), `before` (optional, ISO date string)
- **Response:**
```json
[
  {
    "id": 1,
    "sender_id": 2,
    "receiver_id": 3,
    "content": "Hey!",
    "createdAt": "2024-06-20T12:00:00.000Z",
    "is_read": true
  }
]
```

#### Mark Messages as Read (Direct Chat)
- **PUT** `/api/chat/read/:userId/:otherUserId`
- **Auth:** Required
- **Response:**
```json
{ "message": "Messages marked as read", "updatedCount": 5 }
```

#### Send a New Message (Direct Chat)
- **POST** `/api/chat/send`
- **Auth:** Required
- **Payload:**
```json
{
  "receiverId": 3,
  "content": "Hello!"
}
```
- **Response:**
```json
{
  "id": 12,
  "sender_id": 2,
  "receiver_id": 3,
  "content": "Hello!",
  "createdAt": "2024-06-20T12:05:00.000Z",
  "is_read": false
}
```

#### Get Unread Message Count (Direct Chat)
- **GET** `/api/chat/unread/:userId`
- **Auth:** Required
- **Response:**
```json
{ "unreadCount": 3 }
```

#### Delete a Message (Direct Chat)
- **DELETE** `/api/chat/message/:messageId`
- **Auth:** Required
- **Response:**
```json
{ "message": "Message deleted successfully" }
```

---

### User Endpoints

#### Get All Users
- **GET** `/api/users/`
- **Auth:** Required
- **Response:**
```json
[
  {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "avatarUrl": null,
    "bio": null,
    "age": 25,
    "gender": "female",
    "sun_sign": "Gemini",
    "interests": ["travel", "music"],
    "location": { "lat": 12.34, "lng": 56.78 },
    "createdAt": "2024-06-20T11:00:00.000Z",
    "updatedAt": "2024-06-20T11:00:00.000Z",
    "followers_count": 0,
    "following_count": 0
  }
]
``` 