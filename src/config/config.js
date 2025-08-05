require('dotenv').config();

module.exports = {
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'go_tripping',
    dialect: process.env.DB_DIALECT || 'postgres'
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 150,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
  },
  
  // Avatar chat configuration
  avatarChat: {
    maxConversationLength: parseInt(process.env.MAX_CONVERSATION_LENGTH) || 10,
    contextWindow: parseInt(process.env.CONTEXT_WINDOW) || 5
  }
}; 