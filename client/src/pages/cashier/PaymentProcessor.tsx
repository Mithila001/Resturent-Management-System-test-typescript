// Payment Processing Component for Cashiers
import React, { useState, useEffect } from "react";
import { cashierAPI } from "../../api/cashierAPI";
import type { Order } from "../../interfaces/types";

const PaymentProcessor: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "online">("cash");

  useEffect(() => {
    fetchOrdersForPayment();
  }, []);

  const fetchOrdersForPayment = async () => {
    try {
      const response = await cashierAPI.getOrdersForPayment();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!selectedOrder || !paymentAmount) {
      alert("Please select an order and enter payment amount");
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount < selectedOrder.totalAmount) {
      alert("Payment amount is less than order total");
      return;
    }

    try {
      await cashierAPI.processPayment(selectedOrder._id, {
        paymentMethod,
        amountPaid: amount,
      });

      alert(
        `Payment processed successfully! Change: $${(amount - selectedOrder.totalAmount).toFixed(2)}`,
      );
      setSelectedOrder(null);
      setPaymentAmount("");
      fetchOrdersForPayment();
    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment processing failed");
    }
  };

  if (loading) {
    return <div className="loading-container">Loading orders for payment...</div>;
  }

  return (
    <div className="payment-processor">
      <div className="payment-header">
        <h2>💰 Payment Processing</h2>
        <button onClick={fetchOrdersForPayment} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="payment-layout">
        {/* Orders List */}
        <div className="orders-section">
          <h3>Orders Ready for Payment</h3>
          <div className="orders-list">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`order-card ${selectedOrder?._id === order._id ? "selected" : ""}`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="order-header">
                  <span className="order-number">#{order.orderNumber}</span>
                  <span className="order-status">{order.orderStatus}</span>
                </div>
                <div className="order-details">
                  <p>Table: {order.tableNumber || "N/A"}</p>
                  <p className="order-total">${order.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="empty-state">
                <p>No orders ready for payment</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="payment-section">
          {selectedOrder ? (
            <div className="payment-details">
              <h3>Payment Details</h3>
              <div className="order-summary">
                <h4>Order #{selectedOrder.orderNumber}</h4>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="item">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>${(item.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="total">
                  <strong>Total: ${selectedOrder.totalAmount.toFixed(2)}</strong>
                </div>
              </div>

              <div className="payment-form">
                <div className="form-group">
                  <label>Payment Method:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount Received:</label>
                  <input
                    type="number"
                    step="0.01"
                    min={selectedOrder.totalAmount}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Minimum: $${selectedOrder.totalAmount.toFixed(2)}`}
                  />
                </div>

                {paymentAmount && parseFloat(paymentAmount) > selectedOrder.totalAmount && (
                  <div className="change-amount">
                    <strong>
                      Change: ${(parseFloat(paymentAmount) - selectedOrder.totalAmount).toFixed(2)}
                    </strong>
                  </div>
                )}

                <button onClick={processPayment} className="process-payment-btn">
                  💳 Process Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Select an order to process payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProcessor;
