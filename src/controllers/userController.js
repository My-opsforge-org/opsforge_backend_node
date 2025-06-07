const sequelize = require('../config/database');

const getUserProfile = async (req, res) => {
  try {
    // Get user ID from token (sub field in Flask JWT)
    const userId = req.user.id; // This is now the 'sub' value from the token

    // Query user data from PostgreSQL matching Flask model columns exactly
    const [user] = await sequelize.query(
      `SELECT 
        id,
        username,
        name,
        email,
        "avatarUrl",
        bio,
        age,
        gender,
        interests,
        latitude,
        longitude,
        "createdAt",
        "updatedAt"
      FROM "user" 
      WHERE id = :userId`,
      {
        replacements: { userId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Parse interests if it exists
    let interests = [];
    if (user.interests) {
      try {
        interests = JSON.parse(user.interests);
      } catch (e) {
        console.error('Error parsing interests:', e);
      }
    }

    // Structure the response to match Flask model's to_dict() method
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      age: user.age,
      gender: user.gender,
      interests: interests,
      location: (user.latitude !== null && user.longitude !== null) ? {
        lat: user.latitude,
        lng: user.longitude
      } : null,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      code: 'SERVER_ERROR'
    });
  }
};

module.exports = {
  getUserProfile
}; 