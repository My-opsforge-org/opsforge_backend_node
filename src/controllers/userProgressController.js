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
        achievements: '[]',
        completedLevels: '[]',
        currentLevelProgress: '{}',
        lastPlayedAt: new Date()
      });
    }

    // Parse JSON fields
    const achievements = JSON.parse(progress.achievements || '[]');
    const completedLevels = JSON.parse(progress.completedLevels || '[]');
    const currentLevelProgress = JSON.parse(progress.currentLevelProgress || '{}');

    res.json({
      success: true,
      data: {
        id: progress.id,
        userId: progress.userId,
        level: progress.level,
        totalXP: progress.totalXP,
        placesDiscovered: progress.placesDiscovered,
        achievements,
        completedLevels,
        currentLevelProgress,
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
    const { level, totalXP, placesDiscovered, achievements, completedLevels, currentLevelProgress } = req.body;

    let progress = await UserProgress.findOne({
      where: { userId }
    });

    if (!progress) {
      // Create new progress record
      progress = await UserProgress.create({
        userId,
        level: level || 1,
        totalXP: totalXP || 0,
        placesDiscovered: placesDiscovered || 0,
        achievements: JSON.stringify(achievements || []),
        completedLevels: JSON.stringify(completedLevels || []),
        currentLevelProgress: JSON.stringify(currentLevelProgress || {}),
        lastPlayedAt: new Date()
      });
    } else {
      // Update existing progress
      await progress.update({
        level: level || progress.level,
        totalXP: totalXP || progress.totalXP,
        placesDiscovered: placesDiscovered || progress.placesDiscovered,
        achievements: JSON.stringify(achievements || JSON.parse(progress.achievements || '[]')),
        completedLevels: JSON.stringify(completedLevels || JSON.parse(progress.completedLevels || '[]')),
        currentLevelProgress: JSON.stringify(currentLevelProgress || JSON.parse(progress.currentLevelProgress || '{}')),
        lastPlayedAt: new Date()
      });
    }

    // Parse JSON fields for response
    const achievementsParsed = JSON.parse(progress.achievements || '[]');
    const completedLevelsParsed = JSON.parse(progress.completedLevels || '[]');
    const currentLevelProgressParsed = JSON.parse(progress.currentLevelProgress || '{}');

    res.json({
      success: true,
      data: {
        id: progress.id,
        userId: progress.userId,
        level: progress.level,
        totalXP: progress.totalXP,
        placesDiscovered: progress.placesDiscovered,
        achievements: achievementsParsed,
        completedLevels: completedLevelsParsed,
        currentLevelProgress: currentLevelProgressParsed,
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
    const { levelId, xpReward, placesFound } = req.body;

    let progress = await UserProgress.findOne({
      where: { userId }
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Parse existing data
    const achievements = JSON.parse(progress.achievements || '[]');
    const completedLevels = JSON.parse(progress.completedLevels || '[]');
    const currentLevelProgress = JSON.parse(progress.currentLevelProgress || '{}');

    // Update progress
    const newTotalXP = progress.totalXP + (xpReward || 0);
    const newPlacesDiscovered = progress.placesDiscovered + (placesFound || 0);
    const newLevel = progress.level + 1;

    // Add level to completed levels if not already there
    if (!completedLevels.includes(levelId)) {
      completedLevels.push(levelId);
    }

    // Check for achievements
    const newAchievements = [...achievements];
    if (newPlacesDiscovered >= 10 && !achievements.includes('Explorer')) {
      newAchievements.push('Explorer');
    }
    if (newTotalXP >= 500 && !achievements.includes('Master Explorer')) {
      newAchievements.push('Master Explorer');
    }

    // Update progress
    await progress.update({
      level: newLevel,
      totalXP: newTotalXP,
      placesDiscovered: newPlacesDiscovered,
      achievements: JSON.stringify(newAchievements),
      completedLevels: JSON.stringify(completedLevels),
      currentLevelProgress: JSON.stringify(currentLevelProgress),
      lastPlayedAt: new Date()
    });

    res.json({
      success: true,
      data: {
        id: progress.id,
        userId: progress.userId,
        level: newLevel,
        totalXP: newTotalXP,
        placesDiscovered: newPlacesDiscovered,
        achievements: newAchievements,
        completedLevels,
        currentLevelProgress,
        lastPlayedAt: progress.lastPlayedAt,
        levelCompleted: true,
        xpEarned: xpReward || 0
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
    const { levelId, currentProgress } = req.body;

    let progress = await UserProgress.findOne({
      where: { userId }
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Parse existing progress
    const currentLevelProgress = JSON.parse(progress.currentLevelProgress || '{}');
    
    // Update progress for specific level
    currentLevelProgress[levelId] = currentProgress;

    // Update in database
    await progress.update({
      currentLevelProgress: JSON.stringify(currentLevelProgress),
      lastPlayedAt: new Date()
    });

    res.json({
      success: true,
      data: {
        levelId,
        currentProgress,
        message: 'Level progress updated successfully'
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
      include: [{ model: User, attributes: ['name', 'avatarUrl'] }],
      order: [['totalXP', 'DESC'], ['placesDiscovered', 'DESC']],
      limit: 10
    });

    const leaderboardData = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      name: entry.User.name,
      avatarUrl: entry.User.avatarUrl,
      totalXP: entry.totalXP,
      placesDiscovered: entry.placesDiscovered,
      level: entry.level,
      achievements: JSON.parse(entry.achievements || '[]')
    }));

    res.json({
      success: true,
      data: leaderboardData
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