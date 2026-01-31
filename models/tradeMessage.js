module.exports = (sequelize, DataTypes) => {
  const TradeMessage = sequelize.define('TradeMessage', {
    tradeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  TradeMessage.associate = (models) => {
    TradeMessage.belongsTo(models.Trade, { foreignKey: 'tradeId', onDelete: 'CASCADE' });
    TradeMessage.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
  };

  return TradeMessage;
};
