'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Change the 'height' column to FLOAT with explicit casting
        await queryInterface.sequelize.query(`
            ALTER TABLE "Users"
            ALTER COLUMN height TYPE FLOAT USING height::FLOAT;
        `);
    },

    down: async (queryInterface, Sequelize) => {
        // Revert the 'height' column back to VARCHAR
        await queryInterface.sequelize.query(`
            ALTER TABLE "Users"
            ALTER COLUMN height TYPE VARCHAR;
        `);
    },
};