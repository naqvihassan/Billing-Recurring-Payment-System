module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define(
    "Plan",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      monthlyFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      billing_cycle: {
        type: DataTypes.ENUM('monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly',
      }
    },
    {
      tableName: "plans",
      timestamps: true,
    }
  );

  Plan.associate = (db) => {
    Plan.belongsToMany(db.Feature, {
      through: db.PlanFeature,
      foreignKey: "planId",
      otherKey: "featureId",
    });
    
    Plan.hasMany(db.PlanFeature, {
      foreignKey: "planId",
      as: "planFeatures"
    });
    
    Plan.hasMany(db.Subscription, {
      foreignKey: "planId",
      as: "subscriptions"
    });
  };

  return Plan;
};