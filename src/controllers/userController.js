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
        "createdAt"
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

        // Return formatted user object
        return {
          id: user.id,
          username: user.username,
          name: user.name || null,
          email: user.email,
          avatarUrl: user.avatarUrl || null,
          bio: user.bio || null,
          age: user.age || null,
          gender: user.gender || null,
          interests: interests,
          location: location,
          createdAt: user.createdAt
        };
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        return {
          id: user.id,
          username: user.username,
          name: user.name || null,
          email: user.email,
          avatarUrl: user.avatarUrl || null,
          bio: user.bio || null,
          age: user.age || null,
          gender: user.gender || null,
          interests: [],
          location: null,
          createdAt: user.createdAt
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