import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
    const [reports, setReports] = useState([]);
    const [message, setMessage] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [assigningId, setAssigningId] = useState(null);
    const [selectedDepartments, setSelectedDepartments] = useState({});
    const [selectedFilter, setSelectedFilter] = useState("all");

    const statuses = [
        "Submitted",
        "Under Review",
        "Assigned",
        "In Progress",
        "Resolved",
        "Closed"
    ];

    const departments = [
        {
            id: 1,
            name: "GHMC - Roads Department"
        },
        {
            id: 2,
            name: "GHMC - Electrical Department"
        },
        {
            id: 3,
            name: "HMWSSB - Water Department"
        },
        {
            id: 4,
            name: "GHMC - Sanitation Department"
        },
        {
            id: 5,
            name: "Hyderabad Traffic Police"
        },
        {
            id: 6,
            name: "TGSPDCL - Electricity Department"
        }
    ];

    // ======================================================
    // FETCH REPORTS
    // ======================================================

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/reports/admin", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {

                console.log("ADMIN REPORTS:", response.data.reports);
                setReports(response.data.reports || []);
                setMessage("");
            }

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to load reports"
            );
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // ======================================================
    // STATUS COUNT
    // ======================================================

    const getCount = (status) => {
        return reports.filter(
            (report) => report.status === status
        ).length;
    };

    // ======================================================
    // MANUAL REVIEW REPORTS
    // ======================================================

    const manualReviewReports = useMemo(() => {
        return reports.filter(
            (report) =>
                report.ai_detected_issue === "Needs Review" &&
                !report.department_id
        );
    }, [reports]);

    // ======================================================
    // ACTIVE REPORTS
    // ======================================================

    const activeReports = useMemo(() => {
        return reports.filter(
            (report) =>
                report.status !== "Resolved" &&
                report.status !== "Closed"
        );
    }, [reports]);

    // ======================================================
    // DEPARTMENT SUMMARY
    // ======================================================

    const getDepartmentReports = (departmentId) => {
        return reports.filter(
            (report) =>
                Number(report.department_id) ===
                Number(departmentId)
        );
    };

    const getDepartmentActiveCount = (departmentId) => {
        return getDepartmentReports(departmentId).filter(
            (report) =>
                report.status !== "Resolved" &&
                report.status !== "Closed"
        ).length;
    };

    const getDepartmentResolvedCount = (departmentId) => {
        return getDepartmentReports(departmentId).filter(
            (report) =>
                report.status === "Resolved" ||
                report.status === "Closed"
        ).length;
    };

    // ======================================================
    // FILTERED REPORTS
    // ======================================================

    const filteredReports = useMemo(() => {

        if (selectedFilter === "all") {
            return reports;
        }

        return reports.filter(
            (report) =>
                Number(report.department_id) ===
                Number(selectedFilter)
        );

    }, [reports, selectedFilter]);

    // ======================================================
    // UPDATE STATUS
    // ======================================================

    const updateStatus = async (
        reportId,
        newStatus
    ) => {

        try {

            setUpdatingId(reportId);
            setMessage("");

            const token =
                localStorage.getItem("token");

            const response = await api.put(
                `/reports/${reportId}/status`,
                {
                    status: newStatus,
                    remarks:
                        `Status updated to ${newStatus}`
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setMessage(
                    "✅ Report status updated successfully"
                );

                await fetchReports();
            }

        } catch (error) {

            console.error(
                "STATUS UPDATE ERROR:",
                error
            );

            setMessage(
                `❌ Error: ${
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to update report status"
                }`
            );

        } finally {

            setUpdatingId(null);

        }
    };

    // ======================================================
    // SELECT DEPARTMENT
    // ======================================================

    const handleDepartmentChange = (
        reportId,
        departmentId
    ) => {

        setSelectedDepartments(
            (previous) => ({
                ...previous,
                [reportId]: departmentId
            })
        );

    };

    // ======================================================
    // ASSIGN DEPARTMENT
    // ======================================================

    const assignDepartment = async (
        reportId
    ) => {

        const departmentId =
            selectedDepartments[reportId];

        if (!departmentId) {

            setMessage(
                "⚠️ Please select a department first."
            );

            return;
        }

        try {

            setAssigningId(reportId);
            setMessage("");

            const token =
                localStorage.getItem("token");

            const response = await api.put(
                `/reports/${reportId}/department`,
                {
                    department_id:
                        Number(departmentId)
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {

                setMessage(
                    "✅ Department assigned successfully"
                );

                setSelectedDepartments(
                    (previous) => {

                        const updated = {
                            ...previous
                        };

                        delete updated[reportId];

                        return updated;
                    }
                );

                await fetchReports();
            }

        } catch (error) {

            console.error(
                "ASSIGN DEPARTMENT ERROR:",
                error
            );

            setMessage(
                `❌ Error: ${
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to assign department"
                }`
            );

        } finally {

            setAssigningId(null);

        }
    };

    return (
        <div className="admin-container">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="admin-header">

                <div>
                    <div className="page-badge">
                        ⚙️ Administration
                    </div>

                    <h1>
                        JanSeva Admin Dashboard
                    </h1>

                    <p>
                        Monitor civic complaints,
                        review AI classifications and
                        manage department assignments.
                    </p>
                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={fetchReports}
                >
                    🔄 Refresh
                </button>

            </div>

            {/* ==================================================
                MESSAGE
            ================================================== */}

            {message && (
                <div className="admin-message">
                    {message}
                </div>
            )}

            {/* ==================================================
                OVERALL SUMMARY
            ================================================== */}

            <section className="admin-summary-section">

                <div className="admin-section-heading">
                    <div>
                        <h2>Overall Summary</h2>
                        <p>
                            Quick overview of all civic complaints
                        </p>
                    </div>
                </div>

                <div className="admin-stats-grid">

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            📋
                        </div>

                        <div>
                            <h3>
                                {reports.length}
                            </h3>

                            <p>
                                Total Reports
                            </p>
                        </div>
                    </div>

                    <div className="admin-stat-card manual-stat">
                        <div className="admin-stat-icon">
                            ⚠️
                        </div>

                        <div>
                            <h3>
                                {manualReviewReports.length}
                            </h3>

                            <p>
                                Manual Review
                            </p>
                        </div>
                    </div>

                    <div className="admin-stat-card active-stat">
                        <div className="admin-stat-icon">
                            🔄
                        </div>

                        <div>
                            <h3>
                                {activeReports.length}
                            </h3>

                            <p>
                                Active Reports
                            </p>
                        </div>
                    </div>

                    <div className="admin-stat-card resolved-stat">
                        <div className="admin-stat-icon">
                            ✅
                        </div>

                        <div>
                            <h3>
                                {getCount("Resolved")}
                            </h3>

                            <p>
                                Resolved
                            </p>
                        </div>
                    </div>

                    <div className="admin-stat-card closed-stat">
                        <div className="admin-stat-icon">
                            🔒
                        </div>

                        <div>
                            <h3>
                                {getCount("Closed")}
                            </h3>

                            <p>
                                Closed
                            </p>
                        </div>
                    </div>

                </div>

            </section>

            {/* ==================================================
                MANUAL REVIEW
            ================================================== */}

            {manualReviewReports.length > 0 && (

                <section className="manual-review-section">

                    <div className="manual-review-heading">

                        <div>
                            <div className="page-badge warning-badge">
                                ⚠️ Action Required
                            </div>

                            <h2>
                                Manual Review Required
                            </h2>

                            <p>
                                These reports could not be
                                confidently classified by AI.
                                Please review and assign a department.
                            </p>
                        </div>

                        <div className="manual-count">
                            {manualReviewReports.length}
                            <span>
                                Reports
                            </span>
                        </div>

                    </div>

                    <div className="manual-review-list">

                        {manualReviewReports.map(
                            (report) => (

                                <div
                                    className="manual-review-card"
                                    key={report.report_id}
                                >

                                    <div className="manual-report-top">

                                        <div>
                                            <h3>
                                                {report.report_code}
                                            </h3>

                                            <p>
                                                {report.description}
                                            </p>
                                        </div>

                                        <span className="manual-confidence">
                                            {report.ai_confidence
                                                ? `${report.ai_confidence}%`
                                                : "N/A"}
                                        </span>

                                    </div>

                                    <div className="manual-report-info">

                                        <span>
                                            🤖 AI:
                                            {" "}
                                            {report.original_prediction ||
                                                "Needs Review"}
                                        </span>

                                        <span>
                                            📍
                                            {" "}
                                            {report.address ||
                                                "Location unavailable"}
                                        </span>

                                    </div>

                                    {report.image_url && (

                                        <img
                                            className="manual-review-image"
                                            src={report.image_url}
                                            alt="Civic issue"
                                        />

                                    )}

                                    <div className="manual-assignment">

                                        <div>

                                            <label>
                                                Select Department
                                            </label>

                                            <select
                                                value={
                                                    selectedDepartments[
                                                        report.report_id
                                                    ] || ""
                                                }
                                                onChange={(e) =>
                                                    handleDepartmentChange(
                                                        report.report_id,
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    assigningId ===
                                                    report.report_id
                                                }
                                            >

                                                <option value="">
                                                    -- Select Department --
                                                </option>

                                                {departments.map(
                                                    (department) => (

                                                        <option
                                                            key={
                                                                department.id
                                                            }
                                                            value={
                                                                department.id
                                                            }
                                                        >
                                                            {
                                                                department.name
                                                            }
                                                        </option>

                                                    )
                                                )}

                                            </select>

                                        </div>

                                        <button
                                            className="manual-assign-btn"
                                            onClick={() =>
                                                assignDepartment(
                                                    report.report_id
                                                )
                                            }
                                            disabled={
                                                assigningId ===
                                                report.report_id
                                            }
                                        >

                                            {assigningId ===
                                            report.report_id
                                                ? "Assigning..."
                                                : "Assign Department"}

                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>

            )}

            {/* ==================================================
                DEPARTMENT SUMMARY
            ================================================== */}

            <section className="department-summary-section">

                <div className="admin-section-heading">

                    <div>
                        <h2>
                            Department Summary
                        </h2>

                        <p>
                            See how many complaints are assigned
                            to each department.
                        </p>
                    </div>

                </div>

                <div className="department-summary-grid">

                    {departments.map(
                        (department) => {

                            const departmentReports =
                                getDepartmentReports(
                                    department.id
                                );

                            const total =
                                departmentReports.length;

                            const active =
                                getDepartmentActiveCount(
                                    department.id
                                );

                            const resolved =
                                getDepartmentResolvedCount(
                                    department.id
                                );

                            return (

                                <div
                                    className="department-summary-card"
                                    key={department.id}
                                    onClick={() =>
                                        setSelectedFilter(
                                            String(
                                                department.id
                                            )
                                        )
                                    }
                                >

                                    <div className="department-card-icon">
                                        🏢
                                    </div>

                                    <div className="department-card-content">

                                        <h3>
                                            {department.name}
                                        </h3>

                                        <div className="department-total">
                                            {total}
                                        </div>

                                        <p>
                                            Total Reports
                                        </p>

                                        <div className="department-mini-stats">

                                            <span>
                                                🔄 {active} Active
                                            </span>

                                            <span>
                                                ✅ {resolved} Resolved
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            );
                        }
                    )}

                </div>

            </section>

            {/* ==================================================
                DEPARTMENT FILTER
            ================================================== */}

            <section className="admin-details-section">

                <div className="admin-details-header">

                    <div>
                        <h2>
                            Detailed Reports
                        </h2>

                        <p>
                            View individual complaints by department.
                        </p>
                    </div>

                    <div className="department-filter">

                        <label>
                            Department
                        </label>

                        <select
                            value={selectedFilter}
                            onChange={(e) =>
                                setSelectedFilter(
                                    e.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Departments
                            </option>

                            {departments.map(
                                (department) => (

                                    <option
                                        key={department.id}
                                        value={department.id}
                                    >
                                        {department.name}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                </div>

                <div className="selected-department-count">

                    {selectedFilter === "all"
                        ? `${filteredReports.length} reports`
                        : `${
                            filteredReports.length
                        } reports in ${
                            departments.find(
                                (department) =>
                                    String(
                                        department.id
                                    ) ===
                                    String(
                                        selectedFilter
                                    )
                            )?.name
                        }`
                    }

                </div>

                {/* ==================================================
                    NO REPORTS
                ================================================== */}

                {filteredReports.length === 0 ? (

                    <div className="empty-reports">

                        <div className="empty-icon">
                            📭
                        </div>

                        <h2>
                            No Reports Found
                        </h2>

                        <p>
                            There are no reports for
                            this selection.
                        </p>

                    </div>

                ) : (

                    <div className="reports-list">

                        {filteredReports.map(
                            (report) => (

                                <div
                                    className="report-card admin-report-card"
                                    key={report.report_id}
                                >

                                    {/* REPORT HEADER */}

                                    <div className="report-header">

                                        <div>
                                            <h2>
                                                {report.report_code}
                                            </h2>

                                            <span className="admin-report-department">
                                                🏢{" "}
                                                {report.department_name ||
                                                    "Needs Manual Review"}
                                            </span>
                                        </div>

                                        <span className="status-badge">
                                            {report.status}
                                        </span>

                                    </div>

                                    {/* AI */}

                                    <div className="admin-ai-info">

                                        <p>
                                            <strong>
                                                🤖 AI Detected Issue:
                                            </strong>{" "}

                                            {report.ai_detected_issue ||
                                                report.category_name ||
                                                "Not detected"}
                                        </p>

                                        <p>
                                            <strong>
                                                📊 AI Confidence:
                                            </strong>{" "}

                                            {report.ai_confidence
                                                ? `${report.ai_confidence}%`
                                                : "Not available"}
                                        </p>

                                    </div>

                                    {/* CITIZEN */}

                                    <div className="admin-info-grid">

                                        <div>
                                            <strong>
                                                Citizen
                                            </strong>

                                            <span>
                                                {report.citizen_name ||
                                                    "Not available"}
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                Email
                                            </strong>

                                            <span>
                                                {report.citizen_email ||
                                                    "Not available"}
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                Phone
                                            </strong>

                                            <span>
                                                {report.citizen_phone ||
                                                    "Not available"}
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                Created
                                            </strong>

                                            <span>
                                                {new Date(
                                                    report.created_at
                                                ).toLocaleString()}
                                            </span>
                                        </div>

                                    </div>

                                    {/* DESCRIPTION */}

                                    <div className="admin-report-detail">

                                        <strong>
                                            Description
                                        </strong>

                                        <p>
                                            {report.description}
                                        </p>

                                    </div>

                                    {/* LOCATION */}

                                    <div className="admin-report-detail">

                                        <strong>
                                            📍 Location
                                        </strong>

                                        <p>
                                            {report.address ||
                                                "Not provided"}
                                        </p>

                                    </div>

                                    {/* PHOTO */}

                                    {report.image_url && (

                                        <div className="admin-report-photo">

                                            <strong>
                                                📷 Issue Photo
                                            </strong>

                                            <img
                                                src={
                                                    report.image_url
                                                }
                                                alt="Civic issue"
                                            />

                                        </div>

                                    )}

                                    {/* GPS */}

                                    {report.latitude &&
                                        report.longitude && (

                                        <div className="admin-gps">

                                            <strong>
                                                GPS
                                            </strong>

                                            <span>
                                                {report.latitude},{" "}
                                                {report.longitude}
                                            </span>

                                        </div>

                                    )}

                                    {/* STATUS */}

                                    <div className="admin-status-control">

                                        <label>
                                            Update Status
                                        </label>

                                        <select
                                            value={
                                                report.status
                                            }
                                            disabled={
                                                updatingId ===
                                                report.report_id
                                            }
                                            onChange={(e) =>
                                                updateStatus(
                                                    report.report_id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            {statuses.map(
                                                (status) => (

                                                    <option
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                        {updatingId ===
                                            report.report_id && (

                                            <span>
                                                Updating...
                                            </span>

                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>

        </div>
    );
}

export default AdminDashboard;