import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import API_URL from "../config/api";
import "./OrderHistory.css";

interface OrderItem {
  name: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [notification, setNotification] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const url = filter === "all" ? `${API_URL}/orders` : `${API_URL}/orders?status=${filter}`;

      const response = await axios.get<{ orders: Order[] }>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders || []);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch orders");
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleOrderStatusUpdate = (data: {
      userId?: string;
      orderNumber?: string;
      orderStatus?: string;
    }) => {
      // Only show notification if it's the current user's order
      if (data.userId === (user as any)._id) {
        setNotification(
          `Order #${data.orderNumber} updated to: ${(data.orderStatus || "")
            .toUpperCase()
            .replace("-", " ")}`,
        );
        setTimeout(() => setNotification(""), 5000);
        fetchOrders(); // Refresh orders list
      }
    };

    const handlePaymentStatusUpdate = (data: {
      userId?: string;
      orderNumber?: string;
      paymentStatus?: string;
    }) => {
      if (data.userId === (user as any)._id) {
        setNotification(
          `Payment for Order #${data.orderNumber} updated to: ${(
            data.paymentStatus || ""
          ).toUpperCase()}`,
        );
        setTimeout(() => setNotification(""), 5000);
        fetchOrders();
      }
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);
    socket.on("paymentStatusUpdated", handlePaymentStatusUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
      socket.off("paymentStatusUpdated", handlePaymentStatusUpdate);
    };
  }, [socket, user, fetchOrders]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#ffa500",
      confirmed: "#4caf50",
      preparing: "#2196f3",
      ready: "#9c27b0",
      "out-for-delivery": "#ff9800",
      delivered: "#4caf50",
      cancelled: "#f44336",
    };
    return colors[status] || "#666";
  };

  const getStatusLabel = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString?: string | Date) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null; // Redirecting in useEffect above
  }

  return (
    <div className="order-history-container">
      {/* Real-time notification banner */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#4caf50",
            color: "white",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 1000,
            animation: "slideIn 0.3s ease",
          }}
        >
          🔔 {notification}
        </div>
      )}

      <h1>Order History</h1>

      {/* Filter Tabs */}
      <div className="order-filters">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All Orders
        </button>
        <button
          className={filter === "pending" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </button>
        <button
          className={filter === "confirmed" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("confirmed")}
        >
          Confirmed
        </button>
        <button
          className={filter === "delivered" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("delivered")}
        >
          Delivered
        </button>
        <button
          className={filter === "cancelled" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found</p>
          <button onClick={() => navigate("/menu")}>Browse Menu</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <div
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.orderStatus) }}
                >
                  {getStatusLabel(order.orderStatus)}
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="item-price">${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="view-details-btn"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
