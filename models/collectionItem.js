module.exports = (sequelize, DataTypes) => {
  const CollectionItem = sequelize.define('CollectionItem', {
    cardId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    condition: {
      type: DataTypes.ENUM('NM', 'LP', 'MP', 'HP', 'DMG'),
      allowNull: false,
      defaultValue: 'NM'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 }
    }
  });

  CollectionItem.associate = (models) => {
    CollectionItem.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return CollectionItem;
};
