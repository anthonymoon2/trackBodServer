'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'frontViewPhotoURL', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'sideViewPhotoURL', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'weight', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'height', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other'), // Use ENUM for predefined options
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'frontViewPhotoURL');
    await queryInterface.removeColumn('Users', 'sideViewPhotoURL');
    await queryInterface.removeColumn('Users', 'weight');
    await queryInterface.removeColumn('Users', 'height');
    await queryInterface.removeColumn('Users', 'gender');
  }
};
