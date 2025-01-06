'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove existing columns
    await queryInterface.removeColumn('Scans', 'bodyMassIndex');
    await queryInterface.removeColumn('Scans', 'fatMassIndex');
    await queryInterface.removeColumn('Scans', 'leanMassIndex');
    await queryInterface.removeColumn('Scans', 'visceralFatEstimate');

    // Add new columns
    await queryInterface.addColumn('Scans', 'muscleMassPercentage', {
      type: Sequelize.FLOAT,
      allowNull: true, // Optional, can be null
    });
    await queryInterface.addColumn('Scans', 'bodyShape', {
      type: Sequelize.STRING,
      allowNull: true, // Optional, can be null
    });
    await queryInterface.addColumn('Scans', 'headPosture', {
      type: Sequelize.STRING,
      allowNull: true, // Optional, can be null
    });
    await queryInterface.addColumn('Scans', 'shoulderPosture', {
      type: Sequelize.STRING,
      allowNull: true, // Optional, can be null
    });
    await queryInterface.addColumn('Scans', 'spinePosture', {
      type: Sequelize.STRING,
      allowNull: true, // Optional, can be null
    });
    await queryInterface.addColumn('Scans', 'hipsPosture', {
      type: Sequelize.STRING,
      allowNull: true, // Optional, can be null
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add removed columns
    await queryInterface.addColumn('Scans', 'bodyMassIndex', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'fatMassIndex', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'leanMassIndex', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'visceralFatEstimate', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Remove newly added columns
    await queryInterface.removeColumn('Scans', 'muscleMassPercentage');
    await queryInterface.removeColumn('Scans', 'bodyShape');
    await queryInterface.removeColumn('Scans', 'headPosture');
    await queryInterface.removeColumn('Scans', 'shoulderPosture');
    await queryInterface.removeColumn('Scans', 'spinePosture');
    await queryInterface.removeColumn('Scans', 'hipsPosture');
  },
};