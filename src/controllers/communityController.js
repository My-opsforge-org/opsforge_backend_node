const Community = require('../models/Community');
const User = require('../models/User');

// Get all communities
const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'avatarUrl'],
          through: { attributes: [] } // Don't include join table attributes
        }
      ]
    });

    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ message: 'Error fetching communities' });
  }
};

// Get community members
const getCommunityMembers = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findByPk(communityId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'bio', 'age', 'gender', 'sun_sign', 'interests', 'createdAt'],
          through: { attributes: [] } // Don't include join table attributes
        }
      ]
    });

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Format the members data
    const formattedMembers = community.members.map(member => {
      let interests = [];
      try {
        if (member.interests) {
          interests = JSON.parse(member.interests);
        }
      } catch (error) {
        console.error('Error parsing interests for user:', member.id);
      }

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        avatarUrl: member.avatarUrl,
        bio: member.bio,
        age: member.age,
        gender: member.gender,
        sun_sign: member.sun_sign,
        interests: interests,
        joinedAt: member.createdAt // This would ideally be the join date, but we're using createdAt for now
      };
    });

    res.json({
      community: {
        id: community.id,
        name: community.name,
        description: community.description,
        memberCount: formattedMembers.length
      },
      members: formattedMembers
    });
  } catch (error) {
    console.error('Error fetching community members:', error);
    res.status(500).json({ message: 'Error fetching community members' });
  }
};

// Join a community
const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is already a member
    const existingMembership = await community.getMembers({ where: { id: userId } });
    if (existingMembership.length > 0) {
      return res.status(400).json({ message: 'User is already a member of this community' });
    }

    // Add user to community
    await community.addMember(userId);

    res.json({ message: 'Successfully joined community' });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ message: 'Error joining community' });
  }
};

// Leave a community
const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    const existingMembership = await community.getMembers({ where: { id: userId } });
    if (existingMembership.length === 0) {
      return res.status(400).json({ message: 'User is not a member of this community' });
    }

    // Remove user from community
    await community.removeMember(userId);

    res.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ message: 'Error leaving community' });
  }
};

module.exports = {
  getAllCommunities,
  getCommunityMembers,
  joinCommunity,
  leaveCommunity
};
