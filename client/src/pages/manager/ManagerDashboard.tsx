import { useState, useEffect } from "react";
import { managerAPI } from "../../api/managerAPI";
import { Link } from "react-router-dom";
import DashboardStats from "../../components/DashboardStats";

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
        const response = await managerAPI.getDashboardStats("all");
        const data = response.data;

        // Handle error values (-1) gracefully
        setStats({
          totalOrders: data.totalOrders ?? 0,
          pendingOrders: data.pendingOrders ?? 0,
          completedOrders: data.completedOrders ?? 0,
          cancelledOrders: data.cancelledOrders ?? 0,
          totalRevenue: data.totalRevenue ?? 0,
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        // Set all to -1 on error
        setStats({
          totalOrders: -1,
          pendingOrders: -1,
          completedOrders: -1,
          cancelledOrders: -1,
          totalRevenue: -1,
        });
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
      <DashboardStats
        stats={[
          {
            icon: "💰",
            title: "Total Revenue",
            value: stats.totalRevenue === -1 ? "Error" : `$${stats.totalRevenue.toFixed(2)}`,
            change: { value: "↑ 12.5% from last month", type: "positive" },
            variant: "primary",
          },
          {
            icon: "📦",
            title: "Total Orders",
            value: stats.totalOrders === -1 ? "Error" : stats.totalOrders,
            subtext: "All time orders",
          },
          {
            icon: "⏳",
            title: "Pending Orders",
            value: stats.pendingOrders === -1 ? "Error" : stats.pendingOrders,
            subtext: "Requires attention",
          },
          {
            icon: "✅",
            title: "Completed",
            value: stats.completedOrders === -1 ? "Error" : stats.completedOrders,
            subtext: "Successfully delivered",
          },
        ]}
      />

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
