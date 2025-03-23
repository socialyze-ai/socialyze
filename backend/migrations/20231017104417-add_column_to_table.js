'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Channels', 'channelId', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '' // Replace with your desired default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Channels', 'channelId');
  }
};
