module.exports = (sequelize, DataTypes) => {
  const Trade = sequelize.define('Trade', {
    proposerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PROPOSED', 'ACCEPTED', 'DECLINED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PROPOSED'
    }
  });

  Trade.associate = (models) => {
    Trade.belongsTo(models.User, { as: 'proposer', foreignKey: 'proposerId' });
    Trade.belongsTo(models.User, { as: 'recipient', foreignKey: 'recipientId' });
    Trade.hasMany(models.TradeItem, { foreignKey: 'tradeId', as: 'items', onDelete: 'CASCADE' });
    Trade.hasMany(models.TradeMessage, { foreignKey: 'tradeId', as: 'messages', onDelete: 'CASCADE' });
  };

  return Trade;
};
