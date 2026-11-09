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

app.get("/api/db-health", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT 1 AS alive");
        res.json({
            success: true,
            message: "Database is connected and alive",
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            data: rows
        });
    } catch (error) {
        console.error("DB Health check error:", error);
        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error_code: error.code,
            error_errno: error.errno,
            error_message: error.message,
            db_host: process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 10)}...` : null,
            db_port: process.env.DB_PORT
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
