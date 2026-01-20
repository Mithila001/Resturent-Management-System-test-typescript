import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext, type User } from "../context/AuthContext";
import Menu from "./Menu";
import "./Home.css";

const Home = () => {
  const { user } = useContext(AuthContext) as { user: User | null };
  const [guestOrder, setGuestOrder] = useState<{ orderId: string; orderNumber: string } | null>(
    null,
  );

  // Check for guest order in localStorage
  useEffect(() => {
    const storedOrder = localStorage.getItem("guestOrder");
    if (storedOrder) {
      try {
        const orderData = JSON.parse(storedOrder);
        // Check if order has expired (3 hours)
        if (Date.now() < orderData.expiresAt) {
          setGuestOrder({ orderId: orderData.orderId, orderNumber: orderData.orderNumber });
        } else {
          // Remove expired order
          localStorage.removeItem("guestOrder");
        }
      } catch (error) {
        console.error("Error parsing guest order:", error);
      }
    }
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Delicious Food,
              <br />
              <span className="highlight">Delivered To You</span>
            </h1>

            {user ? (
              <div className="user-welcome">
                <p className="welcome-text">
                  Welcome back, <strong>{user.name}</strong>!
                </p>
                <div className="button-group">
                  {user.role === "customer" && (
                    <Link to="/orders" className="btn">
                      My Orders
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link to="/admin" className="btn">
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="guest-cta">
                <p className="hero-subtitle">
                  Order your favorite meals from the best restaurants.
                  <br />
                  Fast delivery. Quality guaranteed.
                </p>
                {guestOrder && (
                  <div className="guest-order-notification">
                    <div className="guest-order-message">
                      <strong>Your Recent Dine-In Order:</strong> #{guestOrder.orderNumber}
                    </div>
                    <Link
                      to={`/orders/guest/${guestOrder.orderId}`}
                      className="btn btn-primary guest-order-button"
                    >
                      View Your Order
                    </Link>
                  </div>
                )}
                <div className="button-group">
                  <Link to="/register" className="btn btn-large">
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <Menu />
    </div>
  );
};

export default Home;
