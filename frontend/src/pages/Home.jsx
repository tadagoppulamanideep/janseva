import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-page">

            {/* ================= HEADER ================= */}

            <header className="home-header">

                <div
                    className="home-logo"
                    onClick={() => navigate("/")}
                >
                    <span className="home-logo-icon">
                        🏛️
                    </span>

                    <span>
                        JanSeva
                    </span>
                </div>

                <div className="home-header-actions">

                    <button
                        className="home-login-btn"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>

                    <button
                        className="home-register-btn"
                        onClick={() => navigate("/register")}
                    >
                        Register
                    </button>

                </div>

            </header>


            {/* ================= HERO ================= */}

            <main className="home-hero">

                <div className="home-hero-content">

                    <div className="home-badge">
                        🏙️ Smart Civic Issue Reporting
                    </div>

                    <h1>
                        Report Civic Issues.
                        <br />
                        <span>
                            Make Your City Better.
                        </span>
                    </h1>

                    <p>
                        JanSeva makes it easy for citizens to
                        report civic problems, track complaints
                        and stay updated until the issue is resolved.
                    </p>

                    <div className="home-hero-buttons">

                        <button
                            className="home-primary-btn"
                            onClick={() => navigate("/login")}
                        >
                            📢 Report an Issue
                        </button>

                        <button
                            className="home-secondary-btn"
                            onClick={() => navigate("/track")}
                        >
                            🔎 Track a Report
                        </button>

                    </div>

                </div>


                {/* ================= HERO VISUAL ================= */}

                <div className="home-hero-visual">

                    <div className="home-city-card">

                        <div className="home-city-icon">
                            🏙️
                        </div>

                        <h3>
                            Better City,
                            <br />
                            Better Living
                        </h3>

                        <p>
                            Your report can help improve
                            your neighbourhood.
                        </p>

                        <div className="home-mini-reports">

                            <div>
                                <span>📍</span>
                                Location Based
                            </div>

                            <div>
                                <span>🤖</span>
                                AI Powered
                            </div>

                            <div>
                                <span>📊</span>
                                Track Status
                            </div>

                        </div>

                    </div>

                </div>

            </main>


            {/* ================= HOW IT WORKS ================= */}

            <section className="home-features">

                <div className="home-section-heading">

                    <div className="home-section-badge">
                        HOW IT WORKS
                    </div>

                    <h2>
                        From Problem to Solution
                    </h2>

                    <p>
                        JanSeva connects citizens with the
                        right civic department.
                    </p>

                </div>


                <div className="home-feature-grid">

                    <div className="home-feature-card">

                        <div className="home-feature-icon">
                            📸
                        </div>

                        <h3>
                            1. Report
                        </h3>

                        <p>
                            Upload a photo and describe
                            the civic problem.
                        </p>

                    </div>


                    <div className="home-feature-card">

                        <div className="home-feature-icon">
                            🤖
                        </div>

                        <h3>
                            2. AI Detection
                        </h3>

                        <p>
                            AI analyzes the image and helps
                            identify the appropriate department.
                        </p>

                    </div>


                    <div className="home-feature-card">

                        <div className="home-feature-icon">
                            🏢
                        </div>

                        <h3>
                            3. Department
                        </h3>

                        <p>
                            The complaint reaches the
                            relevant civic department.
                        </p>

                    </div>


                    <div className="home-feature-card">

                        <div className="home-feature-icon">
                            📊
                        </div>

                        <h3>
                            4. Track
                        </h3>

                        <p>
                            Track your complaint and
                            monitor its status.
                        </p>

                    </div>

                </div>

            </section>


            {/* ================= WHY JANSEVA ================= */}

            <section className="home-about">

                <div className="home-about-content">

                    <div className="home-section-badge">
                        ABOUT JANSEVA
                    </div>

                    <h2>
                        One Platform for
                        <br />
                        Civic Complaints
                    </h2>

                    <p>
                        JanSeva provides a simple digital platform
                        for citizens to report problems such as
                        potholes, damaged roads, broken street lights,
                        water issues, sanitation problems and other
                        civic concerns.
                    </p>

                    <button
                        className="home-about-btn"
                        onClick={() => navigate("/register")}
                    >
                        Get Started →
                    </button>

                </div>


                <div className="home-about-points">

                    <div className="home-about-point">

                        <span>
                            📍
                        </span>

                        <div>
                            <h3>
                                Location Based
                            </h3>

                            <p>
                                Report the exact location
                                of the civic issue.
                            </p>
                        </div>

                    </div>


                    <div className="home-about-point">

                        <span>
                            🤖
                        </span>

                        <div>
                            <h3>
                                AI Assisted
                            </h3>

                            <p>
                                Image analysis helps identify
                                the type of civic problem.
                            </p>
                        </div>

                    </div>


                    <div className="home-about-point">

                        <span>
                            🔎
                        </span>

                        <div>
                            <h3>
                                Transparent Tracking
                            </h3>

                            <p>
                                Follow your complaint using
                                your report ID.
                            </p>
                        </div>

                    </div>

                </div>

            </section>


            {/* ================= FOOTER ================= */}

            <footer className="home-footer">

                <div>
                    <strong>
                        🏛️ JanSeva
                    </strong>

                    <span>
                        Smart civic issue reporting platform
                    </span>
                </div>

                <p>
                    © {new Date().getFullYear()} JanSeva
                </p>

            </footer>

        </div>
    );
}

export default Home;