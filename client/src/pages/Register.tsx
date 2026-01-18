import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

type Role = "customer" | "staff" | "delivery";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const Register = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [error, setError] = useState<string>("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = await register(formData.name, formData.email, formData.password, formData.role);
      if (res?.success) {
        navigate("/");
      } else {
        setError(res?.message || "Registration failed");
      }
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : ((err as any)?.response?.data?.message ?? "Registration failed");
      setError(message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "4rem" }}>
      <div className="card">
        <h2 className="section-title">Register</h2>
        {error && <div style={{ color: "var(--error-color)", marginBottom: "1rem" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Name</label>
            <input
              type="text"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #ddd",
              }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
            <input
              type="email"
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
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
            <input
              type="password"
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
          {/* Temporary Role Selection for Demo */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>I want to...</label>
            <select
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #ddd",
              }}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
            >
              <option value="customer">Order Food</option>
              <option value="staff">Manage Restaurant (Staff)</option>
              <option value="delivery">Deliver Food</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
            Sign Up
          </button>
        </form>
        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
