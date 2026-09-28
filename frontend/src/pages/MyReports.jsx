import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyReports() {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();


    const fetchReports = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await api.get(
                "/reports/my-reports",
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
                "Failed to load your reports."
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


    if (loading) {

        return (

            <div className="reports-container">

                <div className="reports-loading-card">

                    <div className="loading-icon">
                        📋
                    </div>

                    <h2>Loading Your Reports</h2>

                    <p>
                        Please wait while we fetch your complaints.
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="reports-container">

            {/* PAGE HEADER */}

            <div className="reports-title">

                <div className="reports-page-badge">
                    📋 Citizen Service Portal
                </div>

                <h1>
                    My Reports
                </h1>

                <p>
                    View and track the civic issues you have reported.
                </p>

            </div>


            {/* REPORT SUMMARY */}

            {!message && reports.length > 0 && (

                <div className="reports-summary">

                    <div className="summary-item">

                        <span className="summary-icon">
                            📊
                        </span>

                        <div>
                            <strong>
                                {reports.length}
                            </strong>

                            <span>
                                Total Reports
                            </span>
                        </div>

                    </div>


                    <div className="summary-item">

                        <span className="summary-icon">
                            🔄
                        </span>

                        <div>

                            <strong>
                                {reports.filter(
                                    (report) =>
                                        report.status !== "Resolved" &&
                                        report.status !== "Closed"
                                ).length}
                            </strong>

                            <span>
                                Active Reports
                            </span>

                        </div>

                    </div>


                    <div className="summary-item">

                        <span className="summary-icon">
                            ✅
                        </span>

                        <div>

                            <strong>
                                {reports.filter(
                                    (report) =>
                                        report.status === "Resolved" ||
                                        report.status === "Closed"
                                ).length}
                            </strong>

                            <span>
                                Resolved
                            </span>

                        </div>

                    </div>

                </div>

            )}


            {/* MESSAGE */}

            {message && (

                <div className="form-message">
                    {message}
                </div>

            )}


            {/* NO REPORTS */}

            {reports.length === 0 && !message ? (

                <div className="empty-reports">

                    <div className="empty-icon">
                        📋
                    </div>

                    <h2>
                        No Reports Yet
                    </h2>

                    <p>
                        You haven't submitted any civic issue
                        reports yet.
                    </p>

                    <button
                        onClick={() => navigate("/report")}
                    >
                        📝 Report an Issue
                    </button>

                </div>

            ) : (

                <div className="reports-list">

                    {reports.map((report) => (

                        <div
                            className="report-card polished-report-card"
                            key={report.report_id}
                        >

                            {/* HEADER */}

                            <div className="report-header">

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


                            <hr />


                            {/* MAIN DETAILS */}

                            <div className="report-details">

                                {/* AI ISSUE */}

                                <div className="detail-item">

                                    <span className="detail-icon">
                                        🤖
                                    </span>

                                    <div>

                                        <strong>
                                            AI Detected Issue
                                        </strong>

                                        <p>
                                            {report.ai_detected_issue ||
                                                report.category_name ||
                                                "Not detected"}
                                        </p>

                                    </div>

                                </div>


                                {/* CONFIDENCE */}

                                <div className="detail-item">

                                    <span className="detail-icon">
                                        🎯
                                    </span>

                                    <div>

                                        <strong>
                                            AI Confidence
                                        </strong>

                                        <p>
                                            {report.ai_confidence
                                                ? `${report.ai_confidence}%`
                                                : "Not available"}
                                        </p>

                                    </div>

                                </div>


                                {/* DEPARTMENT */}

                                <div className="detail-item">

                                    <span className="detail-icon">
                                        🏢
                                    </span>

                                    <div>

                                        <strong>
                                            Department
                                        </strong>

                                        <p>
                                            {report.department_name ||
                                                "Not assigned"}
                                        </p>

                                    </div>

                                </div>


                                {/* DATE */}

                                <div className="detail-item">

                                    <span className="detail-icon">
                                        📅
                                    </span>

                                    <div>

                                        <strong>
                                            Submitted
                                        </strong>

                                        <p>
                                            {new Date(
                                                report.created_at
                                            ).toLocaleString()}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* DESCRIPTION */}

                            <div className="report-info">

                                <strong>
                                    📝 Description
                                </strong>

                                <p>
                                    {report.description}
                                </p>

                            </div>


                            {/* LOCATION */}

                            {(report.address ||
                                report.latitude ||
                                report.longitude) && (

                                <div className="report-info">

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


                            {/* PHOTO */}

                            {report.image_url && (

                                <div className="report-photo">

                                    <div className="photo-title">
                                        <strong>
                                            📷 Uploaded Photo
                                        </strong>
                                    </div>

                                    <img
                                        src={report.image_url}
                                        alt="Civic issue"
                                    />

                                </div>

                            )}


                            {/* ACTION */}

                            <div className="report-action">

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/track?code=${report.report_code}`
                                        )
                                    }
                                >
                                    🔍 Track Report
                                </button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default MyReports;