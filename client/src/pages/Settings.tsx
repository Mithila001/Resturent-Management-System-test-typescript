import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import type { AxiosResponse } from "axios";
import API_URL from "../config/api";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simple Settings Page Component (typed)
const Settings = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Only send password if it's being updated
      const updateData = {
        name: formData.name,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {}),
      };

      const res: AxiosResponse<{ message?: string }> = await axios.put(
        `${API_URL}/auth/profile`,
        updateData,
        config,
      );

      setMessage(res.data?.message ?? "Profile Updated Successfully");
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : ((err as any)?.response?.data?.message ?? "Update failed");
      setError(message);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div className="card">
        <h2 className="section-title">User Settings</h2>
        {error && <div style={{ color: "var(--error-color)", marginBottom: "1rem" }}>{error}</div>}
        {message && <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control"
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-control"
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
            />
          </div>

          <hr
            style={{
              margin: "2rem 0",
              border: "none",
              borderTop: "1px solid #eee",
            }}
          />
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Change Password (Optional)</h3>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-control"
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="form-control"
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
