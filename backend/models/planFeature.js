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
      },
      // Units included in the base plan price
      included_units: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      // Price per unit when exceeded (can override feature default)
      overage_unit_price: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: true,
      },
      // Whether this feature has unlimited usage
      is_unlimited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Whether to charge for overage or just block usage
      allow_overage: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      // Order for display purposes
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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