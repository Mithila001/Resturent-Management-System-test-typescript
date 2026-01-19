import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { guestOrderAPI } from "../api/customerAPI";
import "./OrderTracking.css";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetails {
  _id?: string;
  orderNumber: string | number;
  createdAt?: string;
  items: OrderItem[];
  totalAmount: number;
  orderNotes?: string;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  orderStatus: string;
  orderType: string;
  tableNumber?: number;
}

const GuestOrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchOrder = useCallback(async (): Promise<void> => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await guestOrderAPI.getGuestOrderDetails(orderId);
      setOrder(response.data);
      setError("");
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : ((err as any)?.response?.data?.message ?? "Failed to fetch order details");
      setError(message);
      console.error("Fetch order error:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const getStatusSteps = (): Array<{
    key: string;
    label: string;
    completed?: boolean;
    active?: boolean;
  }> => {
    if (!order) return [];

    const allSteps = [
      { key: "pending", label: "Order Placed" },
      { key: "confirmed", label: "Confirmed" },
      { key: "preparing", label: "Preparing" },
      { key: "ready", label: "Ready" },
      { key: "delivered", label: "Delivered" },
    ];

    if (order.orderStatus === "cancelled") {
      return [{ key: "cancelled", label: "Cancelled", completed: true }];
    }

    const currentIndex = allSteps.findIndex((step) => step.key === order.orderStatus);
    return allSteps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="order-tracking-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate("/menu")}>Back to Menu</button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking-container">
        <div className="error-message">Order not found</div>
        <button onClick={() => navigate("/menu")}>Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="order-tracking-container">
      <div
        className="guest-banner"
        style={{
          backgroundColor: "#e3f2fd",
          border: "1px solid #2196f3",
          padding: "1rem",
          marginBottom: "1.5rem",
          borderRadius: "8px",
        }}
      >
        <strong>Guest Order</strong> - This is a dine-in guest order. For questions or to cancel,
        please speak to your waiter.
      </div>

      <div className="order-tracking-header">
        <button onClick={() => navigate("/menu")} className="back-btn">
          ← Back to Menu
        </button>
        <h1>Order #{order.orderNumber}</h1>
        <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
        {order.tableNumber && (
          <p className="table-number" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Table Number: {order.tableNumber}
          </p>
        )}
      </div>

      {/* Order Status Progress */}
      <div className="order-progress">
        <h2>Order Status</h2>
        <div className="progress-steps">
          {getStatusSteps().map((step, index) => (
            <div
              key={step.key}
              className={`progress-step ${step.completed ? "completed" : ""} ${
                step.active ? "active" : ""
              }`}
            >
              <div className="step-circle">{step.completed ? "✓" : index + 1}</div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-details-grid">
        {/* Order Items */}
        <div className="order-section">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="tracking-item">
                <div className="tracking-item-info">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p className="item-price">${item.price.toFixed(2)} each</p>
                </div>
                <div className="tracking-item-subtotal">${item.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>
          <div className="order-total-section">
            <span>Total Amount:</span>
            <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Information */}
        <div className="order-section">
          <h2>Order Information</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Order Type:</span>
              <span className="info-value">{order.orderType}</span>
            </div>

            {order.orderNotes && (
              <div className="info-item">
                <span className="info-label">Order Notes:</span>
                <span className="info-value">{order.orderNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="order-section">
          <h2>Payment Information</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Payment Method:</span>
              <span className="info-value payment-method">
                {order.paymentMethod === "cash"
                  ? "Cash"
                  : order.paymentMethod === "card"
                    ? "Card"
                    : "Online Payment"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment Status:</span>
              <span className={`payment-status status-${order.paymentStatus}`}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        {order.estimatedDeliveryTime && order.orderStatus !== "delivered" && (
          <div className="order-section">
            <h2>Estimated Ready Time</h2>
            <p className="estimated-time">{formatDate(order.estimatedDeliveryTime)}</p>
          </div>
        )}

        {/* Delivered At */}
        {order.deliveredAt && (
          <div className="order-section">
            <h2>Delivered At</h2>
            <p className="estimated-time">{formatDate(order.deliveredAt)}</p>
          </div>
        )}
      </div>

      <div className="order-actions" style={{ marginTop: "2rem", textAlign: "center" }}>
        <p style={{ color: "#666", fontSize: "0.95rem" }}>
          Need to make changes? Please speak to your waiter or cashier.
        </p>
      </div>
    </div>
  );
};

export default GuestOrderTracking;
