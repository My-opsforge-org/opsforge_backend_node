const express = require('express');
const router = express.Router();
const avatarChatController = require('../controllers/avatarChatController');

// Send message to character
router.post('/send', avatarChatController.sendMessageToCharacter);

// Get available characters
router.get('/characters', avatarChatController.getAvailableCharacters);

// Get character info
router.get('/characters/:characterName', avatarChatController.getCharacterInfo);

// Test API key
router.get('/test-api-key', avatarChatController.testApiKey);

module.exports = router; 