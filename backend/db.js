const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("BillingSystem", "apple", null, {
  host: "127.0.0.1",
  dialect: "postgres",
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.error("❌ Error connecting to DB:", err));

module.exports = sequelize;
