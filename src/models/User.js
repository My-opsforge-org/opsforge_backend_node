const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(120),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  avatarUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'avatarUrl'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sun_sign: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  interests: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updatedAt'
  }
}, {
  tableName: 'user',
  underscored: true,
  hooks: {
    beforeCreate: (user) => {
      if (user.interests && Array.isArray(user.interests)) {
        user.interests = JSON.stringify(user.interests);
      }
    },
    beforeUpdate: (user) => {
      if (user.interests && Array.isArray(user.interests)) {
        user.interests = JSON.stringify(user.interests);
      }
    }
  }
});

// Instance methods
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Parse interests if it's a string
  if (values.interests && typeof values.interests === 'string') {
    try {
      values.interests = JSON.parse(values.interests);
    } catch (e) {
      values.interests = [];
    }
  } else if (!values.interests) {
    values.interests = [];
  }

  // Add location object
  if (values.latitude !== null && values.longitude !== null) {
    values.location = {
      lat: values.latitude,
      lng: values.longitude
    };
  } else {
    values.location = null;
  }

  // Remove password from response
  delete values.password;
  
  return values;
};

User.prototype.updateFromDict = function(data) {
  if (data.name) this.name = data.name;
  if (data.avatarUrl) this.avatarUrl = data.avatarUrl;
  if (data.bio) this.bio = data.bio;
  
  if (data.age !== undefined) {
    const age = parseInt(data.age);
    if (isNaN(age) || age < 0 || age > 120) {
      throw new Error('Age must be between 0 and 120');
    }
    this.age = age;
  }
  
  if (data.gender) {
    const gender = data.gender.toLowerCase();
    if (!['male', 'female', 'other'].includes(gender)) {
      throw new Error('Invalid gender value');
    }
    this.gender = gender;
  }
  
  if (data.sun_sign) {
    const sun_sign = data.sun_sign.toLowerCase();
    const valid_signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
    if (!valid_signs.includes(sun_sign)) {
      throw new Error('Invalid sun sign');
    }
    this.sun_sign = sun_sign;
  }
  
  if (data.interests) {
    if (Array.isArray(data.interests)) {
      this.interests = JSON.stringify(data.interests);
    } else {
      throw new Error('Invalid interests format');
    }
  }
  
  if (data.location) {
    if (typeof data.location === 'object' && data.location.lat && data.location.lng) {
      const lat = parseFloat(data.location.lat);
      const lng = parseFloat(data.location.lng);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Invalid latitude/longitude values');
      }
      this.latitude = lat;
      this.longitude = lng;
    } else {
      throw new Error('Invalid location format');
    }
  }
};

module.exports = User; 