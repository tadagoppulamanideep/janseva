const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Janseva Backend is running!"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const [users] = await db.query("SELECT user_id, name, email, role, department_id FROM users");
        const [departments] = await db.query("SELECT * FROM departments");

        res.json({
            success: true,
            users,
            departments
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database query failed: " + error.message
        });
    }
});

// Global error handler for middleware / multer errors
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Janseva server running on http://localhost:${PORT}`);
});
