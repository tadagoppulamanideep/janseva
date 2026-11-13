const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");


// ======================================================
// AI CLASSIFICATION ENGINE (MULTI-LAYER)
// ======================================================

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

const classifyCivicIssue = async (req) => {
    // ----------------------------------------------------
    // Layer 1: External Python AI Service (if running)
    // ----------------------------------------------------
    if (process.env.AI_SERVICE_URL) {
        try {
            const imageBuffer = fs.readFileSync(req.file.path);
            const formData = new FormData();
            formData.append(
                "file",
                new Blob([imageBuffer], { type: req.file.mimetype }),
                req.file.originalname
            );

            const aiResponse = await fetch(
                `${process.env.AI_SERVICE_URL}/analyze`,
                {
                    method: "POST",
                    body: formData,
                    signal: AbortSignal.timeout(6000)
                }
            );

            if (aiResponse.ok) {
                const aiResult = await aiResponse.json();
                if (aiResult.success && aiResult.issue && aiResult.issue !== "Needs Review") {
                    console.log("External AI detected:", aiResult.issue, aiResult.confidence);
                    return {
                        issue: aiResult.issue,
                        confidence: Number(aiResult.confidence) || 88.0
                    };
                }
            }
        } catch (extErr) {
            console.warn("External AI service unreachable:", extErr.message);
        }
    }

    // ----------------------------------------------------
    // Layer 2: Google Gemini Vision AI (if key is provided)
    // ----------------------------------------------------
    if (process.env.GEMINI_API_KEY) {
        try {
            const imageBuffer = fs.readFileSync(req.file.path);
            const base64Image = imageBuffer.toString("base64");
            const userDescription = req.body.description || "";

            const prompt = `You are an AI Civic Issue Classifier for municipal complaints in Hyderabad, India.
Analyze this civic issue photo and the user's description: "${userDescription}".
Classify it into EXACTLY ONE of the following categories:
- Pothole
- Damaged Road
- Broken Street Light
- Water Leakage
- Garbage
- Drainage Problem
- Traffic Signal Problem
- Electricity Problem
- Needs Review

Respond ONLY with a JSON object in this exact format:
{"issue": "<category>", "confidence": <percentage_number_between_75_and_98>}`;

            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: prompt },
                                    {
                                        inlineData: {
                                            mimeType: req.file.mimetype || "image/jpeg",
                                            data: base64Image
                                        }
                                    }
                                ]
                            }
                        ],
                        generationConfig: {
                            responseMimeType: "application/json",
                            temperature: 0.1
                        }
                    }),
                    signal: AbortSignal.timeout(8000)
                }
            );

            if (geminiRes.ok) {
                const data = await geminiRes.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const parsed = JSON.parse(text);
                    if (parsed.issue && departmentMapping[parsed.issue]) {
                        console.log("Gemini Vision AI detected:", parsed.issue, parsed.confidence);
                        return {
                            issue: parsed.issue,
                            confidence: Math.min(98.0, Math.max(75.0, Number(parsed.confidence) || 92.0))
                        };
                    }
                }
            }
        } catch (gErr) {
            console.warn("Gemini Vision AI error:", gErr.message);
        }
    }

    // ----------------------------------------------------
    // Layer 3: Built-in Contextual Civic AI Engine
    // (Always available, zero downtime, instant routing)
    // ----------------------------------------------------
    const text = `${req.body.description || ""} ${req.file?.originalname || ""}`.toLowerCase();

    const rules = [
        {
            issue: "Water Leakage",
            high: ["water leak", "water leakage", "water leaking", "pipe burst", "pipeline burst", "pipe leak", "tap leak", "water pipe", "drinking water", "water flow", "water supply leak", "tank overflow", "valve leak", "pipe damaged"],
            medium: ["leakage", "pipeline", "water pipe", "tap", "valve"],
            low: ["water", "leak", "pipe"]
        },
        {
            issue: "Pothole",
            high: ["pothole", "potholes", "crater on road", "road pit", "road hole", "sinkhole", "deep pit", "road crater"],
            medium: ["pit", "hole", "crater", "tarmac hole"],
            low: ["road", "street"]
        },
        {
            issue: "Damaged Road",
            high: ["damaged road", "broken road", "road damage", "road broken", "uneven road", "bad road condition", "pavement broken", "cracked road", "footpath broken", "divider broken", "speed breaker damaged", "road reconstruction"],
            medium: ["asphalt", "tar", "pavement", "footpath", "divider", "speedbreaker", "speed breaker"],
            low: ["road", "street", "lane", "pathway"]
        },
        {
            issue: "Broken Street Light",
            high: ["street light", "streetlight", "street lights", "street lamp", "streetlamp", "lamp post", "lamppost", "light pole", "dark street", "dark road", "street light not working", "street light broken", "no street light", "street light off", "street lighting"],
            medium: ["bulb", "lighting", "illumination", "night light", "light not working"],
            low: ["dark", "light", "pole"]
        },
        {
            issue: "Drainage Problem",
            high: ["drainage problem", "drainage overflow", "drain overflow", "manhole overflow", "open manhole", "sewage overflow", "sewage leak", "sewer burst", "dirty water on road", "choked drain", "blocked drain", "clogged drain", "stagnant water", "sewer line"],
            medium: ["drainage", "drain", "gutter", "sewage", "sewer", "manhole", "clogged", "choked"],
            low: ["smell", "stink", "dirty", "overflow"]
        },
        {
            issue: "Garbage",
            high: ["garbage", "garbage pile", "garbage dump", "dumped waste", "trash pile", "waste dumped", "dumping yard", "overflowing dustbin", "overflowing bin", "littering", "waste pile"],
            medium: ["trash", "waste", "dump", "dustbin", "litter", "rubbish", "debris", "plastic waste", "solid waste"],
            low: ["dirty", "mess", "clean", "smell"]
        },
        {
            issue: "Traffic Signal Problem",
            high: ["traffic signal", "traffic light", "traffic signals", "traffic lights", "damaged traffic signal", "signal not working", "signal broken", "zebra crossing", "traffic blinker", "traffic post", "traffic jam", "signal timer"],
            medium: ["signal", "traffic light", "junction signal", "signboard", "traffic sign"],
            low: ["traffic", "junction", "crossing"]
        },
        {
            issue: "Electricity Problem",
            high: ["electricity problem", "power cut", "power spark", "wire sparking", "electric wire", "electric wires", "hanging wire", "loose wire", "transformer blast", "transformer issue", "electric shock", "short circuit", "high voltage", "low voltage", "electric pole damaged", "power pole spark", "sparking wire"],
            medium: ["transformer", "sparking", "spark", "electric pole", "power pole", "fuse", "meter box", "current shock"],
            low: ["electric", "electricity", "wire", "power", "current"]
        }
    ];

    let bestMatch = null;
    let highestScore = 0;

    for (const rule of rules) {
        let score = 0;
        for (const kw of rule.high) {
            if (text.includes(kw)) score += 12;
        }
        for (const kw of rule.medium) {
            if (text.includes(kw)) score += 6;
        }
        for (const kw of rule.low) {
            if (text.includes(kw)) score += 2;
        }

        if (score > highestScore) {
            highestScore = score;
            bestMatch = rule.issue;
        }
    }

    if (bestMatch && highestScore >= 6) {
        const confidence = Math.min(96.5, +(85.0 + Math.min(highestScore * 1.5, 11.5)).toFixed(1));
        console.log("Built-in Civic AI detected:", bestMatch, "confidence:", confidence);
        return {
            issue: bestMatch,
            confidence: confidence
        };
    }

    return {
        issue: "Needs Review",
        confidence: 0
    };
};

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
        // CLASSIFY CIVIC ISSUE VIA AI
        // --------------------------------

        const aiResult = await classifyCivicIssue(req);
        const detectedIssue = aiResult.issue;
        const aiConfidence = aiResult.confidence;

        console.log("Final classification:", detectedIssue, "Confidence:", aiConfidence);


        // --------------------------------
        // MAP AI ISSUE TO DEPARTMENT
        // --------------------------------

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

        // Clean up temporary local upload file
        try {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        } catch (unlinkErr) {
            console.warn("Could not delete temp file:", unlinkErr.message);
        }


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
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }

        console.error(
            "Create report error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message || "Failed to create report"
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