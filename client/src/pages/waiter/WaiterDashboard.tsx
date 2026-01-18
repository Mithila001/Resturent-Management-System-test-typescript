import React from "react";
import TableAllocation from "./TableAllocation";
import OrderTrackingList from "./OrderTrackingList";

const WaiterDashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">👔</span>
            Waiter Dashboard
          </h1>
          <p className="dashboard-subtitle">Manage tables and track orders efficiently</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-dashboard-action">
            <span>🔄</span> Refresh
          </button>
          <button className="btn-dashboard-action">
            <span>📊</span> Reports
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🪑</span>
              Table Management
            </h2>
            <span className="card-badge">Live</span>
          </div>
          <TableAllocation />
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">📋</span>
              Active Orders
            </h2>
            <span className="card-badge">Real-time</span>
          </div>
          <OrderTrackingList />
        </div>
      </div>
    </div>
  );
};

export default WaiterDashboard;
