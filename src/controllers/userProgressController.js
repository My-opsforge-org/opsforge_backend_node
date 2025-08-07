const UserProgress = require('../models/UserProgress');
const User = require('../models/User');

// Get user progress
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    let progress = await UserProgress.findOne({
      where: { userId },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    if (!progress) {
      // Create default progress for new user
      progress = await UserProgress.create({
        userId,
        level: 1,
        totalXP: 0,
        placesDiscovered: 0,
        touristTrail: 0,
        foodExplorer: 0,
        culturalQuest: 0,
        natureWanderer: 0,
        entertainmentHunter: 0,
        lastPlayedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        id: progress.id,
        userId: progress.userId,
        level: progress.level,
        totalXP: progress.totalXP,
        placesDiscovered: progress.placesDiscovered,
        touristTrail: progress.touristTrail,
        foodExplorer: progress.foodExplorer,
        culturalQuest: progress.culturalQuest,
        natureWanderer: progress.natureWanderer,
        entertainmentHunter: progress.entertainmentHunter,
        lastPlayedAt: progress.lastPlayedAt,
        user: progress.User
      }
    });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress',
      error: error.message
    });
  }
};

// Update user progress
const updateUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      level,
      totalXP,
      placesDiscovered,
      touristTrail,
      foodExplorer,
      culturalQuest,
      natureWanderer,
      entertainmentHunter
    } = req.body;

    let progress = await UserProgress.findOne({ where: { userId } });

    if (!progress) {
      // Create new progress record
      progress = await UserProgress.create({
        userId,
        level: level || 1,
        totalXP: totalXP || 0,
        placesDiscovered: placesDiscovered || 0,
        touristTrail: touristTrail || 0,
        foodExplorer: foodExplorer || 0,
        culturalQuest: culturalQuest || 0,
        natureWanderer: natureWanderer || 0,
        entertainmentHunter: entertainmentHunter || 0,
        lastPlayedAt: new Date()
      });
    } else {
      // Update existing progress
      await progress.update({
        level: level !== undefined ? level : progress.level,
        totalXP: totalXP !== undefined ? totalXP : progress.totalXP,
        placesDiscovered: placesDiscovered !== undefined ? placesDiscovered : progress.placesDiscovered,
        touristTrail: touristTrail !== undefined ? touristTrail : progress.touristTrail,
        foodExplorer: foodExplorer !== undefined ? foodExplorer : progress.foodExplorer,
        culturalQuest: culturalQuest !== undefined ? culturalQuest : progress.culturalQuest,
        natureWanderer: natureWanderer !== undefined ? natureWanderer : progress.natureWanderer,
        entertainmentHunter: entertainmentHunter !== undefined ? entertainmentHunter : progress.entertainmentHunter,
        lastPlayedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: {
        id: progress.id,
        userId: progress.userId,
        level: progress.level,
        totalXP: progress.totalXP,
        placesDiscovered: progress.placesDiscovered,
        touristTrail: progress.touristTrail,
        foodExplorer: progress.foodExplorer,
        culturalQuest: progress.culturalQuest,
        natureWanderer: progress.natureWanderer,
        entertainmentHunter: progress.entertainmentHunter,
        lastPlayedAt: progress.lastPlayedAt
      }
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user progress',
      error: error.message
    });
  }
};

// Complete a level
const completeLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level, xpGained } = req.body;

    let progress = await UserProgress.findOne({ where: { userId } });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Update level and XP
    await progress.update({
      level: level,
      totalXP: progress.totalXP + (xpGained || 0),
      lastPlayedAt: new Date()
    });

    res.json({
      success: true,
      data: {
        id: progress.id,
        userId: progress.userId,
        level: progress.level,
        totalXP: progress.totalXP,
        lastPlayedAt: progress.lastPlayedAt
      }
    });
  } catch (error) {
    console.error('Error completing level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete level',
      error: error.message
    });
  }
};

// Update current level progress
const updateLevelProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      placesDiscovered, 
      touristTrail, 
      foodExplorer, 
      culturalQuest, 
      natureWanderer, 
      entertainmentHunter 
    } = req.body;

    let progress = await UserProgress.findOne({ where: { userId } });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Update specific progress fields
    await progress.update({
      placesDiscovered: placesDiscovered !== undefined ? placesDiscovered : progress.placesDiscovered,
      touristTrail: touristTrail !== undefined ? touristTrail : progress.touristTrail,
      foodExplorer: foodExplorer !== undefined ? foodExplorer : progress.foodExplorer,
      culturalQuest: culturalQuest !== undefined ? culturalQuest : progress.culturalQuest,
      natureWanderer: natureWanderer !== undefined ? natureWanderer : progress.natureWanderer,
      entertainmentHunter: entertainmentHunter !== undefined ? entertainmentHunter : progress.entertainmentHunter,
      lastPlayedAt: new Date()
    });

    res.json({
      success: true,
      data: {
        id: progress.id,
        userId: progress.userId,
        level: progress.level,
        totalXP: progress.totalXP,
        placesDiscovered: progress.placesDiscovered,
        touristTrail: progress.touristTrail,
        foodExplorer: progress.foodExplorer,
        culturalQuest: progress.culturalQuest,
        natureWanderer: progress.natureWanderer,
        entertainmentHunter: progress.entertainmentHunter,
        lastPlayedAt: progress.lastPlayedAt
      }
    });
  } catch (error) {
    console.error('Error updating level progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update level progress',
      error: error.message
    });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await UserProgress.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }],
      order: [
        ['totalXP', 'DESC'],
        ['level', 'DESC']
      ],
      limit: 50
    });

    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      name: entry.User.name,
      level: entry.level,
      totalXP: entry.totalXP,
      placesDiscovered: entry.placesDiscovered
    }));

    res.json({
      success: true,
      data: formattedLeaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
};

module.exports = {
  getUserProgress,
  updateUserProgress,
  completeLevel,
  updateLevelProgress,
  getLeaderboard
}; 