import { useState, useEffect } from "react";
import { managerAPI } from "../../api/managerAPI";
import { Link } from "react-router-dom";

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await managerAPI.getDashboardStats("today");
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            Manager Dashboard
          </h1>
          <p className="dashboard-subtitle">Overview of restaurant performance and operations</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-overview">
        <div className="stat-card-large revenue">
          <div className="stat-header">
            <span className="stat-icon">💰</span>
            <h3>Total Revenue</h3>
          </div>
          <div className="stat-value-large">${stats.totalRevenue.toFixed(2)}</div>
          <div className="stat-change positive">
            <span>↑</span> 12.5% from last month
          </div>
        </div>

        <div className="stat-card-large orders">
          <div className="stat-header">
            <span className="stat-icon">📦</span>
            <h3>Total Orders</h3>
          </div>
          <div className="stat-value-large">{stats.totalOrders}</div>
          <div className="stat-detail">All time orders</div>
        </div>

        <div className="stat-card-large pending">
          <div className="stat-header">
            <span className="stat-icon">⏳</span>
            <h3>Pending Orders</h3>
          </div>
          <div className="stat-value-large">{stats.pendingOrders}</div>
          <div className="stat-detail">Requires attention</div>
        </div>

        <div className="stat-card-large completed">
          <div className="stat-header">
            <span className="stat-icon">✅</span>
            <h3>Completed</h3>
          </div>
          <div className="stat-value-large">{stats.completedOrders}</div>
          <div className="stat-detail">Successfully delivered</div>
        </div>
      </div>

      {/* Quick Links */}
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

export default ManagerDashboard;
