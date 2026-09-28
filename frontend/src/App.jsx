import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
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

function App() {
    return (
        <BrowserRouter>
          <Navbar />

          <Routes>

                {/* Login */}
                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                {/* Citizen Dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Report Issue */}
                <Route
                    path="/report"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
                            <ReportIssue />
                        </ProtectedRoute>
                    }
                />

                {/* My Reports */}
                <Route
                    path="/my-reports"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
                            <MyReports />
                        </ProtectedRoute>
                    }
                />

                {/* Track Report */}
                <Route
                    path="/track"
                    element={
                        <ProtectedRoute allowedRoles={["citizen"]}>
                            <TrackReport />
                        </ProtectedRoute>
                    }
                />

                {/* Department Dashboard */}
                <Route
                    path="/department"
                    element={
                        <ProtectedRoute allowedRoles={["department"]}>
                            <DepartmentDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Dashboard */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Default page */}
                <Route path="/" element={<Login />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;