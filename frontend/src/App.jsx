import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import MyReports from "./pages/MyReports";
import TrackReport from "./pages/TrackReport";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";


function AppContent() {

    const location = useLocation();

    /*
     * Home, Login and Register pages have
     * their own header/design.
     *
     * So the normal Navbar is hidden on these pages.
     */
    const hideNavbar =
        location.pathname === "/" ||
        location.pathname === "/login" ||
        location.pathname === "/register";


    return (
        <>
            {!hideNavbar && <Navbar />}

            <Routes>

                {/* ==================================================
                    HOME / LANDING PAGE
                ================================================== */}

                <Route
                    path="/"
                    element={<Home />}
                />


                {/* ==================================================
                    LOGIN
                ================================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ==================================================
                    REGISTER
                ================================================== */}

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==================================================
                    CITIZEN DASHBOARD
                ================================================== */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["citizen"]}
                        >
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    REPORT ISSUE
                ================================================== */}

                <Route
                    path="/report"
                    element={
                        <ProtectedRoute
                            allowedRoles={["citizen"]}
                        >
                            <ReportIssue />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    MY REPORTS
                ================================================== */}

                <Route
                    path="/my-reports"
                    element={
                        <ProtectedRoute
                            allowedRoles={["citizen"]}
                        >
                            <MyReports />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    TRACK REPORT
                ================================================== */}

                <Route
                    path="/track"
                    element={
                        <ProtectedRoute
                            allowedRoles={["citizen"]}
                        >
                            <TrackReport />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    DEPARTMENT DASHBOARD
                ================================================== */}

                <Route
                    path="/department"
                    element={
                        <ProtectedRoute
                            allowedRoles={["department"]}
                        >
                            <DepartmentDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    ADMIN DASHBOARD
                ================================================== */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin"]}
                        >
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==================================================
                    UNKNOWN URL
                ================================================== */}

                <Route
                    path="*"
                    element={<Home />}
                />

            </Routes>
        </>
    );
}


function App() {

    return (
        <BrowserRouter>

            <AppContent />

        </BrowserRouter>
    );
}


export default App;