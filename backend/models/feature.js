module.exports = (sequelize, DataTypes) => {
  const Feature = sequelize.define(
    "Feature",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      max_unit_limit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: "features",
      timestamps: true,
    }
  );

  Feature.associate = (db) => {
    Feature.belongsToMany(db.Plan, {
      through: db.PlanFeature,
      foreignKey: "featureId",
      otherKey: "planId",
    });
    
    Feature.hasMany(db.PlanFeature, {
      foreignKey: "featureId",
      as: "planFeatures"
    });
  };

  return Feature;
};