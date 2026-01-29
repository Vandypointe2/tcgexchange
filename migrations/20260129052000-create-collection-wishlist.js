module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CollectionItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      cardId: { type: Sequelize.STRING, allowNull: false },
      condition: {
        type: Sequelize.ENUM('NM', 'LP', 'MP', 'HP', 'DMG'),
        allowNull: false,
        defaultValue: 'NM'
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });

    await queryInterface.createTable('WishlistItems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE'
      },
      cardId: { type: Sequelize.STRING, allowNull: false },
      minCondition: {
        type: Sequelize.ENUM('NM', 'LP', 'MP', 'HP', 'DMG'),
        allowNull: false,
        defaultValue: 'LP'
      },
      quantityDesired: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      priority: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 3 },
      notes: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('WishlistItems');
    await queryInterface.dropTable('CollectionItems');
  }
};
