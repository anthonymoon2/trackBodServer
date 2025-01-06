'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Scans', 'bodyFatPercentage', {
      type: Sequelize.INTEGER, // Change the column type to INTEGER
      allowNull: true, // Adjust this based on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Scans', 'bodyFatPercentage', {
      type: Sequelize.FLOAT, // Revert the column type back to FLOAT
      allowNull: true, // Adjust this based on your requirements
    });
  }
};