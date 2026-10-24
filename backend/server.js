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

app.get("/api/update-two-passwords", async (req, res) => {
    try {
        const hashElectrical = await bcrypt.hash("electrical@123", 10);
        await db.query("UPDATE users SET password = ? WHERE email = ?", [hashElectrical, "electrical@civicfix.com"]);

        const hashElectricity = await bcrypt.hash("electricity@123", 10);
        await db.query("UPDATE users SET password = ? WHERE email = ?", [hashElectricity, "electricity@civicfix.com"]);

        res.json({
            success: true,
            message: "Updated electrical and electricity passwords successfully"
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
