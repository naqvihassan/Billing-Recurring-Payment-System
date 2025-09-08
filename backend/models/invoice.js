module.exports = (sequelize, DataTypes) => {
  const Invoice = sequelize.define(
    "Invoice",
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
      subscriptionId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'subscriptions',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('paid', 'unpaid', 'overdue', 'cancelled'),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      invoiceDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      lineItems: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      }
    },
    {
      tableName: "invoices",
      timestamps: true,
    }
  );

  Invoice.associate = (db) => {
    Invoice.belongsTo(db.User, { foreignKey: "userId", as: "user" });
    Invoice.belongsTo(db.Subscription, { foreignKey: "subscriptionId", as: "subscription" });
  };

  return Invoice;
};
