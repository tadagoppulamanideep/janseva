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

app.get("/api/seed-departments", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash("password123", 10);
        const deptUsers = [
            { name: "GHMC Electrical Officer", email: "electrical@civicfix.com", department_id: 2 },
            { name: "HMWSSB Water Officer", email: "water@civicfix.com", department_id: 3 },
            { name: "GHMC Sanitation Officer", email: "sanitation@civicfix.com", department_id: 4 },
            { name: "Traffic Police Officer", email: "traffic@civicfix.com", department_id: 5 },
            { name: "TGSPDCL Electricity Officer", email: "electricity@civicfix.com", department_id: 6 }
        ];

        const created = [];
        for (const u of deptUsers) {
            const [existing] = await db.query("SELECT user_id FROM users WHERE email = ?", [u.email]);
            if (existing.length === 0) {
                await db.query(
                    `INSERT INTO users (name, email, password, role, department_id)
                     VALUES (?, ?, ?, 'department', ?)`,
                    [u.name, u.email, hashedPassword, u.department_id]
                );
                created.push(u.email);
            }
        }

        res.json({
            success: true,
            message: "Department accounts seeded successfully",
            created,
            defaultPassword: "password123"
        });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ success: false, error: error.message });
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
