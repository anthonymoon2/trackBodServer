'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the original `height` column
    await queryInterface.removeColumn('Users', 'height');

    // Add the new `heightFeet` column
    await queryInterface.addColumn('Users', 'heightFeet', {
      type: Sequelize.INTEGER,
      allowNull: true, // Set to false if you want this to be required
      defaultValue: 0, // Optional: Default to 0
    });

    // Add the new `heightInches` column
    await queryInterface.addColumn('Users', 'heightInches', {
      type: Sequelize.INTEGER,
      allowNull: true, // Set to false if you want this to be required
      defaultValue: 0, // Optional: Default to 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the `height` column
    await queryInterface.addColumn('Users', 'height', {
      type: Sequelize.FLOAT,
      allowNull: true, // Adjust based on your previous schema
    });

    // Remove the `heightFeet` column
    await queryInterface.removeColumn('Users', 'heightFeet');

    // Remove the `heightInches` column
    await queryInterface.removeColumn('Users', 'heightInches');
  }
};
