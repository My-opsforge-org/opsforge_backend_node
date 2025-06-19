const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    console.log('Attempting to fetch users...');
    
    // Use raw query with Sequelize
    const users = await sequelize.query(
      `SELECT 
        id,
        name,
        email,
        "avatarUrl",
        bio,
        age,
        gender,
        sun_sign,
        interests,
        latitude,
        longitude,
        "createdAt",
        "updatedAt"
      FROM "user"
      ORDER BY "createdAt" DESC`,
      {
        type: Sequelize.QueryTypes.SELECT
      }
    );

    console.log(`Successfully fetched ${users.length} users`);

    // Format users data
    const formattedUsers = users.map(user => {
      try {
        // Parse interests if they exist
        const interests = user.interests ? JSON.parse(user.interests) : [];
        
        // Create location object if coordinates exist
        const location = (user.latitude !== null && user.longitude !== null) 
          ? { lat: user.latitude, lng: user.longitude }
          : null;

        // Placeholder for followers_count and following_count (requires join or subquery in real DB)
        const followers_count = user.followers_count || 0;
        const following_count = user.following_count || 0;

        // Return formatted user object
        return {
          id: user.id,
          name: user.name || null,
          email: user.email,
          avatarUrl: user.avatarUrl || null,
          bio: user.bio || null,
          age: user.age || null,
          gender: user.gender || null,
          sun_sign: user.sun_sign || null,
          interests: interests,
          location: location,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          followers_count: followers_count,
          following_count: following_count
        };
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        return {
          id: user.id,
          name: user.name || null,
          email: user.email,
          avatarUrl: user.avatarUrl || null,
          bio: user.bio || null,
          age: user.age || null,
          gender: user.gender || null,
          sun_sign: user.sun_sign || null,
          interests: [],
          location: null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          followers_count: 0,
          following_count: 0
        };
      }
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error('Detailed error in getAllUsers:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      sql: error.sql,
      sqlMessage: error.sqlMessage
    });
    
    res.status(500).json({ 
      message: 'Error fetching users',
      code: 'FETCH_USERS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers
}; 