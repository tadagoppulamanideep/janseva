import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    return (
        <div className="citizen-dashboard">

            {/* Hero Section */}
            <section className="dashboard-hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        🏛️ Citizen Civic Service
                    </div>

                    <h1>
                        Welcome to <span>JanaSeva</span> 👋
                    </h1>

                    {user && (
                        <p className="welcome-text">
                            Hello, <strong>{user.name}</strong>!
                        </p>
                    )}

                    <p className="hero-description">
                        Report civic problems in your area,
                        track complaints and help make your
                        community cleaner, safer and better.
                    </p>

                    <div className="hero-buttons">

                        <button
                            className="hero-primary-btn"
                            onClick={() => navigate("/report")}
                        >
                            📝 Report an Issue
                        </button>

                        <button
                            className="hero-secondary-btn"
                            onClick={() => navigate("/track")}
                        >
                            🔍 Track Report
                        </button>

                    </div>

                </div>

                <div className="hero-icon">
                    🏙️
                </div>

            </section>


            {/* Quick Actions */}
            <section className="dashboard-section">

                <div className="section-heading">
                    <h2>Quick Actions</h2>

                    <p>
                        Manage your civic complaints easily
                    </p>
                </div>

                <div className="dashboard-cards">

                    {/* Report Issue */}
                    <div className="dashboard-card">

                        <div className="card-icon report-icon">
                            📝
                        </div>

                        <h2>Report an Issue</h2>

                        <p>
                            Report potholes, damaged roads,
                            street lights, garbage, water
                            leakage and other civic problems.
                        </p>

                        <button
                            onClick={() => navigate("/report")}
                        >
                            Report Issue →
                        </button>

                    </div>


                    {/* My Reports */}
                    <div className="dashboard-card">

                        <div className="card-icon reports-icon">
                            📋
                        </div>

                        <h2>My Reports</h2>

                        <p>
                            View the complaints you have
                            submitted and check their current
                            status and details.
                        </p>

                        <button
                            onClick={() => navigate("/my-reports")}
                        >
                            View My Reports →
                        </button>

                    </div>


                    {/* Track Report */}
                    <div className="dashboard-card">

                        <div className="card-icon track-icon">
                            🔍
                        </div>

                        <h2>Track a Report</h2>

                        <p>
                            Enter your unique report code and
                            follow the progress of your civic
                            complaint.
                        </p>

                        <button
                            onClick={() => navigate("/track")}
                        >
                            Track Report →
                        </button>

                    </div>

                </div>

            </section>


            {/* AI Feature */}
            <section className="ai-feature-section">

                <div className="ai-feature-icon">
                    🤖
                </div>

                <div className="ai-feature-content">

                    <h2>Smart AI-Powered Complaint Routing</h2>

                    <p>
                        Upload a photo of the civic problem and
                        JanaSeva's AI analyzes the image to identify
                        the issue and route it to the appropriate
                        department.
                    </p>

                    <div className="ai-features">

                        <span>📷 Image Analysis</span>

                        <span>🤖 AI Detection</span>

                        <span>🏢 Department Routing</span>

                        <span>📊 Confidence Check</span>

                    </div>

                </div>

            </section>


            {/* How JanaSeva Works */}
            <section className="how-section">

                <div className="section-heading">

                    <h2>How JanaSeva Works</h2>

                    <p>
                        From reporting a problem to getting it resolved
                    </p>

                </div>

                <div className="steps-container">

                    {/* Step 1 */}
                    <div className="step-card">

                        <div className="step-number">
                            1
                        </div>

                        <div className="step-icon">
                            📸
                        </div>

                        <h3>Report</h3>

                        <p>
                            Submit the civic problem with
                            a description, location and photo.
                        </p>

                    </div>


                    {/* Step 2 */}
                    <div className="step-card">

                        <div className="step-number">
                            2
                        </div>

                        <div className="step-icon">
                            🤖
                        </div>

                        <h3>AI Analysis</h3>

                        <p>
                            AI analyzes the uploaded image
                            and identifies the civic issue.
                        </p>

                    </div>


                    {/* Step 3 */}
                    <div className="step-card">

                        <div className="step-number">
                            3
                        </div>

                        <div className="step-icon">
                            🏢
                        </div>

                        <h3>Department</h3>

                        <p>
                            The complaint is routed to the
                            relevant government department.
                        </p>

                    </div>


                    {/* Step 4 */}
                    <div className="step-card">

                        <div className="step-number">
                            4
                        </div>

                        <div className="step-icon">
                            ✅
                        </div>

                        <h3>Resolve</h3>

                        <p>
                            Track the complaint while the
                            department works to resolve it.
                        </p>

                    </div>

                </div>

            </section>


            {/* Citizen Message */}
            <section className="citizen-message">

                <h2>
                    Together, we can improve our community. 🤝
                </h2>

                <p>
                    Every report helps authorities identify
                    problems and improve public services.
                </p>

                <button
                    onClick={() => navigate("/report")}
                >
                    Report a Civic Issue
                </button>

            </section>

        </div>
    );
}

export default Dashboard;