# Avatar Chat Setup Instructions

## Overview
This feature integrates ChatGPT API to enable real conversations with historical figures and thought leaders through your avatar chat system.

## Prerequisites
1. OpenAI API key (get one from https://platform.openai.com/)
2. Node.js backend running
3. Frontend React application

## Setup Steps

### 1. Environment Configuration
Copy the environment template and add your OpenAI API key:

```bash
cp env.example .env
```

Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your_actual_openai_api_key_here
```

### 2. Install Dependencies
```bash
npm install openai
```

### 3. Start the Backend Server
```bash
npm run dev
```

### 4. Test the API Endpoints

#### Test available characters:
```bash
curl http://localhost:3001/api/avatar-chat/characters
```

#### Test character chat:
```bash
curl -X POST http://localhost:3001/api/avatar-chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "characterName": "Elon Musk",
    "message": "What do you think about AI?",
    "conversationHistory": []
  }'
```

## Available Characters

The system includes the following characters with unique personalities:

- **Elon Musk** - Tech entrepreneur, visionary, direct communicator
- **Joe Rogan** - Podcast host, open-minded, conversational
- **Jordan Peterson** - Psychologist, philosophical, focused on meaning
- **Marcus Aurelius** - Stoic philosopher, wise, classical
- **Albert Einstein** - Physicist, thoughtful, scientific
- **Steve Jobs** - Entrepreneur, visionary, design-focused

## API Endpoints

### POST /api/avatar-chat/send
Send a message to a character and get their response.

**Request Body:**
```json
{
  "characterName": "Elon Musk",
  "message": "What do you think about AI?",
  "conversationHistory": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there! How can I help you today?"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "characterName": "Elon Musk",
    "userMessage": "What do you think about AI?",
    "characterResponse": "AI is both the greatest opportunity and threat to humanity...",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "userId": "anonymous"
  }
}
```

### GET /api/avatar-chat/characters
Get list of available characters.

### GET /api/avatar-chat/characters/:characterName
Get detailed information about a specific character.

## Frontend Integration

The frontend has been updated to use the real API instead of mock responses. The `AvatarChat` component now:

1. Calls the real ChatGPT API through the backend
2. Maintains conversation history for context
3. Shows proper loading states and error handling
4. Displays character-specific responses

## Configuration Options

You can customize the behavior by modifying these environment variables:

- `OPENAI_MODEL` - Which GPT model to use (default: gpt-3.5-turbo)
- `OPENAI_MAX_TOKENS` - Maximum response length (default: 150)
- `OPENAI_TEMPERATURE` - Response creativity (default: 0.7)
- `MAX_CONVERSATION_LENGTH` - How many messages to keep in context
- `CONTEXT_WINDOW` - How many recent exchanges to include

## Troubleshooting

### Common Issues:

1. **API Key Error**: Make sure your OpenAI API key is valid and has credits
2. **Character Not Found**: Verify the character name matches exactly
3. **Rate Limiting**: OpenAI has rate limits, consider implementing caching
4. **Context Length**: If responses are cut off, increase `OPENAI_MAX_TOKENS`

### Error Handling:
The system includes comprehensive error handling for:
- Invalid API keys
- Network issues
- Character not found
- OpenAI API errors

## Cost Considerations

- Each API call costs money based on token usage
- Consider implementing caching for common responses
- Monitor usage to stay within budget
- Use appropriate model (gpt-3.5-turbo is cheaper than gpt-4)

## Security Notes

- Never expose your OpenAI API key in frontend code
- Always route API calls through your backend
- Implement rate limiting to prevent abuse
- Consider user authentication for chat access 