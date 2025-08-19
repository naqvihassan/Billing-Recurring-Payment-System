// server.js
const express = require("express");
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 3000;

app.use(express.json());

// Routes
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced ✅");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB Sync error:", err));
