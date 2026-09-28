const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


// ======================================================
// CREATE REPORT
// ======================================================

const createReport = async (req, res) => {
    try {
        const {
            description,
            latitude,
            longitude,
            address
        } = req.body;

        const user_id = req.user.user_id;

        if (!description) {
            return res.status(400).json({
                success: false,
                message: "Description is required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });
        }


        // --------------------------------
        // SEND IMAGE TO AI SERVICE
        // --------------------------------

        const imageBuffer = fs.readFileSync(req.file.path);

        const formData = new FormData();

        formData.append(
            "file",
            new Blob(
                [imageBuffer],
                { type: req.file.mimetype }
            ),
            req.file.originalname
        );

        const aiResponse = await fetch(
            `${process.env.AI_SERVICE_URL}/analyze`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!aiResponse.ok) {
            throw new Error("AI service request failed");
        }

        const aiResult = await aiResponse.json();

        if (!aiResult.success) {
            return res.status(400).json({
                success: false,
                message: "AI could not analyze the uploaded image"
            });
        }

        const detectedIssue = aiResult.issue;
        const aiConfidence = aiResult.confidence;

        console.log("AI detected:", detectedIssue);
        console.log("AI confidence:", aiConfidence);


        // --------------------------------
        // MAP AI ISSUE TO DEPARTMENT
        // --------------------------------

        const departmentMapping = {
            "Pothole": 1,
            "Damaged Road": 1,
            "Broken Street Light": 2,
            "Water Leakage": 3,
            "Garbage": 4,
            "Drainage Problem": 4,
            "Traffic Signal Problem": 5,
            "Electricity Problem": 6
        };

        let departmentId = null;

        if (detectedIssue !== "Needs Review") {

            departmentId = departmentMapping[detectedIssue];

            if (!departmentId) {
                return res.status(400).json({
                    success: false,
                    message: "Unable to determine the responsible department"
                });
            }
        }


        // --------------------------------
        // GET DEPARTMENT NAME
        // --------------------------------

        let departmentName = "Needs Manual Review";

        if (departmentId) {

            const [departmentRows] = await db.query(
                `SELECT department_name
                 FROM departments
                 WHERE department_id = ?`,
                [departmentId]
            );

            if (departmentRows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Department not found"
                });
            }

            departmentName =
                departmentRows[0].department_name;
        }


        // --------------------------------
        // UPLOAD IMAGE TO CLOUDINARY
        // --------------------------------

        const cloudinaryResult =
            await cloudinary.uploader.upload(
                req.file.path,
                {
                    folder: "civicfix/reports"
                }
            );

        const imageUrl =
            cloudinaryResult.secure_url;


        // --------------------------------
        // GENERATE REPORT CODE
        // --------------------------------

        const reportCode = `CIV-${Date.now()}`;


        // --------------------------------
        // INSERT REPORT
        // --------------------------------

        const [result] = await db.query(
            `INSERT INTO reports
            (
                report_code,
                user_id,
                category_id,
                department_id,
                description,
                latitude,
                longitude,
                address,
                image_url,
                ai_detected_issue,
                ai_confidence
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                reportCode,
                user_id,
                null,
                departmentId,
                description,
                latitude || null,
                longitude || null,
                address || null,
                imageUrl,
                detectedIssue,
                aiConfidence
            ]
        );


        // --------------------------------
        // ADD INITIAL STATUS HISTORY
        // --------------------------------

        await db.query(
            `INSERT INTO status_history
            (report_id, status, remarks, updated_by)
            VALUES (?, ?, ?, ?)`,
            [
                result.insertId,
                "Submitted",
                `AI detected: ${detectedIssue} (${aiConfidence}% confidence)`,
                user_id
            ]
        );


        // --------------------------------
        // RESPONSE
        // --------------------------------

        res.status(201).json({
            success: true,
            message: "Report submitted successfully",
            report_id: result.insertId,
            report_code: reportCode,
            ai_detected_issue: detectedIssue,
            ai_confidence: aiConfidence,
            department_id: departmentId,
            department_name: departmentName,
            image_url: imageUrl,
            status: "Submitted"
        });

    } catch (error) {

        console.error(
            "Create report error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create report"
        });
    }
};


// ======================================================
// GET MY REPORTS
// ======================================================

const getMyReports = async (req, res) => {

    try {

        const user_id = req.user.user_id;

        const [reports] = await db.query(
            `SELECT
                r.report_id,
                r.report_code,
                c.category_name,
                r.ai_detected_issue,
                r.ai_confidence,
                d.department_name,
                r.description,
                r.latitude,
                r.longitude,
                r.address,
                r.image_url,
                r.status,
                r.created_at,
                r.updated_at
             FROM reports r
             LEFT JOIN categories c
                ON r.category_id = c.category_id
             LEFT JOIN departments d
                ON r.department_id = d.department_id
             WHERE r.user_id = ?
             ORDER BY r.created_at DESC`,
            [user_id]
        );

        res.json({
            success: true,
            count: reports.length,
            reports: reports
        });

    } catch (error) {

        console.error(
            "Get my reports error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch reports"
        });
    }
};


// ======================================================
// GET SINGLE REPORT
// ======================================================

const getReportByCode = async (req, res) => {

    try {

        const user_id = req.user.user_id;
        const { report_code } = req.params;

        const [reports] = await db.query(
            `SELECT
                r.report_id,
                r.report_code,
                c.category_name,
                r.ai_detected_issue,
                r.ai_confidence,
                d.department_name,
                r.description,
                r.latitude,
                r.longitude,
                r.address,
                r.image_url,
                r.status,
                r.created_at,
                r.updated_at
             FROM reports r
             LEFT JOIN categories c
                ON r.category_id = c.category_id
             LEFT JOIN departments d
                ON r.department_id = d.department_id
             WHERE r.report_code = ?
             AND r.user_id = ?`,
            [report_code, user_id]
        );

        if (reports.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }

        const report = reports[0];

        const [history] = await db.query(
            `SELECT
                sh.status,
                sh.remarks,
                sh.updated_at
             FROM status_history sh
             WHERE sh.report_id = ?
             ORDER BY sh.updated_at ASC`,
            [report.report_id]
        );

        res.json({
            success: true,
            report: report,
            status_history: history
        });

    } catch (error) {

        console.error(
            "Get report error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch report"
        });
    }
};


// ======================================================
// GET DEPARTMENT REPORTS
// ======================================================

const getDepartmentReports = async (req, res) => {

    try {

        const department_id =
            req.user.department_id;

        if (!department_id) {

            return res.status(403).json({
                success: false,
                message: "Department access required"
            });
        }

        const [reports] = await db.query(
            `SELECT
                r.report_id,
                r.report_code,
                c.category_name,
                r.ai_detected_issue,
                r.ai_confidence,
                r.description,
                r.latitude,
                r.longitude,
                r.address,
                r.image_url,
                r.status,
                r.created_at,
                r.updated_at,
                u.name AS name,
                u.email AS email,
                u.phone AS phone
             FROM reports r
             LEFT JOIN categories c
                ON r.category_id = c.category_id
             JOIN users u
                ON r.user_id = u.user_id
             WHERE r.department_id = ?
             ORDER BY r.created_at DESC`,
            [department_id]
        );

        res.json({
            success: true,
            count: reports.length,
            reports: reports
        });

    } catch (error) {

        console.error(
            "Get department reports error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch department reports"
        });
    }
};


// ======================================================
// GET ALL REPORTS - ADMIN
// ======================================================

const getAllReports = async (req, res) => {

    try {

        const [reports] = await db.query(
    `SELECT
        r.report_id,
        r.report_code,
        c.category_name,
        r.ai_detected_issue,
        r.ai_confidence,
        r.department_id,
        d.department_name,
        r.description,
        r.latitude,
        r.longitude,
        r.address,
        r.image_url,
        r.status,
        r.created_at,
        r.updated_at,
        u.name AS citizen_name,
        u.email AS citizen_email,
        u.phone AS citizen_phone
     FROM reports r
     LEFT JOIN categories c
        ON r.category_id = c.category_id
     LEFT JOIN departments d
        ON r.department_id = d.department_id
     JOIN users u
        ON r.user_id = u.user_id
     ORDER BY r.created_at DESC`
);

        res.json({
            success: true,
            count: reports.length,
            reports: reports
        });

    } catch (error) {

        console.error(
            "Get all reports error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch all reports"
        });
    }
};


// ======================================================
// UPDATE REPORT STATUS
// ======================================================

const updateReportStatus = async (req, res) => {

    try {

        const department_id =
            req.user.department_id;

        const { report_id } = req.params;

        const { status, remarks } =
            req.body;

        const isAdmin =
            req.user.role === "admin";


        if (!isAdmin && !department_id) {

            return res.status(403).json({
                success: false,
                message: "Department access required"
            });
        }


        const allowedStatuses = [
            "Submitted",
            "Under Review",
            "Assigned",
            "In Progress",
            "Resolved",
            "Closed"
        ];


        if (
            !status ||
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }


        let query = `
            SELECT report_id
            FROM reports
            WHERE report_id = ?
        `;

        let params = [report_id];


        if (!isAdmin) {

            query += `
                AND department_id = ?
            `;

            params.push(department_id);
        }


        const [reports] =
            await db.query(
                query,
                params
            );


        if (reports.length === 0) {

            return res.status(404).json({
                success: false,
                message: isAdmin
                    ? "Report not found"
                    : "Report not found in your department"
            });
        }


        await db.query(
            `UPDATE reports
             SET status = ?
             WHERE report_id = ?`,
            [
                status,
                report_id
            ]
        );


        await db.query(
            `INSERT INTO status_history
             (report_id, status, remarks, updated_by)
             VALUES (?, ?, ?, ?)`,
            [
                report_id,
                status,
                remarks || null,
                req.user.user_id
            ]
        );


        res.json({
            success: true,
            message:
                "Report status updated successfully",
            report_id: report_id,
            status: status
        });

    } catch (error) {

        console.error(
            "Update status error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update report status"
        });
    }
};


// ======================================================
// MANUALLY ASSIGN DEPARTMENT - ADMIN
// ======================================================

const assignDepartment = async (req, res) => {

    try {

        const { report_id } = req.params;
        const { department_id } = req.body;


        // Department ID is required

        if (!department_id) {

            return res.status(400).json({
                success: false,
                message: "Department ID is required"
            });
        }


        // Check department exists

        const [departmentRows] =
            await db.query(
                `SELECT
                    department_id,
                    department_name
                 FROM departments
                 WHERE department_id = ?`,
                [department_id]
            );


        if (departmentRows.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Department not found"
            });
        }


        // Check report exists

        const [reportRows] =
            await db.query(
                `SELECT
                    report_id
                 FROM reports
                 WHERE report_id = ?`,
                [report_id]
            );


        if (reportRows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }


        // Assign department

        const [updateResult] = await db.query(
    `UPDATE reports
     SET department_id = ?
     WHERE report_id = ?`,
    [
        department_id,
        report_id
    ]
);

console.log("UPDATE RESULT:", updateResult);


        const departmentName =
            departmentRows[0].department_name;


        res.json({
            success: true,
            message:
                "Department assigned successfully",
            report_id: report_id,
            department_id: department_id,
            department_name: departmentName
        });

    } catch (error) {

        console.error(
            "Assign department error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to assign department"
        });
    }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
    createReport,
    getMyReports,
    getReportByCode,
    getDepartmentReports,
    updateReportStatus,
    getAllReports,
    assignDepartment
};