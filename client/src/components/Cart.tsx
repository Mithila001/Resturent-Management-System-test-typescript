import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API_URL from "../config/api";
import "./Cart.css";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as { user: { name?: string } | null };
  const {
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    getCartTotal,
    clearCart,
  } = useCart() as {
    cartItems: CartItem[];
    removeFromCart: (id: string) => void;
    incrementQuantity: (id: string) => void;
    decrementQuantity: (id: string) => void;
    getCartTotal: () => number;
    clearCart: () => void;
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      alert("Please login to place an order");
      navigate("/login");
      return;
    }
    navigate("/checkout");
    setIsOpen(false);
  };

  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      {/* Cart Icon Button */}
      <button className="cart-icon-btn" onClick={() => setIsOpen(!isOpen)}>
        <span className="cart-icon">🛒</span>
        {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsOpen(false)}></div>
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button className="cart-close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>

            <div className="cart-content">
              {cartItems.length === 0 ? (
                <div className="cart-empty">
                  <p>Your cart is empty</p>
                  <button onClick={() => setIsOpen(false)}>Browse Menu</button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cartItems.map((item) => (
                      <div key={item._id} className="cart-item">
                        <div className="cart-item-image">
                          {item.imageUrl ? (
                            <img
                              src={`${API_URL.replace("/api", "")}${item.imageUrl}`}
                              alt={item.name}
                            />
                          ) : (
                            <div className="cart-item-placeholder">🍽️</div>
                          )}
                        </div>

                        <div className="cart-item-details">
                          <h4>{item.name}</h4>
                          <p className="cart-item-price">{formatPrice(item.price)}</p>

                          <div className="cart-item-quantity">
                            <button
                              onClick={() => decrementQuantity(item._id)}
                              className="quantity-btn"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => incrementQuantity(item._id)}
                              className="quantity-btn"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="cart-item-actions">
                          <p className="cart-item-subtotal">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="cart-item-remove"
                            title="Remove item"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total:</span>
                      <span className="cart-total-amount">{formatPrice(getCartTotal())}</span>
                    </div>

                    <button onClick={clearCart} className="cart-clear-btn">
                      Clear Cart
                    </button>

                    <button onClick={handleCheckout} className="cart-checkout-btn">
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
