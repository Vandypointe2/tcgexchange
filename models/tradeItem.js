module.exports = (sequelize, DataTypes) => {
  const TradeItem = sequelize.define('TradeItem', {
    tradeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cardId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 }
    }
  });

  TradeItem.associate = (models) => {
    TradeItem.belongsTo(models.Trade, { foreignKey: 'tradeId', onDelete: 'CASCADE' });
    TradeItem.belongsTo(models.User, { as: 'fromUser', foreignKey: 'fromUserId' });
    TradeItem.belongsTo(models.User, { as: 'toUser', foreignKey: 'toUserId' });
  };

  return TradeItem;
};
