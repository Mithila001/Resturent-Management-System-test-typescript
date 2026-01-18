import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import API_URL from "../../config/api";
import type { Socket } from "socket.io-client";

// Medium-level typed Order / OrderItem used by the kitchen display
interface OrderItem {
  menuItem?: { name?: string } | string | null;
  name?: string;
  quantity: number;
  subtotal?: number;
}

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";

interface Order {
  _id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  orderType: "dine-in" | "delivery" | "takeaway";
  tableNumber?: number;
  createdAt: string;
  items: OrderItem[];
  orderNotes?: string;
}

const KitchenDisplay: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { socket } = useSocket() as { socket: Socket | null };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<{ orders: Order[] }>(`${API_URL}/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter strictly for kitchen relevant statuses
      const kitchenOrders = (res.data?.orders || []).filter((order) =>
        ["pending", "confirmed", "preparing"].includes(order.orderStatus),
      );

      setOrders(kitchenOrders);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.on("newOrder", (order: Order) => {
        // Add new order to list if it matches criteria (usually 'pending')
        setOrders((prev) => [order, ...prev]);
        // Also re-fetch to stay in sync
        fetchOrders();
      });

      socket.on("orderStatusUpdated", () => {
        fetchOrders();
      });
    }

    return () => {
      if (socket) {
        socket.off("newOrder");
        socket.off("orderStatusUpdated");
      }
    };
  }, [socket]);

  const updateStatus = async (id: string, status: Order["orderStatus"]) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/orders/${id}/status`,
        { orderStatus: status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      // The socket listener will trigger a refresh
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div>Loading KDS...</div>;

  return (
    <div className="kitchen-display" style={{ padding: "1rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>Kitchen Display System</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {orders.length === 0 && <p>No active orders.</p>}

        {orders.map((order) => (
          <div
            key={order._id}
            className="card order-card"
            style={{
              borderLeft: `5px solid ${
                order.orderStatus === "pending"
                  ? "orange"
                  : order.orderStatus === "confirmed"
                    ? "blue"
                    : "green"
              }`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <span style={{ fontWeight: "bold" }}>#{order.orderNumber}</span>
              <span className={`status-badge status-${order.orderStatus}`}>
                {order.orderStatus}
              </span>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                {order.orderType === "dine-in" ? `Table: ${order.tableNumber}` : "Delivery"}
              </p>
              <p style={{ fontSize: "0.8rem", color: "#999" }}>
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            <div className="order-items-list" style={{ marginBottom: "1rem" }}>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.25rem 0",
                  }}
                >
                  <span>
                    {item.quantity}x{" "}
                    {typeof item.menuItem === "string"
                      ? item.menuItem
                      : item.menuItem?.name || item.name}
                  </span>
                </div>
              ))}
            </div>

            {order.orderNotes && (
              <div
                style={{
                  background: "#fff3cd",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                <strong>Note:</strong> {order.orderNotes}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              {order.orderStatus === "pending" && (
                <button
                  className="btn btn-primary"
                  onClick={() => updateStatus(order._id, "preparing")}
                >
                  Start Preparing
                </button>
              )}
              {order.orderStatus === "preparing" && (
                <button
                  className="btn"
                  style={{ backgroundColor: "#4caf50", color: "white" }}
                  onClick={() => updateStatus(order._id, "ready")}
                >
                  Mark Ready
                </button>
              )}

              {order.orderStatus !== "cancelled" && (
                <button
                  className="btn"
                  style={{ backgroundColor: "#f44336", color: "white" }}
                  onClick={() => updateStatus(order._id, "cancelled")}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDisplay;
