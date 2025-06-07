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

- `GET /`: Welcome message 