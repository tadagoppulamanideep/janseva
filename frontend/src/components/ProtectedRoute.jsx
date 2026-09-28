import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(savedUser);

    if (!allowedRoles.includes(user.role)) {
        if (user.role === "citizen") {
            return <Navigate to="/dashboard" replace />;
        }

        if (user.role === "department") {
            return <Navigate to="/department" replace />;
        }

        if (user.role === "admin") {
            return <Navigate to="/admin" replace />;
        }

        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;