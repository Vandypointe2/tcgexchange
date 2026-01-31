module.exports = (sequelize, DataTypes) => {
  const TradeUserState = sequelize.define('TradeUserState', {
    tradeId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'TradeUserStates'
  });

  TradeUserState.associate = (models) => {
    TradeUserState.belongsTo(models.Trade, { foreignKey: 'tradeId', as: 'trade' });
    TradeUserState.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return TradeUserState;
};
