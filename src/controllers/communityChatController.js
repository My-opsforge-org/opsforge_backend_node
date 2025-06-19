const Message = require('../models/Message');
const Community = require('../models/Community');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get chat history for a community
const getCommunityChatHistory = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { limit = 50, before } = req.query;

    const whereClause = {
      community_id: communityId
    };
    if (before) {
      whereClause.createdAt = {
        [Op.lt]: new Date(before)
      };
    }

    const messages = await Message.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'avatarUrl'] }]
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching community chat history:', error);
    res.status(500).json({ message: 'Error fetching community chat history' });
  }
};

// Send a message to a community
const sendCommunityMessage = async (req, res) => {
  try {
    const { communityId, content } = req.body;
    const senderId = req.user.id;

    if (!content || !communityId) {
      return res.status(400).json({
        message: 'Content and communityId are required',
        code: 'INVALID_REQUEST'
      });
    }

    // Check if user is a member of the community
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found', code: 'COMMUNITY_NOT_FOUND' });
    }
    const members = await community.getMembers({ where: { id: senderId } });
    if (!members.length) {
      return res.status(403).json({ message: 'Not a member of the community', code: 'NOT_A_MEMBER' });
    }

    const message = await Message.create({
      sender_id: senderId,
      community_id: communityId,
      content
    });

    // Emit the message through Socket.IO if needed
    if (req.app.get('io')) {
      const roomId = `community_${communityId}`;
      req.app.get('io').to(roomId).emit('receive_community_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending community message:', error);
    res.status(500).json({ message: 'Error sending community message' });
  }
};

// Get unread message count for a user in a community (optional)
const getCommunityUnreadCount = async (req, res) => {
  try {
    const { communityId, userId } = req.params;
    const count = await Message.count({
      where: {
        community_id: communityId,
        is_read: false,
        sender_id: { [Op.ne]: userId }
      }
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting community unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
};

// Mark all messages as read for a user in a community
const markCommunityMessagesAsRead = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const [updatedCount] = await Message.update(
      { is_read: true },
      {
        where: {
          community_id: communityId,
          is_read: false,
          sender_id: { [Op.ne]: userId }
        }
      }
    );

    res.json({
      message: 'Community messages marked as read',
      updatedCount
    });
  } catch (error) {
    console.error('Error marking community messages as read:', error);
    res.status(500).json({ message: 'Error marking community messages as read' });
  }
};

// Delete a message from a community chat
const deleteCommunityMessage = async (req, res) => {
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
    console.error('Error deleting community message:', error);
    res.status(500).json({ message: 'Error deleting community message' });
  }
};

module.exports = {
  getCommunityChatHistory,
  sendCommunityMessage,
  getCommunityUnreadCount,
  markCommunityMessagesAsRead,
  deleteCommunityMessage
}; 