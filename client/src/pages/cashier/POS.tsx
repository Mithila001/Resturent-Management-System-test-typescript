import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import API_URL from "../../config/api";
import type { MenuItem, Category, CartItem } from "../../interfaces/types";

const POS: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal } =
    useCart() as {
      cartItems: CartItem[];
      addToCart: (item: MenuItem, quantity?: number) => void;
      removeFromCart: (id: string) => void;
      updateQuantity: (id: string, quantity: number) => void;
      clearCart: () => void;
      getCartTotal: () => number;
    };
  const [orderType, setOrderType] = useState<string>("dine-in");
  const [tableNumber, setTableNumber] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          axios.get<Category[]>(`${API_URL}/categories`),
          axios.get<MenuItem[]>(`${API_URL}/menu?isAvailable=true`),
        ]);
        setCategories(catRes.data || []);
        setMenuItems(menuRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching POS data:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => {
          const catId = typeof item.category === "object" ? item.category._id : item.category;
          return catId === selectedCategory;
        });

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return alert("Cart is empty");
    if (orderType === "dine-in" && !tableNumber) return alert("Please enter table number");

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        items: cartItems.map((item) => ({
          menuItem: item._id,
          quantity: item.quantity,
        })),
        orderType,
        paymentMethod: "cash", // Default for POS
        tableNumber: orderType === "dine-in" ? parseInt(tableNumber) : undefined,
        deliveryAddress:
          orderType === "delivery"
            ? {
                street: "Walk-in",
                city: "Store",
                postalCode: "00000",
                phone: "0000000000",
              }
            : undefined,
        orderNotes: "Placed via POS",
      };

      await axios.post(`${API_URL}/orders`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Order Placed Successfully");
      clearCart();
      setTableNumber("");
    } catch (err) {
      console.error(err);
      alert("Failed to place order");
    }
  };

  if (loading) return <div>Loading POS...</div>;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "2rem",
        height: "80vh",
      }}
    >
      {/* Menu Section */}
      <div style={{ overflowY: "auto", paddingRight: "1rem" }}>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            marginBottom: "1rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
          }}
        >
          <button
            className={`btn ${selectedCategory === "all" ? "btn-primary" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`btn ${selectedCategory === cat._id ? "btn-primary" : ""}`}
              onClick={() => setSelectedCategory(cat._id)}
              style={{ whiteSpace: "nowrap" }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredItems.map((item) => (
            <div
              key={item._id}
              onClick={() => addToCart(item, 1)}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                borderRadius: "8px",
                cursor: "pointer",
                background: "white",
                transition: "transform 0.1s",
              }}
            >
              <h4 style={{ fontSize: "1rem", margin: "0 0 0.5rem" }}>{item.name}</h4>
              <p style={{ color: "#ff6b35", fontWeight: "bold" }}>${item.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart/Checkout Section */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "1.5rem",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ borderBottom: "1px solid #ddd", paddingBottom: "1rem" }}>Current Order</h2>

        <div style={{ flex: 1, overflowY: "auto", margin: "1rem 0" }}>
          {cartItems.map((item) => (
            <div
              key={item._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.5rem",
                background: "white",
                padding: "0.5rem",
                borderRadius: "4px",
              }}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{item.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  ${item.price.toFixed(2)} x {item.quantity}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                <button
                  onClick={() => removeFromCart(item._id)}
                  style={{ color: "red", border: "none", background: "none" }}
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #ddd", paddingTop: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="radio"
                checked={orderType === "dine-in"}
                onChange={() => setOrderType("dine-in")}
              />{" "}
              Dine-in
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="radio"
                checked={orderType === "takeaway"}
                onChange={() => setOrderType("takeaway")}
              />{" "}
              Takeaway
            </label>
          </div>

          {orderType === "dine-in" && (
            <input
              type="number"
              placeholder="Table Number"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
            />
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            <span>Total:</span>
            <span>${getCartTotal().toFixed(2)}</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="btn btn-primary"
            style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
          >
            Place Order
          </button>
          <button
            onClick={clearCart}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginTop: "0.5rem",
              background: "#ddd",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
