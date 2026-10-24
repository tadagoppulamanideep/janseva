const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
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

app.get("/api/set-department-passwords", async (req, res) => {
    try {
        const updates = [
            { email: "electrical@civicfix.com", password: "electric@123" },
            { email: "water@civicfix.com", password: "water@123" },
            { email: "sanitation@civicfix.com", password: "sanitation@123" },
            { email: "traffic@civicfix.com", password: "traffic@123" },
            { email: "electricity@civicfix.com", password: "electric@123" },
            { email: "roads@civicfix.com", password: "roads@123" }
        ];

        for (const item of updates) {
            const hash = await bcrypt.hash(item.password, 10);
            await db.query("UPDATE users SET password = ? WHERE email = ?", [hash, item.email]);
        }

        res.json({
            success: true,
            message: "All department passwords updated successfully",
            updated: updates.map(u => u.email)
        });
    } catch (err) {
        console.error("Password update error:", err);
        res.status(500).json({ success: false, error: err.message });
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
