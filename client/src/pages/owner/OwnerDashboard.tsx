// Owner/Admin Dashboard - High-level restaurant overview and controls
import React, { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ownerAPI } from "../../api/ownerAPI";
import DashboardStats from "../../components/DashboardStats";
import axios from "axios";
import API_URL from "../../config/api";

interface BusinessMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  profitMargin: number;
  staffCount: number;
  inventoryValue: number;
}

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
}

interface NewEmployee {
  name: string;
  email: string;
  password: string;
  role: string;
}

const OwnerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"overview" | "employees">("overview");
  
  // Employee management states
  const [employees, setEmployees] = useState<User[]>([]);
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    name: "",
    email: "",
    password: "",
    role: "waiter",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchBusinessMetrics();
    if (selectedView === "employees") {
      fetchEmployees();
    }
  }, [selectedView]);

  const fetchBusinessMetrics = async () => {
    try {
      const response = await ownerAPI.getDashboardStats();
      const data = response.data;

      console.log("Owner Dashboard API Response:", data);

      // Transform and handle error values (-1) gracefully
      setMetrics({
        totalRevenue: data.totalRevenue !== undefined ? data.totalRevenue : 0,
        monthlyRevenue: data.monthlyRevenue !== undefined ? data.monthlyRevenue : 0,
        yearlyRevenue: data.yearlyRevenue !== undefined ? data.yearlyRevenue : 0,
        totalOrders: data.totalOrders !== undefined ? data.totalOrders : 0,
        totalCustomers: data.totalCustomers !== undefined ? data.totalCustomers : 0,
        averageOrderValue: data.averageOrderValue !== undefined ? data.averageOrderValue : 0,
        customerRetentionRate:
          data.customerRetentionRate !== undefined ? data.customerRetentionRate : 0,
        profitMargin: data.profitMargin !== undefined ? data.profitMargin : 0,
        staffCount: data.staffCount !== undefined ? data.staffCount : 0,
        inventoryValue: data.inventoryValue !== undefined ? data.inventoryValue : 0,
      });
    } catch (error) {
      console.error("Failed to fetch business metrics:", error);
      // Set all to -1 on error
      setMetrics({
        totalRevenue: -1,
        monthlyRevenue: -1,
        yearlyRevenue: -1,
        totalOrders: -1,
        totalCustomers: -1,
        averageOrderValue: -1,
        customerRetentionRate: -1,
        profitMargin: -1,
        staffCount: -1,
        inventoryValue: -1,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data as User[]);
    } catch (err: any) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, newEmployee);
      alert("Employee Created Successfully!");
      setNewEmployee({ name: "", email: "", password: "", role: "waiter" });
      fetchEmployees();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to create employee");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Employee deleted successfully");
      fetchEmployees();
    } catch (err: any) {
      alert("Failed to delete employee");
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
      customer: "👤",
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
      customer: "#95a5a6",
    };
    return colors[role ?? ""] || "#95a5a6";
  };

  if (loading) {
    return <div className="loading-container">Loading owner dashboard...</div>;
  }

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <h1>👑 Owner Dashboard</h1>
        <p className="dashboard-subtitle">Complete business overview and management controls</p>
        <div className="view-selector">
          <button
            className={selectedView === "overview" ? "active" : ""}
            onClick={() => setSelectedView("overview")}
          >
            📊 Overview
          </button>
          <button
            className={selectedView === "employees" ? "active" : ""}
            onClick={() => setSelectedView("employees")}
          >
            👥 Employees
          </button>
        </div>
      </div>

      {/* Overview Section */}
      {selectedView === "overview" && metrics && (
        <div className="overview-section">
          <DashboardStats
            stats={[
              {
                icon: "💰",
                title: "Total Revenue",
                value:
                  metrics.totalRevenue === -1
                    ? "Error"
                    : `$${metrics.totalRevenue.toLocaleString()}`,
                subtext: "All Time",
                variant: "primary",
              },
              {
                icon: "📋",
                title: "Total Orders",
                value: metrics.totalOrders === -1 ? "Error" : metrics.totalOrders,
                subtext: "All time orders",
              },
              {
                icon: "👥",
                title: "Customer Base",
                value: metrics.totalCustomers === -1 ? "Error" : metrics.totalCustomers,
                subtext:
                  metrics.customerRetentionRate === -1
                    ? "Error"
                    : `Retention: ${metrics.customerRetentionRate}%`,
              },
              {
                icon: "📈",
                title: "Avg Order Value",
                value:
                  metrics.averageOrderValue === -1
                    ? "Error"
                    : `$${metrics.averageOrderValue.toFixed(2)}`,
                subtext: "Per order average",
              },
            ]}
          />
        </div>
      )}

      {/* Employee Management Section */}
      {selectedView === "employees" && (
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
                  <option value="customer">Customer</option>
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

      {/* Quick Access Panel */}
      <div className="section">
        <h2 className="section-title">
          <span className="section-icon">🎯</span>
          Quick Access
        </h2>
        <div className="quick-links-grid">
          <Link to="/inventory" className="quick-link-card">
            <div
              className="quick-link-icon"
              style={{
                background: "linear-gradient(135deg, #9b59b6, #8e44ad)",
              }}
            >
              📦
            </div>
            <div className="quick-link-content">
              <h3>Inventory Management</h3>
              <p>Track stock and low inventory items</p>
            </div>
            <div className="quick-link-arrow">→</div>
          </Link>

          <Link to="/orders" className="quick-link-card">
            <div
              className="quick-link-icon"
              style={{
                background: "linear-gradient(135deg, #3498db, #2980b9)",
              }}
            >
              📋
            </div>
            <div className="quick-link-content">
              <h3>All Orders</h3>
              <p>View complete order history</p>
            </div>
            <div className="quick-link-arrow">→</div>
          </Link>

          <Link to="/menu" className="quick-link-card">
            <div
              className="quick-link-icon"
              style={{
                background: "linear-gradient(135deg, #1abc9c, #16a085)",
              }}
            >
              🍽️
            </div>
            <div className="quick-link-content">
              <h3>Menu Preview</h3>
              <p>View customer-facing menu</p>
            </div>
            <div className="quick-link-arrow">→</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
