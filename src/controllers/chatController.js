const { sequelize } = require('../config/database');
const Message = require('../models/Message');
const { Op } = require('sequelize');
const User = require('../models/User');

// Get conversations (users the current user has chatted with)
const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdInt = parseInt(userId, 10);

    // Find all unique conversations for this user
    const conversations = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userIdInt },
          { receiver_id: userIdInt }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group by conversation partner and get latest message
    const conversationMap = new Map();
    
    conversations.forEach(message => {
      const otherUserId = message.sender_id === userIdInt ? message.receiver_id : message.sender_id;
      const otherUser = message.sender_id === userIdInt ? message.receiver : message.sender;
      
      // Skip messages where otherUserId is null or undefined (community messages)
      if (otherUserId === null || otherUserId === undefined) {
        return;
      }
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          id: otherUserId.toString(),
          name: otherUser?.name || 'Unknown User',
          avatar: otherUser?.avatarUrl || 'https://picsum.photos/200?random=' + otherUserId,
          lastMessage: message.content,
          timestamp: message.createdAt,
          unreadCount: 0
        });
      }
    });

    const conversationList = Array.from(conversationMap.values());

    return res.json(conversationList);
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get conversations'
    });
  }
};

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
    const senderId = req.user.id;

    console.log(`HTTP sendMessage: User ${senderId} sending to ${receiverId}: ${content}`);

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        error: 'Receiver ID and content are required'
      });
    }

    // Find the receiver user
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Receiver not found'
      });
    }

    // Create the message
    const message = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      content
    });

    // Emit to receiver in realtime if socket is available
    try {
      const io = req.app.get('io');
      if (io) {
        console.log('Emitting via HTTP endpoint to room:', `user_${receiverId}`);
        io.to(`user_${receiverId}`).emit('private_message', {
          id: message.id,
          sender_id: senderId,
          receiver_id: receiverId,
          content: message.content,
          created_at: message.created_at
        });
        io.to(`user_${receiverId}`).emit('receive_private_message', {
          id: message.id,
          sender_id: senderId,
          receiver_id: receiverId,
          content: message.content,
          created_at: message.created_at
        });
      } else {
        console.log('Socket.IO not available in HTTP endpoint');
      }
    } catch (e) {
      console.error('Socket emission error in HTTP endpoint:', e);
    }

    return res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        is_read: message.is_read,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

module.exports = {
  getConversations,
  getChatHistory,
  markAsRead,
  sendMessage,
  getUnreadCount,
  deleteMessage
}; 