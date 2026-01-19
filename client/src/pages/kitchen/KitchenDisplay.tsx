import React, { useState, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { chefAPI } from "../../api/chefAPI";
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
      // Use new chef API for Kitchen Display System
      const res = await chefAPI.getKitchenOrders();
      const kitchenOrders = Array.isArray(res.data) ? res.data : [];

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
        // Only add confirmed orders (backend already filters pending)
        if (order.orderStatus === "confirmed") {
          setOrders((prev) => [order, ...prev]);
        }
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
      // Optimistically update UI immediately
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === id ? { ...order, orderStatus: status } : order)),
      );

      // Use appropriate chef API based on status
      switch (status) {
        case "confirmed":
          await chefAPI.confirmOrder(id);
          break;
        case "preparing":
          await chefAPI.startPreparingOrder(id);
          break;
        case "ready":
          await chefAPI.markOrderAsReady(id);
          break;
        default:
          console.warn("Unsupported status update:", status);
          return;
      }
      // Socket listener will sync with server state
    } catch (err) {
      alert("Failed to update status");
      // Revert optimistic update on error
      fetchOrders();
    }
  };

  const handleCancelOrder = async (id: string) => {
    const reason = prompt("Please provide a reason for cancelling this order:");
    if (!reason) return;

    try {
      await chefAPI.cancelOrder(id, reason);
      // The socket listener will trigger a refresh
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel order");
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
                order.orderStatus === "confirmed"
                  ? "#2196f3"
                  : order.orderStatus === "preparing"
                    ? "#ff9800"
                    : "#4caf50"
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
                {order.orderStatus === "confirmed" ? "New Order" : order.orderStatus}
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
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {order.orderStatus === "confirmed" && (
                <>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", backgroundColor: "#2196f3" }}
                    onClick={() => updateStatus(order._id, "preparing")}
                  >
                    🍳 Start Preparing
                  </button>
                  <button
                    className="btn"
                    style={{ width: "100%", backgroundColor: "#f44336", color: "white" }}
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    ✕ Cancel Order
                  </button>
                </>
              )}
              {order.orderStatus === "preparing" && (
                <>
                  <button
                    className="btn"
                    style={{ width: "100%", backgroundColor: "#4caf50", color: "white" }}
                    onClick={() => updateStatus(order._id, "ready")}
                  >
                    ✓ Mark Ready
                  </button>
                  <button
                    className="btn"
                    style={{ width: "100%", backgroundColor: "#f44336", color: "white" }}
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    ✕ Cancel Order
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDisplay;
