const { sequelize } = require('../config/database');
const Message = require('../models/Message');
const { Op } = require('sequelize');
const User = require('../models/User');

// Get chat history between two users
const getChatHistory = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const { limit = 50, before } = req.query; // Add pagination

    const whereClause = {
      [Op.or]: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ]
    };

    // If 'before' timestamp is provided, get messages before that time
    if (before) {
      whereClause.createdAt = {
        [Op.lt]: new Date(before)
      };
    }

    const messages = await Message.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']], // Get newest messages first
      limit: parseInt(limit),
    });

    // Mark unread messages as read
    await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: otherUserId,
          receiver_id: userId,
          is_read: false
        }
      }
    );

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history' });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    
    const [updatedCount] = await Message.update(
      { is_read: true },
      {
        where: {
          sender_id: otherUserId,
          receiver_id: userId,
          is_read: false
        }
      }
    );

    res.json({ 
      message: 'Messages marked as read',
      updatedCount 
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const count = await Message.count({
      where: {
        receiver_id: userId,
        is_read: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({
        message: 'Message not found',
        code: 'MESSAGE_NOT_FOUND'
      });
    }

    if (message.sender_id !== userId) {
      return res.status(403).json({
        message: 'Not authorized to delete this message',
        code: 'UNAUTHORIZED'
      });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message' });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    // Get user ID from JWT token
    const senderId = req.user.id;
    
    // console.log('Sending message:', { senderId, receiverId, content, user: req.user });

    if (!content || !receiverId) {
      return res.status(400).json({
        message: 'Content and receiverId are required',
        code: 'INVALID_REQUEST'
      });
    }

    // Validate receiverId is a number
    if (isNaN(Number(receiverId))) {
      return res.status(400).json({
        message: 'Invalid receiverId format',
        code: 'INVALID_RECEIVER_ID'
      });
    }

    console.log('Looking for user with id:', receiverId);
    const receiverExists = await User.findOne({
      where: { id: Number(receiverId) }
    });
    console.log('Receiver found:', receiverExists);
    if (!receiverExists) {
      return res.status(404).json({
        message: 'Receiver not found',
        code: 'RECEIVER_NOT_FOUND'
      });
    }

    const message = await Message.create({
      sender_id: Number(senderId),
      receiver_id: Number(receiverId),
      content
    });

    console.log('Message created:', message.toJSON());

    // Emit the message through Socket.IO if needed
    if (req.app.get('io')) {
      const roomId = [senderId, receiverId].sort().join('_');
      req.app.get('io').to(roomId).emit('receive_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Detailed error in sendMessage:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
      user: req.user
    });
    
    res.status(500).json({ 
      message: 'Error sending message',
      code: 'SEND_MESSAGE_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getChatHistory,
  markAsRead,
  sendMessage,
  getUnreadCount,
  deleteMessage
}; 