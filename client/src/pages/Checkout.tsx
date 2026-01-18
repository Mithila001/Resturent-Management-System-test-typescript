import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";
import { type CheckoutFormData, type CartItem } from "../interfaces/types";
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

  const [formData, setFormData] = useState<CheckoutFormData>({
    orderType: "delivery",
    tableNumber: "",
    street: "",
    city: "",
    postalCode: "",
    phone: "",
    notes: "",
    orderNotes: "",
    paymentMethod: "cash",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

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
      const token = localStorage.getItem("token");

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

      if (formData.orderType === "dine-in") {
        orderData.tableNumber = parseInt(formData.tableNumber);
      } else {
        orderData.deliveryAddress = {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
          notes: formData.notes,
        };
      }

      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Clear cart and redirect to order tracking
      clearCart();
      alert(`Order placed successfully! Order Number: ${response.data.orderNumber}`);
      navigate(`/orders/${response.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place order");
      console.error("Order error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

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
