import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

function TrackReport() {

    const [searchParams] = useSearchParams();

    const [reportCode, setReportCode] = useState(
        searchParams.get("code") || ""
    );

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");


    // STATUS CLASS
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


    // TRACK REPORT
    const trackReport = async (e) => {

        if (e) {
            e.preventDefault();
        }

        if (!reportCode.trim()) {

            setMessage("Please enter a report code.");
            setReport(null);

            return;
        }

        try {

            setLoading(true);
            setMessage("");
            setReport(null);

            const token =
                localStorage.getItem("token");

            const response = await api.get(
                `/reports/${reportCode.trim()}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setReport({

                ...response.data.report,

                history:
                    response.data.status_history || []

            });

        } catch (error) {

            console.error(error);

            setMessage(
                error.response?.data?.message ||
                "Report not found."
            );

        } finally {

            setLoading(false);

        }

    };


    // AUTO LOAD REPORT
    useEffect(() => {

        const code =
            searchParams.get("code");

        if (code) {

            setReportCode(code);

            trackReport();

        }

    }, []);


    return (

        <div className="track-page">

            {/* PAGE HEADER */}

            <div className="track-page-header">

                <div className="track-page-badge">
                    🔍 Report Tracking
                </div>

                <h1>
                    Track Your Report
                </h1>

                <p>
                    Check the latest status and progress
                    of your civic complaint.
                </p>

            </div>


            {/* SEARCH CARD */}

            <form
                className="track-search-card"
                onSubmit={trackReport}
            >

                <div className="track-search-icon">
                    🔎
                </div>

                <div className="track-search-content">

                    <h2>
                        Enter Report Code
                    </h2>

                    <p>
                        Use the unique report code received
                        after submitting your complaint.
                    </p>

                    <div className="track-search-row">

                        <input
                            type="text"
                            value={reportCode}
                            onChange={(e) =>
                                setReportCode(e.target.value)
                            }
                            placeholder="Example: CIV-1789484388441"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Searching..."
                                : "🔍 Track Report"
                            }
                        </button>

                    </div>

                </div>

            </form>


            {/* MESSAGE */}

            {message && (

                <div className="track-error-message">

                    <span>⚠️</span>

                    <div>
                        <strong>Unable to find report</strong>
                        <p>{message}</p>
                    </div>

                </div>

            )}


            {/* REPORT RESULT */}

            {report && (

                <div className="track-result">


                    {/* STATUS HEADER */}

                    <div className="track-status-card">

                        <div className="track-status-info">

                            <span className="track-small-label">
                                REPORT CODE
                            </span>

                            <h2>
                                {report.report_code}
                            </h2>

                            <p>
                                Your complaint is currently
                                <strong> {report.status}</strong>.
                            </p>

                        </div>

                        <span
                            className={`status-badge ${getStatusClass(
                                report.status
                            )}`}
                        >
                            {report.status}
                        </span>

                    </div>


                    {/* REPORT DETAILS */}

                    <div className="track-card">

                        <div className="track-card-heading">

                            <div className="track-card-heading-icon">
                                📋
                            </div>

                            <div>
                                <h2>
                                    Report Details
                                </h2>

                                <p>
                                    Information about your complaint
                                </p>
                            </div>

                        </div>


                        <div className="track-details-grid">


                            {/* AI ISSUE */}

                            <div className="track-detail">

                                <span>
                                    🤖
                                </span>

                                <div>

                                    <small>
                                        AI Detected Issue
                                    </small>

                                    <strong>
                                        {report.ai_detected_issue ||
                                            report.category_name ||
                                            "Not detected"}
                                    </strong>

                                </div>

                            </div>


                            {/* AI CONFIDENCE */}

                            <div className="track-detail">

                                <span>
                                    🎯
                                </span>

                                <div>

                                    <small>
                                        AI Confidence
                                    </small>

                                    <strong>
                                        {report.ai_confidence
                                            ? `${report.ai_confidence}%`
                                            : "Not available"}
                                    </strong>

                                </div>

                            </div>


                            {/* DEPARTMENT */}

                            <div className="track-detail">

                                <span>
                                    🏢
                                </span>

                                <div>

                                    <small>
                                        Assigned Department
                                    </small>

                                    <strong>
                                        {report.department_name ||
                                            "Not assigned"}
                                    </strong>

                                </div>

                            </div>


                            {/* SUBMITTED */}

                            <div className="track-detail">

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


                        {/* DESCRIPTION */}

                        <div className="track-info-box">

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

                            <div className="track-info-box">

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

                            <div className="track-photo">

                                <strong>
                                    📷 Uploaded Photo
                                </strong>

                                <img
                                    src={report.image_url}
                                    alt="Civic issue"
                                />

                            </div>

                        )}

                    </div>


                    {/* STATUS HISTORY */}

                    {report.history &&
                        report.history.length > 0 && (

                        <div className="track-card">

                            <div className="track-card-heading">

                                <div className="track-card-heading-icon">
                                    📊
                                </div>

                                <div>
                                    <h2>
                                        Status History
                                    </h2>

                                    <p>
                                        Follow the progress of your complaint
                                    </p>
                                </div>

                            </div>


                            <div className="status-timeline">

                                {report.history.map(
                                    (item, index) => (

                                        <div
                                            className="timeline-item"
                                            key={
                                                item.history_id ||
                                                index
                                            }
                                        >

                                            <div className="timeline-dot">
                                                ✓
                                            </div>


                                            <div className="timeline-content">

                                                <div className="timeline-header">

                                                    <strong>
                                                        {item.status}
                                                    </strong>

                                                    <span>
                                                        {new Date(
                                                            item.updated_at
                                                        ).toLocaleString()}
                                                    </span>

                                                </div>


                                                {item.remarks && (

                                                    <p>
                                                        {item.remarks}
                                                    </p>

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                </div>

            )}

        </div>

    );

}

export default TrackReport;