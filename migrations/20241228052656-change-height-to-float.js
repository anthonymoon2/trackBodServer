'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'height', {
      type: Sequelize.FLOAT,
      allowNull: true, // Adjust based on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'height', {
      type: Sequelize.STRING, // This reverts it back to VARCHAR
      allowNull: true, // Adjust based on your original column definition
    });
  }
};