'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Scan extends Model {
    static associate(models) {
      // Define the association with the User model
      Scan.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Scan.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    frontViewPhotoURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sideViewPhotoURL: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfScan: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    scanNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    bodyFatPercentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fatMass: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    leanMass: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    bodyShape: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    headPosture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shoulderPosture: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // ✅ New Muscle Rating Fields
    shoulderRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    armRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    absRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    latsRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    forearmRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    chestRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Scan',
    timestamps: false,
  });

  return Scan;
};
