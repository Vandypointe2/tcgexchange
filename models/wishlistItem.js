module.exports = (sequelize, DataTypes) => {
  const WishlistItem = sequelize.define('WishlistItem', {
    cardId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    minCondition: {
      type: DataTypes.ENUM('NM', 'LP', 'MP', 'HP', 'DMG'),
      allowNull: false,
      defaultValue: 'LP'
    },
    quantityDesired: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 }
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
      validate: { min: 1, max: 5 }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  WishlistItem.associate = (models) => {
    WishlistItem.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return WishlistItem;
};
