'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define the one-to-many relationship with Scans
      User.hasMany(models.Scan, { foreignKey: 'user_id', as: 'scans' });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    provider: {
      type: DataTypes.ENUM('google', 'apple'),
      allowNull: false,
    },
    provider_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: true, 
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
