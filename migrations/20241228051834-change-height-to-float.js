'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.sequelize.query(`
            ALTER TABLE "Users"
            ALTER COLUMN height TYPE FLOAT USING height::FLOAT;
        `);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Users', 'height', {
            type: Sequelize.STRING,
            allowNull: true, // Revert to original state if necessary
        });
    },
};