import React, { useCallback, useEffect, useState } from "react";
import { waiterAPI } from "../../api/waiterAPI";
import axios from "axios";
import API_URL from "../../config/api";

type TableStatus = "available" | "occupied" | "reserved" | string;

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  assignedWaiter?: {
    _id: string;
    name: string;
  };
}

const TableAllocation: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | TableStatus>("all"); // all, available, occupied

  const fetchTables = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // Use new waiter API to get assigned tables
      const res = await waiterAPI.getMyTables();
      setTables(res.data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tables:", err);
      setError("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    // Auto-refresh every 30 seconds
    const interval = window.setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const updateStatus = async (id: string, newStatus: TableStatus): Promise<void> => {
    try {
      await waiterAPI.updateTableStatus(id, newStatus);
      await fetchTables(); // Refresh list
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    }
  };

  const assignSelfToTable = async (tableId: string): Promise<void> => {
    try {
      await waiterAPI.assignSelfToTable(tableId);
      await fetchTables(); // Refresh list
    } catch (err) {
      console.error("Failed to assign table:", err);
      alert("Failed to assign table to yourself");
    }
  };

  const filteredTables = tables.filter((table) => {
    if (filter === "all") return true;
    return table.status === filter;
  });

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Tables...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="table-allocation">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-content">
            <p className="stat-label">Total Tables</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Available</p>
            <p className="stat-value">{stats.available}</p>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Occupied</p>
            <p className="stat-value">{stats.occupied}</p>
          </div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Reserved</p>
            <p className="stat-value">{stats.reserved}</p>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All ({stats.total})
        </button>
        <button
          className={`filter-btn ${filter === "available" ? "active" : ""}`}
          onClick={() => setFilter("available")}
        >
          Available ({stats.available})
        </button>
        <button
          className={`filter-btn ${filter === "occupied" ? "active" : ""}`}
          onClick={() => setFilter("occupied")}
        >
          Occupied ({stats.occupied})
        </button>
        <button
          className={`filter-btn ${filter === "reserved" ? "active" : ""}`}
          onClick={() => setFilter("reserved")}
        >
          Reserved ({stats.reserved})
        </button>
      </div>

      {/* Tables Grid */}
      <div className="tables-grid">
        {filteredTables.map((table) => (
          <div
            key={table._id}
            className={`table-card ${table.status === "occupied" ? "occupied" : table.status === "reserved" ? "reserved" : "available"}`}
          >
            <div className="table-card-header">
              <div className="table-number">Table {table.tableNumber}</div>
              <div className={`status-indicator ${table.status}`}></div>
            </div>

            <div className="table-card-body">
              <div className="table-info">
                <span className="info-icon">👥</span>
                <span className="info-text">Capacity: {table.capacity}</span>
              </div>
              {table.assignedWaiter && (
                <div className="table-info">
                  <span className="info-icon">👤</span>
                  <span className="info-text">Waiter: {table.assignedWaiter.name}</span>
                </div>
              )}
              <div className="table-status-badge">
                <span className={`badge-dot ${table.status}`}></span>
                <span className="status-text">{table.status}</span>
              </div>
            </div>

            <div className="table-card-actions">
              {!table.assignedWaiter && (
                <button
                  className="table-action-btn assign"
                  onClick={() => assignSelfToTable(table._id)}
                >
                  <span>👤</span> Assign to Me
                </button>
              )}
              {table.status === "available" ? (
                <button
                  className="table-action-btn occupy"
                  onClick={() => updateStatus(table._id, "occupied")}
                >
                  <span>🔒</span> Mark Occupied
                </button>
              ) : table.status === "occupied" ? (
                <button
                  className="table-action-btn free"
                  onClick={() => updateStatus(table._id, "available")}
                >
                  <span>✓</span> Mark Available
                </button>
              ) : (
                <button
                  className="table-action-btn free"
                  onClick={() => updateStatus(table._id, "available")}
                >
                  <span>✓</span> Clear Reserved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🪑</span>
          <p>No tables found for the selected filter</p>
        </div>
      )}
    </div>
  );
};

export default TableAllocation;
