module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('TradeUserStates', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      tradeId: { type: Sequelize.INTEGER, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      hidden: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.addIndex('TradeUserStates', ['tradeId', 'userId'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('TradeUserStates');
  }
};
