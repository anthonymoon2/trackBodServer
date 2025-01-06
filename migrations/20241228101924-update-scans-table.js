'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Scans', 'scanNumber', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1, // Default to 1 for existing data
    });

    await queryInterface.addColumn('Scans', 'fatMass', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('Scans', 'leanMass', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.removeColumn('Scans', 'spinePosture');
    await queryInterface.removeColumn('Scans', 'hipsPosture');
    await queryInterface.removeColumn('Scans', 'muscleMassPercentage');
    await queryInterface.removeColumn('Scans', 'bodySymmetryPercentage');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Scans', 'scanNumber');
    await queryInterface.removeColumn('Scans', 'fatMass');
    await queryInterface.removeColumn('Scans', 'leanMass');

    await queryInterface.addColumn('Scans', 'spinePosture', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Scans', 'hipsPosture', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Scans', 'muscleMassPercentage', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('Scans', 'bodySymmetryPercentage', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },
};