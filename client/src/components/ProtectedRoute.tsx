import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth() as { user: { role?: string } | null; loading: boolean };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role ?? "")) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#e74c3c", marginBottom: "16px" }}>🚫 Access Denied</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          You don't have permission to access this page.
        </p>
        <p style={{ color: "#999" }}>
          Your role: <strong>{user.role}</strong>
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
