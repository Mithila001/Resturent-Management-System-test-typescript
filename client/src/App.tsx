import React from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { SocketProvider } from "./context/SocketContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Menu from "./pages/Menu";
import AdminDashboard from "./pages/AdminDashboard";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import OrderTracking from "./pages/OrderTracking";
import GuestOrderTracking from "./pages/GuestOrderTracking";
import Cart from "./components/Cart";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

import WaiterDashboard from "./pages/waiter/WaiterDashboard";
import ChefDashboard from "./pages/kitchen/ChefDashboard";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import OwnerDashboard from "./pages/admin/OwnerDashboard";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";

// ... existing imports

const Navigation = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="modern-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">RestoApp</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span className={isMenuOpen ? "hamburger open" : "hamburger"}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Navigation Links */}
        <div className={`nav-links ${isMenuOpen ? "mobile-open" : ""}`}>
          <div className="nav-main-links">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <span className="nav-icon">🏠</span> Home
            </Link>
            <Link to="/menu" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              <span className="nav-icon">📋</span> Menu
            </Link>
            {user && (
              <Link to="/orders" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                <span className="nav-icon">📦</span> My Orders
              </Link>
            )}
          </div>

          {/* Role-based Links */}
          {user && (
            <div className="nav-role-links">
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="nav-link nav-link-role"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">⚙️</span> Admin
                </Link>
              )}
              {user.role === "waiter" && (
                <Link
                  to="/waiter"
                  className="nav-link nav-link-role"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">👔</span> Waiter
                </Link>
              )}
              {user.role === "chef" && (
                <Link
                  to="/chef"
                  className="nav-link nav-link-role"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">👨‍🍳</span> Chef
                </Link>
              )}
              {user.role === "cashier" && (
                <Link
                  to="/cashier"
                  className="nav-link nav-link-role"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">💰</span> Cashier
                </Link>
              )}
              {user.role === "manager" && (
                <Link
                  to="/manager"
                  className="nav-link nav-link-role"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">📊</span> Manager
                </Link>
              )}
              {user.role === "owner" && (
                <Link
                  to="/owner"
                  className="nav-link nav-link-role"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">👑</span> Owner
                </Link>
              )}
              {(user.role === "manager" ||
                user.role === "owner" ||
                user.role === "chef" ||
                user.role === "admin") && (
                <Link
                  to="/inventory"
                  className="nav-link nav-link-role"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="nav-icon">📦</span> Inventory
                </Link>
              )}
            </div>
          )}

          {/* Auth Section */}
          <div className="nav-auth-section">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <span className="theme-icon">{isDarkMode ? "☀️" : "🌙"}</span>
            </button>

            {user ? (
              <>
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">{user?.role}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  <span className="logout-icon">🚪</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="nav-link nav-link-auth"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary signup-btn"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <div className="app">
                <Navigation />
                <Cart />

                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/menu" element={<Menu />} />

                    {/* Public guest order tracking */}
                    <Route path="/orders/guest/:orderId" element={<GuestOrderTracking />} />

                    {/* Checkout - allow guests for dine-in */}
                    <Route path="/checkout" element={<Checkout />} />

                    {/* Protected Routes */}
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <OrderHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders/:orderId"
                      element={
                        <ProtectedRoute>
                          <OrderTracking />
                        </ProtectedRoute>
                      }
                    />

                    {/* Role-based Protected Routes */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/waiter"
                      element={
                        <ProtectedRoute allowedRoles={["waiter"]}>
                          <WaiterDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chef"
                      element={
                        <ProtectedRoute allowedRoles={["chef"]}>
                          <ChefDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cashier"
                      element={
                        <ProtectedRoute allowedRoles={["cashier"]}>
                          <CashierDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/manager"
                      element={
                        <ProtectedRoute allowedRoles={["manager"]}>
                          <ManagerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/owner"
                      element={
                        <ProtectedRoute allowedRoles={["owner"]}>
                          <OwnerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/inventory"
                      element={
                        <ProtectedRoute allowedRoles={["manager", "owner", "chef", "admin"]}>
                          <InventoryDashboard />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
