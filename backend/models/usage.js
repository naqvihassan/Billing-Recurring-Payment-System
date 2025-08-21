module.exports = (sequelize, DataTypes) => {
    const Usage = sequelize.define(
      "Usage",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        subscriptionId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'subscriptions',
            key: 'id'
          }
        },
        planFeatureId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'plan_features',
            key: 'id'
          }
        },
        units_used: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        usage_date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        billing_period: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Format: YYYY-MM for the billing month'
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: 'Additional usage context/details'
        }
      },
      {
        tableName: "usages",
        timestamps: true,
        indexes: [
          {
            fields: ['subscriptionId', 'billing_period', 'planFeatureId']
          },
          {
            fields: ['usage_date']
          }
        ]
      }
    );
  
    Usage.associate = (db) => {
      Usage.belongsTo(db.Subscription, {
        foreignKey: "subscriptionId",
        as: "subscription"
      });
      
      Usage.belongsTo(db.PlanFeature, {
        foreignKey: "planFeatureId",
        as: "planFeature"
      });
    };
  
    return Usage;
  };