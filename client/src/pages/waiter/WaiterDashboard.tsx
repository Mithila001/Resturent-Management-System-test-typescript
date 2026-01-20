import React, { useCallback, useEffect, useState } from "react";
import { waiterAPI } from "../../api/waiterAPI";
import { useSocket } from "../../context/SocketContext";
import "../../styles/dashboard.css";

interface Order {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  items: any[];
  totalAmount: number;
  createdAt: string;
  user?: { name: string; email: string };
}

interface TableWithOrder {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  currentOrder: Order | null;
}

const WaiterDashboard: React.FC = () => {
  const [tables, setTables] = useState<TableWithOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  const fetchTablesWithOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await waiterAPI.getAllTablesWithOrders();
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
    fetchTablesWithOrders();
    // Auto-refresh every 30 seconds
    const interval = window.setInterval(fetchTablesWithOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchTablesWithOrders]);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = () => {
      fetchTablesWithOrders(); // Refresh on any order update
    };

    socket.on("orderStatusUpdated", handleOrderUpdate);
    socket.on("newOrder", handleOrderUpdate);
    socket.on("tableStatusUpdated", handleOrderUpdate); // Listen for table status changes

    return () => {
      socket.off("orderStatusUpdated", handleOrderUpdate);
      socket.off("newOrder", handleOrderUpdate);
      socket.off("tableStatusUpdated", handleOrderUpdate);
    };
  }, [socket, fetchTablesWithOrders]);

  const handleVerifyOrder = async (orderId: string): Promise<void> => {
    if (!window.confirm("Confirm this order and send to kitchen?")) return;

    try {
      await waiterAPI.verifyOrder(orderId);
      await fetchTablesWithOrders();
      alert("Order verified and sent to kitchen!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to verify order");
    }
  };

  const handleResetTable = async (tableId: string, tableNumber: number): Promise<void> => {
    if (!window.confirm(`Reset Table ${tableNumber}? This will mark it as available.`)) return;

    try {
      await waiterAPI.resetTable(tableId);
      await fetchTablesWithOrders();
      alert(`Table ${tableNumber} reset successfully!`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to reset table");
    }
  };

  const handleMarkAsServed = async (orderId: string): Promise<void> => {
    if (!window.confirm("Mark this order as served? Food has been delivered to the table?")) return;

    try {
      await waiterAPI.markOrderAsServed(orderId);
      await fetchTablesWithOrders();
      alert("Order marked as served!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to mark order as served");
    }
  };

  // Calculate KPIs
  const stats = {
    totalTables: tables.length,
    availableTables: tables.filter((t) => t.status === "available").length,
    occupiedTables: tables.filter((t) => t.status === "occupied" || t.currentOrder !== null).length,
    pendingOrders: tables.filter((t) => t.currentOrder?.orderStatus === "pending").length,
    confirmedOrders: tables.filter((t) => t.currentOrder?.orderStatus === "confirmed").length,
    preparingOrders: tables.filter((t) => t.currentOrder?.orderStatus === "preparing").length,
    readyOrders: tables.filter((t) => t.currentOrder?.orderStatus === "ready").length,
    servedOrders: tables.filter((t) => t.currentOrder?.orderStatus === "served").length,
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={fetchTablesWithOrders} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Compact Header */}
      <div className="dashboard-header" style={{ marginBottom: "1.5rem" }}>
        <div className="header-content">
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            <span style={{ marginRight: "0.5rem" }}>👔</span>
            Waiter Dashboard
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#666", margin: 0 }}>
            Manage dine-in tables and orders
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="btn-dashboard-action" onClick={fetchTablesWithOrders}>
            <span>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-icon">🪑</div>
          <div className="stat-content">
            <p className="stat-label">Total Tables</p>
            <p className="stat-value">{stats.totalTables}</p>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Available</p>
            <p className="stat-value">{stats.availableTables}</p>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="stat-label">Occupied</p>
            <p className="stat-value">{stats.occupiedTables}</p>
          </div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
        </div>
        <div className="stat-card stat-primary">
          <div className="stat-icon">✔️</div>
          <div className="stat-content">
            <p className="stat-label">Confirmed</p>
            <p className="stat-value">{stats.confirmedOrders}</p>
          </div>
        </div>
        <div className="stat-card" style={{ backgroundColor: "#fff3cd", borderColor: "#ffc107" }}>
          <div className="stat-icon">🍳</div>
          <div className="stat-content">
            <p className="stat-label">Preparing</p>
            <p className="stat-value">{stats.preparingOrders}</p>
          </div>
        </div>
        <div className="stat-card" style={{ backgroundColor: "#d4edda", borderColor: "#28a745" }}>
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <p className="stat-label">Ready</p>
            <p className="stat-value">{stats.readyOrders}</p>
          </div>
        </div>
        <div className="stat-card" style={{ backgroundColor: "#c3e6cb", borderColor: "#0f5132" }}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Served</p>
            <p className="stat-value">{stats.servedOrders}</p>
          </div>
        </div>
      </div>

      {/* Table Management Grid */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span className="card-icon">🪑</span>
            Table Management
          </h2>
          <span className="card-badge">Live</span>
        </div>

        <div className="tables-grid" style={{ padding: "1rem" }}>
          {tables.map((table) => {
            const hasOrder = table.currentOrder !== null;
            const order = table.currentOrder;
            const isPending = order?.orderStatus === "pending";
            const isReady = order?.orderStatus === "ready";

            return (
              <div
                key={table._id}
                className={`table-card ${hasOrder ? "occupied" : "available"}`}
                style={{
                  border: isPending
                    ? "2px solid #ff9800"
                    : isReady
                      ? "2px solid #4caf50"
                      : hasOrder
                        ? "2px solid #2196f3"
                        : "1px solid #ddd",
                }}
              >
                <div className="table-card-header">
                  <div className="table-number" style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                    Table {table.tableNumber}
                  </div>
                  <div
                    className={`status-indicator ${hasOrder ? "occupied" : "available"}`}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: hasOrder ? "#f44336" : "#4caf50",
                    }}
                  ></div>
                </div>

                <div className="table-card-body">
                  <div className="table-info">
                    <span>👥 Capacity: {table.capacity}</span>
                  </div>
                  <div className="table-info">
                    <span>
                      Status:{" "}
                      <strong style={{ color: hasOrder ? "#f44336" : "#4caf50" }}>
                        {hasOrder ? "Occupied" : "Vacant"}
                      </strong>
                    </span>
                  </div>

                  {hasOrder && order && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                      }}
                    >
                      <div style={{ fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                        <strong>Order #{order.orderNumber}</strong>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#666" }}>
                        {order.items?.length || 0} item(s) • ${order.totalAmount?.toFixed(2)}
                      </div>
                      {order.user && (
                        <div style={{ fontSize: "0.75rem", color: "#666" }}>
                          Customer: {order.user.name}
                        </div>
                      )}
                      <div style={{ marginTop: "0.5rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            backgroundColor:
                              order.orderStatus === "pending"
                                ? "#fff3cd"
                                : order.orderStatus === "confirmed"
                                  ? "#cfe2ff"
                                  : order.orderStatus === "preparing"
                                    ? "#ffc107"
                                    : order.orderStatus === "ready"
                                      ? "#d4edda"
                                      : order.orderStatus === "served"
                                        ? "#c3e6cb"
                                        : order.orderStatus === "cancelled"
                                          ? "#f8d7da"
                                          : "#e2e3e5",
                            color:
                              order.orderStatus === "pending"
                                ? "#856404"
                                : order.orderStatus === "confirmed"
                                  ? "#084298"
                                  : order.orderStatus === "preparing"
                                    ? "#000"
                                    : order.orderStatus === "ready"
                                      ? "#155724"
                                      : order.orderStatus === "served"
                                        ? "#0f5132"
                                        : order.orderStatus === "cancelled"
                                          ? "#721c24"
                                          : "#383d41",
                          }}
                        >
                          {order.orderStatus === "pending"
                            ? "⏳ Pending"
                            : order.orderStatus === "confirmed"
                              ? "✓ Confirmed"
                              : order.orderStatus === "preparing"
                                ? "🍳 Preparing"
                                : order.orderStatus === "ready"
                                  ? "🍽️ Ready"
                                  : order.orderStatus === "served"
                                    ? "✅ Served"
                                    : order.orderStatus === "cancelled"
                                      ? "❌ Cancelled"
                                      : order.orderStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="table-card-actions" style={{ marginTop: "0.75rem" }}>
                  {hasOrder && order && (
                    <>
                      {isPending && (
                        <button
                          className="table-action-btn"
                          onClick={() => handleVerifyOrder(order._id)}
                          style={{
                            backgroundColor: "#2196f3",
                            color: "#fff",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            width: "100%",
                          }}
                        >
                          ✓ Verify Order
                        </button>
                      )}
                      {isReady && (
                        <button
                          className="table-action-btn"
                          onClick={() => handleMarkAsServed(order._id)}
                          style={{
                            backgroundColor: "#ff9800",
                            color: "#fff",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            width: "100%",
                          }}
                        >
                          🍽️ Mark as Served
                        </button>
                      )}
                      {(order.orderStatus === "served" ||
                        order.orderStatus === "delivered" ||
                        order.orderStatus === "dine-in-completed" ||
                        order.orderStatus === "cancelled") && (
                        <button
                          className="table-action-btn"
                          onClick={() => handleResetTable(table._id, table.tableNumber)}
                          style={{
                            backgroundColor:
                              order.orderStatus === "cancelled" ? "#ff9800" : "#4caf50",
                            color: "#fff",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            width: "100%",
                            marginTop: "0.5rem",
                          }}
                        >
                          🔄 Reset Table
                        </button>
                      )}
                    </>
                  )}
                  {!hasOrder && (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#4caf50",
                        fontSize: "0.875rem",
                        padding: "0.5rem",
                      }}
                    >
                      ✓ Table is ready
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tables.length === 0 && (
          <div className="empty-state" style={{ padding: "3rem", textAlign: "center" }}>
            <span style={{ fontSize: "3rem" }}>🪑</span>
            <p>No tables found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard;
