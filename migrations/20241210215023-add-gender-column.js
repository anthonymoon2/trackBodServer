'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the gender column
    await queryInterface.addColumn('Users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other'), // Enum type for gender
      allowNull: true, // Make it nullable for existing rows
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the gender column
    await queryInterface.removeColumn('Users', 'gender');

    // Optionally drop the enum type if no other table uses it
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_Users_gender";
    `);
  },
};