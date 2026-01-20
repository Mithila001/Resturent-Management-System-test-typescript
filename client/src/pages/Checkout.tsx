import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";
import { type CheckoutFormData, type CartItem } from "../interfaces/types";
import { guestOrderAPI } from "../api/customerAPI";
import "./Checkout.css";

interface CartContextType {
  cartItems: CartItem[];
  getCartTotal: () => number;
  clearCart: () => void;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart() as CartContextType;

  // Initialize form with saved data if available
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    const savedFormData = localStorage.getItem("checkoutFormData");
    if (savedFormData) {
      try {
        return JSON.parse(savedFormData);
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
    return {
      orderType: "delivery",
      tableNumber: "",
      street: "",
      city: "",
      postalCode: "",
      phone: "",
      notes: "",
      orderNotes: "",
      paymentMethod: "cash",
    };
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("checkoutFormData", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check if delivery requires authentication
      if (formData.orderType === "delivery" && !user) {
        setError("Please login to place a delivery order");
        setLoading(false);
        // Save form data before redirecting (already saved by useEffect, but ensure it's there)
        localStorage.setItem("checkoutFormData", JSON.stringify(formData));
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      // Prepare order data
      const orderData: any = {
        items: cartItems.map((item: CartItem) => ({
          menuItem: item._id,
          quantity: item.quantity,
        })),
        orderType: formData.orderType,
        orderNotes: formData.orderNotes,
        paymentMethod: formData.paymentMethod,
      };

      let response;

      if (formData.orderType === "dine-in") {
        orderData.tableNumber = parseInt(formData.tableNumber);

        // Guest dine-in order (no authentication)
        if (!user) {
          response = await guestOrderAPI.createGuestOrder(orderData);
        } else {
          // Authenticated dine-in order
          const token = localStorage.getItem("token");
          response = await axios.post(`${API_URL}/orders`, orderData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
      } else {
        // Delivery order (requires authentication)
        orderData.deliveryAddress = {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
          notes: formData.notes,
        };

        const token = localStorage.getItem("token");
        response = await axios.post(`${API_URL}/orders`, orderData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear cart and form data, then redirect to order tracking
      clearCart();
      localStorage.removeItem("checkoutFormData"); // Clear saved form data after successful order
      const orderNumber = response.data.orderNumber;
      const orderId = response.data._id;

      if (!user && formData.orderType === "dine-in") {
        // Store guest order with 3-hour expiry
        const guestOrderData = {
          orderId,
          orderNumber,
          timestamp: Date.now(),
          expiresAt: Date.now() + 3 * 60 * 60 * 1000, // 3 hours
        };
        localStorage.setItem("guestOrder", JSON.stringify(guestOrderData));

        alert(
          `Order placed successfully!\n\nOrder Number: ${orderNumber}\n\nPlease note your order number. You can track your order at:\n/orders/guest/${orderId}`,
        );
        navigate(`/orders/guest/${orderId}`);
      } else {
        alert(`Order placed successfully! Order Number: ${orderNumber}`);
        navigate(`/orders/${orderId}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order");
      console.error("Order error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out</p>
          <button onClick={() => navigate("/menu")}>Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {!user && (
        <div
          className="guest-notice"
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffc107",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "4px",
          }}
        >
          <strong>Guest Checkout:</strong> You can place a dine-in order without logging in. For
          delivery orders, please{" "}
          <a href="/login" style={{ color: "#0066cc", textDecoration: "underline" }}>
            login
          </a>{" "}
          or{" "}
          <a href="/register" style={{ color: "#0066cc", textDecoration: "underline" }}>
            register
          </a>
          .
        </div>
      )}
      <h1>Checkout</h1>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cartItems.map((item: CartItem) => (
              <div key={item._id} className="order-item">
                <div className="order-item-info">
                  <span className="order-item-name">{item.name}</span>
                  <span className="order-item-quantity">x {item.quantity}</span>
                </div>
                <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="order-total">
            <span>Total:</span>
            <span className="total-amount">${getCartTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="checkout-form-container">
          <h2>Delivery Information</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Order Type</label>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <label
                  className="radio-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="orderType"
                    value="delivery"
                    checked={formData.orderType === "delivery"}
                    onChange={handleChange}
                  />
                  Delivery
                </label>
                <label
                  className="radio-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="orderType"
                    value="dine-in"
                    checked={formData.orderType === "dine-in"}
                    onChange={handleChange}
                  />
                  Dine-in
                </label>
              </div>
            </div>

            {formData.orderType === "dine-in" ? (
              <div className="form-group">
                <label htmlFor="tableNumber">Table Number *</label>
                <input
                  type="number"
                  id="tableNumber"
                  name="tableNumber"
                  value={formData.tableNumber}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="e.g. 5"
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="street">Street Address *</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      maxLength={50}
                      placeholder="New York"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{5,10}"
                      title="Please enter a valid postal code (5-10 digits)"
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[\d\s\-\+\(\)]{10,15}"
                    title="Please enter a valid phone number (10-15 characters)"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Delivery Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="e.g., Ring doorbell twice"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="orderNotes">Order Notes</label>
              <textarea
                id="orderNotes"
                name="orderNotes"
                value={formData.orderNotes}
                onChange={handleChange}
                rows={2}
                placeholder="e.g., No spicy, extra sauce"
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online Payment</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate("/menu")} className="btn-secondary">
                Back to Menu
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
