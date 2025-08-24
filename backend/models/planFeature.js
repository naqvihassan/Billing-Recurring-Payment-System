module.exports = (sequelize, DataTypes) => {
  const PlanFeature = sequelize.define(
    "PlanFeature",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      planId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'plans',
          key: 'id'
        }
      },
      featureId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'features',
          key: 'id'
        }
      }
    },
    {
      tableName: "plan_features",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['planId', 'featureId']
        }
      ]
    }
  );

  PlanFeature.associate = (db) => {
    PlanFeature.belongsTo(db.Plan, { 
      foreignKey: "planId",
      as: "plan"
    });
    PlanFeature.belongsTo(db.Feature, { 
      foreignKey: "featureId",
      as: "feature"
    });
  };

  return PlanFeature;
};