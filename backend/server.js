require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes)
app.use("/admin", adminRoutes)


sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB Sync error:", err));
