module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('CardCaches', 'hp', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('CardCaches', 'setSeries', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('CardCaches', 'setReleaseDate', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('CardCaches', 'setPrintedTotal', { type: Sequelize.INTEGER, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('CardCaches', 'hp');
    await queryInterface.removeColumn('CardCaches', 'setSeries');
    await queryInterface.removeColumn('CardCaches', 'setReleaseDate');
    await queryInterface.removeColumn('CardCaches', 'setPrintedTotal');
  }
};
