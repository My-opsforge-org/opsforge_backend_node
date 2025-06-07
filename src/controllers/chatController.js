const Message = require('../models/Message');
const { Op } = require('sequelize');

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
      whereClause.created_at = {
        [Op.lt]: new Date(before)
      };
    }

    const messages = await Message.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']], // Get newest messages first
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
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const result = await Message.update(
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
      updatedCount: result[0] // Number of messages updated
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
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
    res.status(500).json({ error: 'Failed to get unread message count' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.user; // From auth middleware

    const message = await Message.findOne({
      where: {
        id: messageId,
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found or unauthorized' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

module.exports = {
  getChatHistory,
  markAsRead,
  getUnreadCount,
  deleteMessage
}; 