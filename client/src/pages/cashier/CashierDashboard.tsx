import { useState, useEffect } from "react";
import { cashierAPI } from "../../api/cashierAPI";
import { useSocket } from "../../context/SocketContext";
import type { Socket } from "socket.io-client";

interface OrderItem {
  name: string;
  quantity: number;
  subtotal: number;
  menuItem?: { name: string };
}

interface Order {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  orderType: "dine-in" | "delivery" | "takeaway";
  tableNumber?: number;
  paymentStatus: string;
  totalAmount: number;
  items: OrderItem[];
  user?: { name: string };
}

const CashierDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const { socket } = useSocket() as { socket: Socket | null };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await cashierAPI.getOrdersForPayment({ paymentStatus: "pending" });
      const allOrders = Array.isArray(res.data) ? res.data : [];

      // Filter: Dine-in orders that are "served" or "dine-in-completed", Delivery orders that are "ready"
      const eligibleOrders = allOrders.filter((order: Order) => {
        if (order.orderType === "dine-in") {
          return order.orderStatus === "served" || order.orderStatus === "dine-in-completed";
        } else if (order.orderType === "delivery") {
          return order.orderStatus === "ready";
        }
        return false;
      });

      setOrders(eligibleOrders);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (socket) {
      socket.on("orderStatusUpdated", fetchOrders);
      socket.on("paymentStatusUpdated", fetchOrders);
    }
    return () => {
      if (socket) {
        socket.off("orderStatusUpdated");
        socket.off("paymentStatusUpdated");
      }
    };
  }, [socket]);

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setAmountPaid(order.totalAmount.toFixed(2));
  };

  const handleProcessPayment = async () => {
    if (!selectedOrder) return;

    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount < selectedOrder.totalAmount) {
      alert("Invalid payment amount. Must be at least the order total.");
      return;
    }

    if (!window.confirm(`Process payment for Order #${selectedOrder.orderNumber}?`)) return;

    try {
      await cashierAPI.processPayment(selectedOrder._id, {
        paymentMethod: "cash",
        amountPaid: amount,
      });

      alert(`Payment successful! Change: $${(amount - selectedOrder.totalAmount).toFixed(2)}`);
      setSelectedOrder(null);
      setAmountPaid("");
      fetchOrders();
    } catch (err: any) {
      alert(err.response?.data?.message || "Payment processing failed");
    }
  };

  // Calculate KPIs
  const dineInCount = orders.filter((o) => o.orderType === "dine-in").length;
  const deliveryCount = orders.filter((o) => o.orderType === "delivery").length;
  const totalOrders = orders.length;

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  return (
    <div style={{ width: "100%", maxWidth: "1600px", margin: "0 auto", padding: "1rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💳 Cashier Dashboard</h1>
        <p style={{ color: "#666", fontSize: "0.95rem" }}>Payment Processing & Order Dispatch</p>
      </div>

      {/* KPI Dashboard */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {totalOrders}
          </div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Total Orders</div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {deliveryCount}
          </div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Delivery Orders</div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
            {dineInCount}
          </div>
          <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>Dine-In Orders</div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Left Column: Order List */}
        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>📋 Orders Ready for Payment</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {orders.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  color: "#999",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                <div>No orders ready for payment</div>
              </div>
            )}
            {orders.map((order) => (
              <div
                key={order._id}
                onClick={() => handleSelectOrder(order)}
                style={{
                  padding: "1.5rem",
                  background: selectedOrder?._id === order._id ? "#e3f2fd" : "white",
                  border: `2px solid ${selectedOrder?._id === order._id ? "#2196f3" : "#ddd"}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    #{order.orderNumber}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      background:
                        order.orderType === "delivery"
                          ? "#ffc107"
                          : order.orderType === "dine-in"
                            ? "#2196f3"
                            : "#9e9e9e",
                      color: "white",
                    }}
                  >
                    {order.orderType === "delivery"
                      ? "🚚 DELIVERY"
                      : `🍽️ TABLE ${order.tableNumber}`}
                  </span>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
                  {order.items.length} item(s)
                  {order.user && ` • ${order.user.name}`}
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2e7d32" }}>
                  ${order.totalAmount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Transaction Detail */}
        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>🧾 Transaction Detail</h2>
          {!selectedOrder ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                background: "#f5f5f5",
                borderRadius: "8px",
                color: "#999",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👈</div>
              <div>Select an order from the left to view details</div>
            </div>
          ) : (
            <div
              style={{
                background: "white",
                border: "2px solid #ddd",
                borderRadius: "8px",
                padding: "1.5rem",
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "2px solid #eee",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  Order #{selectedOrder.orderNumber}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                  {selectedOrder.orderType === "delivery" ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1rem",
                        background: "#fff3cd",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        color: "#856404",
                      }}
                    >
                      🚚 DELIVERY ORDER - Will dispatch after payment
                    </span>
                  ) : (
                    `Table ${selectedOrder.tableNumber} • Dine-In`
                  )}
                </div>
              </div>

              {/* Items List */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: "bold", marginBottom: "0.75rem", color: "#666" }}>
                  Order Items:
                </div>
                <div
                  style={{
                    maxHeight: "250px",
                    overflowY: "auto",
                    background: "#f9f9f9",
                    padding: "1rem",
                    borderRadius: "6px",
                  }}
                >
                  {selectedOrder.items.map((item, idx) => {
                    const itemName = item.menuItem?.name || item.name;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "0.5rem 0",
                          borderBottom:
                            idx < selectedOrder.items.length - 1 ? "1px solid #eee" : "none",
                        }}
                      >
                        <span>
                          {item.quantity}x {itemName}
                        </span>
                        <span style={{ fontWeight: "bold" }}>${item.subtotal.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div
                style={{
                  padding: "1rem",
                  background: "#e8f5e9",
                  borderRadius: "6px",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Total Amount:</span>
                  <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#2e7d32" }}>
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Input (Dine-In only) */}
              {selectedOrder.orderType === "dine-in" && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontWeight: "bold",
                      marginBottom: "0.5rem",
                      color: "#666",
                    }}
                  >
                    Amount Paid:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      fontSize: "1.5rem",
                      border: "2px solid #ddd",
                      borderRadius: "6px",
                      fontWeight: "bold",
                    }}
                  />
                  {parseFloat(amountPaid) > selectedOrder.totalAmount && (
                    <div
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem",
                        background: "#fff3cd",
                        borderRadius: "4px",
                        fontSize: "0.9rem",
                      }}
                    >
                      Change: ${(parseFloat(amountPaid) - selectedOrder.totalAmount).toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {/* Pay Button */}
              <button
                onClick={handleProcessPayment}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = "#45a049")}
                onMouseOut={(e) => (e.currentTarget.style.background = "#4caf50")}
              >
                {selectedOrder.orderType === "delivery"
                  ? "✓ Process Payment & Dispatch"
                  : "✓ Process Payment"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
