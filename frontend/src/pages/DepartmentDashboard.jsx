import { useEffect, useState } from "react";
import api from "../services/api";

function DepartmentDashboard() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");


    const fetchReports = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/reports/department",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setReports(response.data.reports || []);

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Failed to load department reports."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        fetchReports();

    }, []);


    const getStatusClass = (status) => {

        switch (status) {

            case "Submitted":
                return "status-submitted";

            case "Under Review":
                return "status-review";

            case "Assigned":
                return "status-assigned";

            case "In Progress":
                return "status-progress";

            case "Resolved":
                return "status-resolved";

            case "Closed":
                return "status-closed";

            default:
                return "";

        }

    };


    const updateStatus = async (
        reportId,
        newStatus
    ) => {

        try {

            const token =
                localStorage.getItem("token");

            await api.put(

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

            setMessage(
                "Report status updated successfully."
            );

            fetchReports();

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Failed to update report status."
            );

        }

    };


    /* =====================================================
       STATISTICS
       ===================================================== */

    const totalReports =
        reports.length;


    const submitted =
        reports.filter(
            (report) =>
                report.status === "Submitted"
        ).length;


    const underReview =
        reports.filter(
            (report) =>
                report.status === "Under Review"
        ).length;


    const assigned =
        reports.filter(
            (report) =>
                report.status === "Assigned"
        ).length;


    const inProgress =
        reports.filter(
            (report) =>
                report.status === "In Progress"
        ).length;


    const resolved =
        reports.filter(
            (report) =>
                report.status === "Resolved"
        ).length;


    if (loading) {

        return (

            <div className="department-container">

                <div className="department-loading-card">

                    <div className="department-loading-icon">
                        🏢
                    </div>

                    <h2>
                        Loading Department Dashboard
                    </h2>

                    <p>
                        Fetching reports assigned to your department...
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="department-container">


            {/* =====================================================
               PAGE HEADER
            ===================================================== */}

            <div className="department-page-header">

                <div className="department-page-badge">
                    🏢 Department Portal
                </div>

                <h1>
                    Department Dashboard
                </h1>

                <p>
                    Manage, update and resolve civic issues
                    assigned to your department.
                </p>

            </div>


            {/* =====================================================
               MESSAGE
            ===================================================== */}

            {message && (

                <div className="department-message">

                    <span>✓</span>

                    {message}

                </div>

            )}


            {/* =====================================================
               STATISTICS
            ===================================================== */}

            <div className="department-stats">


                {/* TOTAL REPORTS */}

                <div className="department-stat-card total-stat">

                    <div className="department-stat-icon">
                        📋
                    </div>

                    <div>

                        <h2>
                            {totalReports}
                        </h2>

                        <p>
                            Total Reports
                        </p>

                    </div>

                </div>


                {/* SUBMITTED */}

                <div className="department-stat-card submitted-stat">

                    <div className="department-stat-icon">
                        🆕
                    </div>

                    <div>

                        <h2>
                            {submitted}
                        </h2>

                        <p>
                            Submitted
                        </p>

                    </div>

                </div>


                {/* UNDER REVIEW */}

                <div className="department-stat-card review-stat">

                    <div className="department-stat-icon">
                        🔎
                    </div>

                    <div>

                        <h2>
                            {underReview}
                        </h2>

                        <p>
                            Under Review
                        </p>

                    </div>

                </div>


                {/* ASSIGNED */}

                <div className="department-stat-card assigned-stat">

                    <div className="department-stat-icon">
                        📌
                    </div>

                    <div>

                        <h2>
                            {assigned}
                        </h2>

                        <p>
                            Assigned
                        </p>

                    </div>

                </div>


                {/* IN PROGRESS */}

                <div className="department-stat-card progress-stat">

                    <div className="department-stat-icon">
                        🔧
                    </div>

                    <div>

                        <h2>
                            {inProgress}
                        </h2>

                        <p>
                            In Progress
                        </p>

                    </div>

                </div>


                {/* RESOLVED */}

                <div className="department-stat-card resolved-stat">

                    <div className="department-stat-icon">
                        ✅
                    </div>

                    <div>

                        <h2>
                            {resolved}
                        </h2>

                        <p>
                            Resolved
                        </p>

                    </div>

                </div>


            </div>


            {/* =====================================================
               REPORTS SECTION
            ===================================================== */}

            <div className="department-reports-section">


                <div className="department-section-heading">

                    <div>

                        <h2>
                            Assigned Reports
                        </h2>

                        <p>
                            Civic complaints currently assigned
                            to your department
                        </p>

                    </div>

                    <div className="department-report-count">

                        {totalReports} Reports

                    </div>

                </div>


                {reports.length === 0 ? (

                    <div className="department-empty">

                        <div className="department-empty-icon">
                            📭
                        </div>

                        <h3>
                            No Reports Assigned
                        </h3>

                        <p>
                            There are currently no reports
                            assigned to your department.
                        </p>

                    </div>

                ) : (

                    <div className="department-reports-list">


                        {reports.map((report) => (

                            <div
                                className="department-report-card"
                                key={report.report_id}
                            >


                                {/* =====================================================
                                   REPORT HEADER
                                ===================================================== */}

                                <div className="department-report-header">

                                    <div>

                                        <span className="report-label">
                                            REPORT CODE
                                        </span>

                                        <h2>
                                            {report.report_code}
                                        </h2>

                                    </div>

                                    <span
                                        className={`status-badge ${getStatusClass(
                                            report.status
                                        )}`}
                                    >
                                        {report.status}
                                    </span>

                                </div>


                                {/* =====================================================
                                   AI INFORMATION
                                ===================================================== */}

                                <div className="department-ai-banner">

                                    <div className="department-ai-icon">
                                        🤖
                                    </div>

                                    <div>

                                        <span>
                                            AI DETECTED ISSUE
                                        </span>

                                        <strong>
                                            {report.ai_detected_issue ||
                                                report.category_name ||
                                                "Not detected"}
                                        </strong>

                                    </div>

                                    <div className="department-confidence">

                                        <span>
                                            CONFIDENCE
                                        </span>

                                        <strong>
                                            {report.ai_confidence
                                                ? `${report.ai_confidence}%`
                                                : "N/A"}
                                        </strong>

                                    </div>

                                </div>


                                {/* =====================================================
                                   CITIZEN DETAILS
                                ===================================================== */}

                                <div className="department-details">


                                    <div>

                                        <span>
                                            👤
                                        </span>

                                        <div>

                                            <small>
                                                Citizen
                                            </small>

                                            <strong>
                                                {report.name ||
                                                    report.user_name ||
                                                    "Citizen"}
                                            </strong>

                                        </div>

                                    </div>


                                    <div>

                                        <span>
                                            📧
                                        </span>

                                        <div>

                                            <small>
                                                Email
                                            </small>

                                            <strong>
                                                {report.email ||
                                                    "Not available"}
                                            </strong>

                                        </div>

                                    </div>


                                    <div>

                                        <span>
                                            📞
                                        </span>

                                        <div>

                                            <small>
                                                Phone
                                            </small>

                                            <strong>
                                                {report.phone ||
                                                    "Not available"}
                                            </strong>

                                        </div>

                                    </div>


                                    <div>

                                        <span>
                                            📅
                                        </span>

                                        <div>

                                            <small>
                                                Submitted
                                            </small>

                                            <strong>
                                                {new Date(
                                                    report.created_at
                                                ).toLocaleString()}
                                            </strong>

                                        </div>

                                    </div>


                                </div>


                                {/* =====================================================
                                   DESCRIPTION
                                ===================================================== */}

                                <div className="department-info">

                                    <strong>
                                        📝 Description
                                    </strong>

                                    <p>
                                        {report.description}
                                    </p>

                                </div>


                                {/* =====================================================
                                   LOCATION
                                ===================================================== */}

                                {(report.address ||
                                    report.latitude ||
                                    report.longitude) && (

                                    <div className="department-info">

                                        <strong>
                                            📍 Location
                                        </strong>

                                        {report.address && (

                                            <p>
                                                {report.address}
                                            </p>

                                        )}

                                        {report.latitude &&
                                            report.longitude && (

                                            <small>
                                                GPS:{" "}
                                                {report.latitude},{" "}
                                                {report.longitude}
                                            </small>

                                        )}

                                    </div>

                                )}


                                {/* =====================================================
                                   PHOTO
                                ===================================================== */}

                                {report.image_url && (

                                    <div className="department-photo">

                                        <strong>
                                            📷 Uploaded Photo
                                        </strong>

                                        <img
                                            src={report.image_url}
                                            alt="Civic issue"
                                        />

                                    </div>

                                )}


                                {/* =====================================================
                                   STATUS UPDATE
                                ===================================================== */}

                                <div className="department-status-update">

                                    <div>

                                        <strong>
                                            Update Report Status
                                        </strong>

                                        <p>
                                            Change the current progress
                                            of this complaint.
                                        </p>

                                    </div>

                                    <select
                                        value={report.status}
                                        onChange={(e) =>
                                            updateStatus(
                                                report.report_id,
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="Submitted">
                                            Submitted
                                        </option>

                                        <option value="Under Review">
                                            Under Review
                                        </option>

                                        <option value="Assigned">
                                            Assigned
                                        </option>

                                        <option value="In Progress">
                                            In Progress
                                        </option>

                                        <option value="Resolved">
                                            Resolved
                                        </option>

                                        <option value="Closed">
                                            Closed
                                        </option>

                                    </select>

                                </div>


                            </div>

                        ))}


                    </div>

                )}


            </div>


        </div>

    );

}


export default DepartmentDashboard;