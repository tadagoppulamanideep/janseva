const express = require("express");

const router = express.Router();

const {
    createReport,
    getMyReports,
    getReportByCode,
    getDepartmentReports,
    updateReportStatus,
    getAllReports,
    assignDepartment
} = require("../controllers/reportController");

const authenticateToken = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

const upload = require("../middleware/uploadMiddleware");


// ======================================================
// CREATE REPORT
// ======================================================

router.post(
    "/",
    authenticateToken,
    upload.single("image"),
    createReport
);


// ======================================================
// GET MY REPORTS - CITIZEN
// ======================================================

router.get(
    "/my-reports",
    authenticateToken,
    getMyReports
);


// ======================================================
// GET DEPARTMENT REPORTS
// ======================================================

router.get(
    "/department",
    authenticateToken,
    authorizeRoles("department", "admin"),
    getDepartmentReports
);


// ======================================================
// UPDATE REPORT STATUS
// Department + Admin
// ======================================================

router.put(
    "/:report_id/status",
    authenticateToken,
    authorizeRoles("department", "admin"),
    updateReportStatus
);


// ======================================================
// MANUALLY ASSIGN DEPARTMENT
// Admin Only
// ======================================================

router.put(
    "/:report_id/department",
    authenticateToken,
    authorizeRoles("admin"),
    assignDepartment
);


// ======================================================
// GET ALL REPORTS - ADMIN
// ======================================================

router.get(
    "/admin",
    authenticateToken,
    authorizeRoles("admin"),
    getAllReports
);


// ======================================================
// TRACK REPORT BY REPORT CODE
// ======================================================

router.get(
    "/:report_code",
    authenticateToken,
    getReportByCode
);


module.exports = router;