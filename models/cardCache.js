module.exports = (sequelize, DataTypes) => {
  const CardCache = sequelize.define('CardCache', {
    id: {
      // PokemonTCG card id (e.g. "basep-1")
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: { type: DataTypes.STRING, allowNull: false },
    setId: { type: DataTypes.STRING, allowNull: true },
    setName: { type: DataTypes.STRING, allowNull: true },
    number: { type: DataTypes.STRING, allowNull: true },
    rarity: { type: DataTypes.STRING, allowNull: true },
    supertype: { type: DataTypes.STRING, allowNull: true },
    subtypesJson: { type: DataTypes.TEXT, allowNull: true },
    typesJson: { type: DataTypes.TEXT, allowNull: true },
    imageSmall: { type: DataTypes.STRING, allowNull: true },
    imageLarge: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'CardCaches'
  });

  return CardCache;
};
