import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    const goHome = () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.role === "citizen") {
            navigate("/dashboard");
        } else if (user.role === "department") {
            navigate("/department");
        } else if (user.role === "admin") {
            navigate("/admin");
        }
    };

    const isActive = (path) => {
        return location.pathname === path
            ? "nav-button active"
            : "nav-button";
    };

    return (
        <nav className="main-navbar">

            {/* Logo */}

            <div
                className="navbar-logo"
                onClick={goHome}
            >
                <span className="logo-icon">🏛️</span>

                <span className="logo-text">
                    JanaSeva
                </span>
            </div>


            {/* Navigation */}

            {user && (

                <div className="navbar-content">

                    {/* User */}

                    <div className="navbar-user">

                        <span className="user-icon">
                            👤
                        </span>

                        <div className="navbar-user-info">

                            <span className="navbar-user-name">
                                {user.name}
                            </span>

                            <span className="navbar-user-role">
                                {user.role === "citizen"
                                    ? "Citizen"
                                    : user.role === "department"
                                        ? "Department"
                                        : "Administrator"}
                            </span>

                        </div>

                    </div>


                    {/* Links */}

                    <div className="navbar-links">

                        {/* Citizen */}

                        {user.role === "citizen" && (
                            <>
                                <button
                                    className={isActive("/dashboard")}
                                    onClick={() =>
                                        navigate("/dashboard")
                                    }
                                >
                                    🏠 Dashboard
                                </button>

                                <button
                                    className={isActive("/report")}
                                    onClick={() =>
                                        navigate("/report")
                                    }
                                >
                                    📝 Report Issue
                                </button>

                                <button
                                    className={isActive("/my-reports")}
                                    onClick={() =>
                                        navigate("/my-reports")
                                    }
                                >
                                    📋 My Reports
                                </button>

                                <button
                                    className={isActive("/track")}
                                    onClick={() =>
                                        navigate("/track")
                                    }
                                >
                                    🔍 Track Report
                                </button>
                            </>
                        )}


                        {/* Department */}

                        {user.role === "department" && (

                            <button
                                className={isActive("/department")}
                                onClick={() =>
                                    navigate("/department")
                                }
                            >
                                🏢 Department Dashboard
                            </button>

                        )}


                        {/* Admin */}

                        {user.role === "admin" && (

                            <button
                                className={isActive("/admin")}
                                onClick={() =>
                                    navigate("/admin")
                                }
                            >
                                ⚙️ Admin Dashboard
                            </button>

                        )}


                        {/* Logout */}

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            🚪 Logout
                        </button>

                    </div>

                </div>

            )}

        </nav>
    );
}

export default Navbar;