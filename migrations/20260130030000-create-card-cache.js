module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CardCaches', {
      id: { type: Sequelize.STRING, allowNull: false, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      setId: { type: Sequelize.STRING, allowNull: true },
      setName: { type: Sequelize.STRING, allowNull: true },
      number: { type: Sequelize.STRING, allowNull: true },
      rarity: { type: Sequelize.STRING, allowNull: true },
      supertype: { type: Sequelize.STRING, allowNull: true },
      subtypesJson: { type: Sequelize.TEXT, allowNull: true },
      typesJson: { type: Sequelize.TEXT, allowNull: true },
      imageSmall: { type: Sequelize.STRING, allowNull: true },
      imageLarge: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('CardCaches');
  }
};
