'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove unnecessary columns
    await queryInterface.removeColumn('Users', 'password');
    await queryInterface.removeColumn('Users', 'username');
    await queryInterface.removeColumn('Users', 'createdAt');
    await queryInterface.removeColumn('Users', 'updatedAt');
  },

  async down(queryInterface, Sequelize) {
    // Re-add the removed columns in case of rollback
    await queryInterface.addColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
    await queryInterface.addColumn('Users', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });
  }
};
