'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Scans table
    await queryInterface.createTable('Scans', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Name of the referenced table
          key: 'id',
        },
        onDelete: 'CASCADE', // Delete scans when the user is deleted
      },
      frontViewPhotoURL: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sideViewPhotoURL: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateOfScan: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Remove frontViewPhotoURL and sideViewPhotoURL from Users table
    await queryInterface.removeColumn('Users', 'frontViewPhotoURL');
    await queryInterface.removeColumn('Users', 'sideViewPhotoURL');
  },

  async down(queryInterface, Sequelize) {
    // Drop Scans table
    await queryInterface.dropTable('Scans');
  },
};
