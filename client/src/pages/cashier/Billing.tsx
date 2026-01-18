import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../../context/SocketContext";
import API_URL from "../../config/api";
import type { Order } from "../../interfaces/types";

const Billing: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { socket } = useSocket();

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Show all active orders (not delivered OR delivered but unpaid)
      const activeOrders = (res.data.orders || []).filter(
        (order: Order) => order.paymentStatus === "pending" || order.orderStatus !== "delivered",
      );
      setOrders(activeOrders);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (socket) {
      socket.on("newOrder", () => fetchOrders());
      socket.on("orderStatusUpdated", () => fetchOrders());
      socket.on("paymentStatusUpdated", () => fetchOrders());
    }
    return () => {
      if (socket) {
        socket.off("newOrder");
        socket.off("orderStatusUpdated");
        socket.off("paymentStatusUpdated");
      }
    };
  }, [socket]);

  const handlePayment = async (orderId: string): Promise<void> => {
    if (!confirm("Mark this order as PAID?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/orders/${orderId}/payment`,
        { paymentStatus: "paid" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
    } catch (err) {
      alert("Payment update failed");
    }
  };

  if (loading) return <div>Loading Orders...</div>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1.5rem",
      }}
    >
      {orders.map((order) => (
        <div
          key={order._id}
          className="card"
          style={{
            borderLeft: `5px solid ${order.paymentStatus === "paid" ? "green" : "red"}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ fontWeight: "bold" }}>#{order.orderNumber}</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>

          <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
            <div>
              {order.orderType === "dine-in" ? `Table: ${order.tableNumber}` : "Delivery/Takeaway"}
            </div>
            <div>Status: {order.orderStatus}</div>
            <div>
              Payment:{" "}
              <span
                style={{
                  fontWeight: "bold",
                  color: order.paymentStatus === "paid" ? "green" : "red",
                }}
              >
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div
            style={{
              maxHeight: "150px",
              overflowY: "auto",
              background: "#f5f5f5",
              padding: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            {order.items.map((item, i) => {
              const itemName = (item as any).menuItem?.name ?? item.name;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {item.quantity}x {itemName}
                  </span>
                  <span>${item.subtotal.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {order.paymentStatus === "pending" && (
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => handlePayment(order._id)}
            >
              Mark as Paid
            </button>
          )}
          {order.paymentStatus === "paid" && (
            <button
              className="btn"
              disabled
              style={{
                width: "100%",
                background: "#ccc",
                cursor: "not-allowed",
              }}
            >
              Paid ✓
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Billing;
