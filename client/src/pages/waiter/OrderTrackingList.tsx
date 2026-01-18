import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { waiterAPI } from "../../api/waiterAPI";
import type { Order } from "../../interfaces/types";

type Filter = "all" | "pending" | "preparing" | "ready";

const OrderTrackingList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<Filter>("all"); // all, pending, preparing, ready

  const fetchOrders = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // Use new waiter API to get orders for assigned tables
      const res = await waiterAPI.getMyTableOrders();
      const ordersData = Array.isArray(res.data) ? res.data : [];

      // Filter for active orders only
      const activeOrders = ordersData.filter(
        (o: Order) => o.orderStatus !== "delivered" && o.orderStatus !== "cancelled",
      );

      setOrders(activeOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // Polling for updates every 10 seconds
    const interval = window.setInterval(fetchOrders, 10000);
    return () => window.clearInterval(interval);
  }, [fetchOrders]);

  const markDelivered = useCallback(
    async (id: string): Promise<void> => {
      try {
        await waiterAPI.markOrderAsDelivered(id);
        await fetchOrders();
      } catch (err) {
        console.error(err);
        alert("Failed to mark order as delivered");
      }
    },
    [fetchOrders],
  );

  const getStatusIcon = (status?: string) => {
    const icons: Record<string, string> = {
      pending: "⏳",
      preparing: "👨‍🍳",
      ready: "✅",
      delivered: "🚚",
      cancelled: "❌",
    };
    return icons[status ?? ""] || "📦";
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      pending: "warning",
      preparing: "info",
      ready: "success",
      delivered: "default",
      cancelled: "error",
    };
    return colors[status ?? ""] || "default";
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.orderStatus === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === "pending").length,
    preparing: orders.filter((o) => o.orderStatus === "preparing").length,
    ready: orders.filter((o) => o.orderStatus === "ready").length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Orders...</p>
      </div>
    );
  }

  return (
    <div className="order-tracking-list">
      {/* Quick Stats */}
      <div className="order-stats">
        <div className="order-stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Active</span>
        </div>
        <div className="order-stat-item warning">
          <span className="stat-number">{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="order-stat-item info">
          <span className="stat-number">{stats.preparing}</span>
          <span className="stat-label">Preparing</span>
        </div>
        <div className="order-stat-item success">
          <span className="stat-number">{stats.ready}</span>
          <span className="stat-label">Ready</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="order-filters">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === "pending" ? "active" : ""}`}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={`filter-tab ${filter === "preparing" ? "active" : ""}`}
          onClick={() => setFilter("preparing")}
        >
          Preparing
        </button>
        <button
          className={`filter-tab ${filter === "ready" ? "active" : ""}`}
          onClick={() => setFilter("ready")}
        >
          Ready
        </button>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No active orders found</p>
        </div>
      ) : (
        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="table-row-hover">
                  <td>
                    <Link to={`/orders/${order._id}`} className="order-link">
                      <div className="order-number">
                        <span className="order-icon">📦</span>
                        <span className="order-id">#{order.orderNumber}</span>
                      </div>
                    </Link>
                  </td>
                  <td>
                    <span className={`modern-badge badge-${getStatusColor(order.orderStatus)}`}>
                      <span className="badge-icon">{getStatusIcon(order.orderStatus)}</span>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <span className="amount-text">${order.totalAmount.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="time-text">
                      {new Date(order.createdAt ?? "").toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td>
                    {order.orderStatus === "ready" && (
                      <button
                        className="action-btn deliver"
                        onClick={() => markDelivered(order._id)}
                      >
                        <span>✓</span> Deliver
                      </button>
                    )}
                    {order.orderStatus !== "ready" && (
                      <Link to={`/orders/${order._id}`} className="action-btn view">
                        <span>👁️</span> View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingList;
