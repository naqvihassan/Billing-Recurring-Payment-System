module.exports = (sequelize, DataTypes) => {
    const Subscription = sequelize.define(
      "Subscription",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        planId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'plans',
            key: 'id'
          }
        },
        status: {
          type: DataTypes.ENUM('active', 'cancelled', 'suspended', 'expired'),
          allowNull: false,
          defaultValue: 'active',
        },
        started_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        cancelled_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        billing_day: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 28
          }
        },
        next_billing_date: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        monthly_fee_snapshot: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false
        }
      },
      {
        tableName: "subscriptions",
        timestamps: true,
      }
    );
  
    Subscription.associate = (db) => {
      Subscription.belongsTo(db.User, {
        foreignKey: "userId",
        as: "user"
      });
      
      Subscription.belongsTo(db.Plan, {
        foreignKey: "planId",
        as: "plan"
      });
      
      Subscription.hasMany(db.Usage, {
        foreignKey: "subscriptionId",
        as: "usages"
      });
    };
  
    return Subscription;
  };