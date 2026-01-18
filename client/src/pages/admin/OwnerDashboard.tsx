import { useState, useEffect, type FormEvent } from "react";
import type { User } from "../../context/AuthContext";
import axios from "axios";
import ManagerDashboard from "../manager/ManagerDashboard"; // Reuse stats view
import API_URL from "../../config/api";

const OwnerDashboard = () => {
  const [view, setView] = useState("stats"); // 'stats' or 'employees'
  const [employees, setEmployees] = useState<User[]>([]);
  type NewEmployee = { name: string; email: string; password: string; role: string };
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: "",
    email: "",
    password: "",
    role: "staff",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data as User[]);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (view === "employees") {
      fetchEmployees();
    }
  }, [view]);

  const handleCreateEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, newEmployee);
      alert("Employee Created Successfully!");
      setNewEmployee({ name: "", email: "", password: "", role: "staff" });
      fetchEmployees();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create employee");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (err: any) {
      alert("Failed to delete user");
    }
  };

  const filteredEmployees = employees.filter((emp: User) => {
    const matchesSearch =
      (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || emp.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role?: string): string => {
    const icons: Record<string, string> = {
      admin: "⚙️",
      waiter: "👔",
      chef: "👨‍🍳",
      cashier: "💰",
      manager: "📊",
      owner: "👑",
      delivery: "🚚",
      staff: "👤",
    };
    return icons[role ?? ""] || "👤";
  };

  const getRoleColor = (role?: string): string => {
    const colors: Record<string, string> = {
      admin: "#e74c3c",
      owner: "#9b59b6",
      manager: "#3498db",
      chef: "#e67e22",
      waiter: "#1abc9c",
      cashier: "#f39c12",
      delivery: "#34495e",
      staff: "#95a5a6",
    };
    return colors[role ?? ""] || "#95a5a6";
  };

  return (
    <div className="dashboard-container owner-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">👑</span>
            Owner Dashboard
          </h1>
          <p className="dashboard-subtitle">Complete business overview and employee management</p>
        </div>
        <div className="view-switcher">
          <button
            className={`view-btn ${view === "stats" ? "active" : ""}`}
            onClick={() => setView("stats")}
          >
            <span>📊</span> Overview
          </button>
          <button
            className={`view-btn ${view === "employees" ? "active" : ""}`}
            onClick={() => setView("employees")}
          >
            <span>👥</span> Employees
          </button>
        </div>
      </div>

      {view === "stats" ? (
        <ManagerDashboard />
      ) : (
        <div className="employee-management">
          <div className="management-grid">
            {/* Create Employee Form */}
            <div className="employee-form-card">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="card-icon">➕</span>
                  Add New Employee
                </h2>
              </div>
              <form onSubmit={handleCreateEmployee} className="modern-form">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">👤</span>
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter employee name"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="employee@example.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🔒</span>
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter password"
                    value={newEmployee.password}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">💼</span>
                    Role
                  </label>
                  <select
                    className="form-input form-select"
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  >
                    <option value="waiter">Waiter</option>
                    <option value="chef">Chef</option>
                    <option value="cashier">Cashier</option>
                    <option value="manager">Manager</option>
                    <option value="delivery">Delivery</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  <span>➕</span> Create Employee
                </button>
              </form>
            </div>

            {/* Employee List */}
            <div className="employee-list-card">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="card-icon">👥</span>
                  Employee Directory
                </h2>
                <span className="employee-count">{filteredEmployees.length} employees</span>
              </div>

              {/* Search and Filter */}
              <div className="search-filter-section">
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="role-filter"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                  <option value="cashier">Cashier</option>
                  <option value="delivery">Delivery</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {/* Employee Cards */}
              <div className="employee-cards">
                {filteredEmployees.map((user) => (
                  <div key={user._id ?? user.id ?? user.email} className="employee-card">
                    <div className="employee-card-header">
                      <div
                        className="employee-avatar"
                        style={{ background: getRoleColor(user.role) }}
                      >
                        {(user.name ?? "").charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="employee-info">
                        <h4 className="employee-name">{user.name ?? ""}</h4>
                        <p className="employee-email">{user.email ?? ""}</p>
                      </div>
                    </div>
                    <div className="employee-card-body">
                      <div
                        className="employee-role"
                        style={{ background: getRoleColor(user.role) }}
                      >
                        <span className="role-icon">{getRoleIcon(user.role)}</span>
                        <span className="role-text">{user.role ?? ""}</span>
                      </div>
                    </div>
                    <div className="employee-card-actions">
                      {(user._id || user.id) && (
                        <button
                          onClick={() => handleDeleteEmployee(user._id ?? user.id ?? "")}
                          className="delete-employee-btn"
                        >
                          <span>🗑️</span> Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredEmployees.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">👥</span>
                  <p>No employees found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
