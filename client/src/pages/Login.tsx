import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        // If user came from another page (e.g., checkout), redirect back there
        if (from) {
          navigate(from, { replace: true });
          return;
        }

        // Otherwise, use role-based navigation
        switch (res.role) {
          case "admin":
            navigate("/admin");
            break;
          case "waiter":
            navigate("/waiter");
            break;
          case "chef":
            navigate("/chef");
            break;
          case "cashier":
            navigate("/cashier");
            break;
          case "manager":
            navigate("/manager");
            break;
          case "owner":
            navigate("/owner");
            break;
          default:
            navigate("/"); // Customer or others go to home
        }
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "4rem" }}>
      <div className="card">
        <h2 className="section-title">Login</h2>
        {error && <div style={{ color: "var(--error-color)", marginBottom: "1rem" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
            <input
              type="email"
              name="email"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #ddd",
              }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
            <input
              type="password"
              name="password"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #ddd",
              }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Login
          </button>
        </form>
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
