'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Scans', 'bodyFatPercentage', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'bodySymmetryPercentage', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'bodyMassIndex', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'leanMassIndex', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'fatMassIndex', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Scans', 'visceralFatEstimate', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Scans', 'bodyFatPercentage');
    await queryInterface.removeColumn('Scans', 'bodySymmetryPercentage');
    await queryInterface.removeColumn('Scans', 'bodyMassIndex');
    await queryInterface.removeColumn('Scans', 'leanMassIndex');
    await queryInterface.removeColumn('Scans', 'fatMassIndex');
    await queryInterface.removeColumn('Scans', 'visceralFatEstimate');
  },
};