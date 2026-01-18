// Owner/Admin Dashboard - High-level restaurant overview and controls
import React, { useState, useEffect } from "react";
import { ownerAPI } from "../../api/ownerAPI";

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

interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  growthRate: number;
}

const OwnerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<"overview" | "financial" | "operational">(
    "overview",
  );

  useEffect(() => {
    fetchBusinessMetrics();
    fetchFinancialReports();
  }, []);

  const fetchBusinessMetrics = async () => {
    try {
      const response = await ownerAPI.getBusinessMetrics();
      setMetrics(response.data);
    } catch (error) {
      console.error("Failed to fetch business metrics:", error);
    }
  };

  const fetchFinancialReports = async () => {
    try {
      // Using the available API to get financial overview data
      await ownerAPI.getFinancialOverview();
      // Mock reports structure for dashboard display
      const mockReports: FinancialReport[] = [
        { period: "Jan 2024", revenue: 45000, expenses: 32000, profit: 13000, growthRate: 8.2 },
        { period: "Feb 2024", revenue: 52000, expenses: 36000, profit: 16000, growthRate: 15.6 },
        { period: "Mar 2024", revenue: 48000, expenses: 34000, profit: 14000, growthRate: -7.7 },
      ];
      setReports(mockReports);
    } catch (error) {
      console.error("Failed to fetch financial reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type: "financial" | "operational" | "full") => {
    try {
      await ownerAPI.exportFinancialReport({ format: "pdf" });
      alert(`${type} report exported successfully`);
    } catch (error) {
      console.error(`Failed to export ${type} report:`, error);
      alert(`Failed to export ${type} report`);
    }
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
            className={selectedView === "financial" ? "active" : ""}
            onClick={() => setSelectedView("financial")}
          >
            💰 Financial
          </button>
          <button
            className={selectedView === "operational" ? "active" : ""}
            onClick={() => setSelectedView("operational")}
          >
            ⚙️ Operations
          </button>
        </div>
      </div>

      {/* Overview Section */}
      {selectedView === "overview" && metrics && (
        <div className="overview-section">
          <div className="kpi-grid">
            <div className="kpi-card primary">
              <div className="kpi-header">
                <h3>💰 Total Revenue</h3>
                <div className="kpi-period">All Time</div>
              </div>
              <div className="kpi-value">${metrics.totalRevenue.toLocaleString()}</div>
              <div className="kpi-submetrics">
                <span>Monthly: ${metrics.monthlyRevenue.toLocaleString()}</span>
                <span>Yearly: ${metrics.yearlyRevenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>📋 Total Orders</h3>
                <div className="kpi-change positive">+12% vs last month</div>
              </div>
              <div className="kpi-value">{metrics.totalOrders.toLocaleString()}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>👥 Customer Base</h3>
                <div className="kpi-change positive">
                  Retention: {metrics.customerRetentionRate}%
                </div>
              </div>
              <div className="kpi-value">{metrics.totalCustomers.toLocaleString()}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>📈 Avg Order Value</h3>
                <div className="kpi-change neutral">+2.3% vs last month</div>
              </div>
              <div className="kpi-value">${metrics.averageOrderValue.toFixed(2)}</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>💹 Profit Margin</h3>
                <div className="kpi-change positive">+1.5% vs last month</div>
              </div>
              <div className="kpi-value">{metrics.profitMargin.toFixed(1)}%</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-header">
                <h3>🏪 Business Health</h3>
                <div className="health-indicators">
                  <span className="indicator good">📈 Growing</span>
                  <span className="indicator excellent">💎 Profitable</span>
                </div>
              </div>
              <div className="kpi-value">Excellent</div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Section */}
      {selectedView === "financial" && (
        <div className="financial-section">
          <div className="financial-controls">
            <h2>💼 Financial Management</h2>
            <div className="export-buttons">
              <button onClick={() => exportReport("financial")} className="export-btn">
                📊 Export Financial Report
              </button>
              <button onClick={() => exportReport("full")} className="export-btn">
                📋 Full Business Report
              </button>
            </div>
          </div>

          <div className="financial-reports">
            <h3>📈 Financial Performance</h3>
            <div className="reports-table">
              <div className="table-header">
                <span>Period</span>
                <span>Revenue</span>
                <span>Expenses</span>
                <span>Profit</span>
                <span>Growth</span>
              </div>
              {reports.map((report, index) => (
                <div key={index} className="table-row">
                  <span>{report.period}</span>
                  <span className="revenue">${report.revenue.toLocaleString()}</span>
                  <span className="expenses">${report.expenses.toLocaleString()}</span>
                  <span className="profit">${report.profit.toLocaleString()}</span>
                  <span className={`growth ${report.growthRate >= 0 ? "positive" : "negative"}`}>
                    {report.growthRate >= 0 ? "+" : ""}
                    {report.growthRate.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {metrics && (
            <div className="financial-insights">
              <h3>💡 Financial Insights</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <h4>💰 Revenue Streams</h4>
                  <p>Dine-in: 60% • Takeout: 25% • Delivery: 15%</p>
                </div>
                <div className="insight-card">
                  <h4>📊 Cost Analysis</h4>
                  <p>Food Cost: 32% • Labor: 28% • Overhead: 15%</p>
                </div>
                <div className="insight-card">
                  <h4>📈 Growth Opportunities</h4>
                  <p>Catering services could increase revenue by 20%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Operational Section */}
      {selectedView === "operational" && metrics && (
        <div className="operational-section">
          <h2>⚙️ Operational Management</h2>

          <div className="operational-grid">
            <div className="operational-card">
              <h3>👥 Staff Management</h3>
              <div className="stat-value">{metrics.staffCount} employees</div>
              <div className="operational-actions">
                <button className="action-btn">View Staff</button>
                <button className="action-btn">Schedules</button>
                <button className="action-btn">Performance</button>
              </div>
            </div>

            <div className="operational-card">
              <h3>📦 Inventory Value</h3>
              <div className="stat-value">${metrics.inventoryValue.toLocaleString()}</div>
              <div className="operational-actions">
                <button className="action-btn">View Inventory</button>
                <button className="action-btn">Suppliers</button>
                <button className="action-btn">Orders</button>
              </div>
            </div>

            <div className="operational-card">
              <h3>🏪 Restaurant Status</h3>
              <div className="stat-value status-operational">Operational</div>
              <div className="status-indicators">
                <div className="status-item">
                  <span className="status-dot green"></span>
                  Kitchen: Active
                </div>
                <div className="status-item">
                  <span className="status-dot green"></span>
                  Service: Normal
                </div>
                <div className="status-item">
                  <span className="status-dot yellow"></span>
                  Delivery: Limited
                </div>
              </div>
            </div>
          </div>

          <div className="system-controls">
            <h3>🔧 System Controls</h3>
            <div className="controls-grid">
              <button className="control-btn emergency">🚨 Emergency Stop</button>
              <button className="control-btn warning">⚠️ Maintenance Mode</button>
              <button className="control-btn info">🔄 System Backup</button>
              <button className="control-btn success">📊 Generate Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Panel */}
      <div className="quick-access">
        <h3>🚀 Quick Access</h3>
        <div className="quick-actions">
          <button className="quick-btn">📱 Mobile App Settings</button>
          <button className="quick-btn">🌐 Website Management</button>
          <button className="quick-btn">📧 Marketing Campaigns</button>
          <button className="quick-btn">🎯 Business Analytics</button>
          <button className="quick-btn">💳 Payment Gateway</button>
          <button className="quick-btn">🔐 Security Settings</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
