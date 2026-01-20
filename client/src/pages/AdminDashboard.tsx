import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../config/api";
import {
  type MenuItem,
  type Category,
  type Order,
  type ItemForm,
  type CategoryForm,
} from "../interfaces/types";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext) as { user: any };
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [itemForm, setItemForm] = useState<ItemForm>({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
    isVegetarian: false,
    isSpicy: false,
    preparationTime: 15,
  });

  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true,
    order: 0,
  });

  // Define fetch functions before useEffect hooks that use them
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/menu`);
      setMenuItems(data);
    } catch (err) {
      setError("Failed to fetch menu items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categories`);
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/orders`, getAuthHeaders());
      setOrders(data.orders || data);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchCategories();
      fetchMenuItems();
      fetchOrders();
    }
  }, [user, fetchCategories, fetchMenuItems, fetchOrders]);

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket || !user || user.role !== "admin") return;

    const handleOrderStatusUpdate = () => {
      fetchOrders(); // Auto-refresh orders when any order is updated
    };

    const handlePaymentStatusUpdate = () => {
      fetchOrders();
    };

    socket.on("orderStatusUpdated", handleOrderStatusUpdate);
    socket.on("paymentStatusUpdated", handlePaymentStatusUpdate);

    return () => {
      socket.off("orderStatusUpdated", handleOrderStatusUpdate);
      socket.off("paymentStatusUpdated", handlePaymentStatusUpdate);
    };
  }, [socket, user, fetchOrders]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { orderStatus: newStatus },
        getAuthHeaders(),
      );
      fetchOrders();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/payment`,
        { paymentStatus: newStatus },
        getAuthHeaders(),
      );
      fetchOrders();
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update payment status");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#ffc107",
      confirmed: "#2196f3",
      preparing: "#ff9800",
      ready: "#4caf50",
      "out-for-delivery": "#9c27b0",
      delivered: "#4caf50",
      cancelled: "#f44336",
    };
    return colors[status] || "#666";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleItemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/menu/${editingItem._id}`, itemForm, getAuthHeaders());
      } else {
        await axios.post(`${API_URL}/menu`, itemForm, getAuthHeaders());
      }
      setShowItemModal(false);
      resetItemForm();
      fetchMenuItems();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save menu item");
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(
          `${API_URL}/categories/${editingCategory._id}`,
          categoryForm,
          getAuthHeaders(),
        );
      } else {
        await axios.post(`${API_URL}/categories`, categoryForm, getAuthHeaders());
      }
      setShowCategoryModal(false);
      resetCategoryForm();
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${API_URL}/menu/${id}`, getAuthHeaders());
        fetchMenuItems();
      } catch (error) {
        setError("Failed to delete menu item");
        console.error(error);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${API_URL}/categories/${id}`, getAuthHeaders());
        fetchCategories();
      } catch (error) {
        setError("Failed to delete category");
        console.error(error);
      }
    }
  };

  const openEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category && typeof item.category === "object" ? item.category._id : item.category,
      imageUrl: item.imageUrl || "",
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isSpicy: item.isSpicy,
      preparationTime: item.preparationTime,
    });
    setShowItemModal(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      isActive: category.isActive,
      order: category.order,
    });
    setShowCategoryModal(true);
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setItemForm({
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      isAvailable: true,
      isVegetarian: false,
      isSpicy: false,
      preparationTime: 15,
    });
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true,
      order: 0,
    });
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <h1 style={{ marginBottom: "2rem" }}>Admin Dashboard</h1>

      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: "var(--border-radius)",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          onClick={() => setActiveTab("orders")}
          className={activeTab === "orders" ? "btn btn-primary" : "btn"}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("menu")}
          className={activeTab === "menu" ? "btn btn-primary" : "btn"}
        >
          Menu Items
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={activeTab === "categories" ? "btn btn-primary" : "btn"}
        >
          Categories
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          <h2 style={{ marginBottom: "1rem" }}>Order Management</h2>

          {loading ? (
            <p>Loading orders...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              {orders.length === 0 ? (
                <p>No orders found</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order._id}
                    style={{
                      background: "white",
                      padding: "1.5rem",
                      borderRadius: "var(--border-radius)",
                      marginBottom: "1.5rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid var(--border-color)",
                      }}
                    >
                      <div>
                        <h3 style={{ margin: "0 0 0.5rem 0" }}>Order #{order.orderNumber}</h3>
                        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                          {formatDate(order.createdAt)}
                        </p>
                        <p
                          style={{
                            margin: "0.25rem 0 0 0",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Customer: {order.user?.name || "N/A"}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.5rem 1rem",
                            borderRadius: "20px",
                            background: getStatusColor(order.orderStatus),
                            color: "white",
                            fontWeight: "bold",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {order.orderStatus.toUpperCase().replace("-", " ")}
                        </div>
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: "bold",
                            color: "var(--primary-color)",
                          }}
                        >
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4>Order Items:</h4>
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "0.5rem 0",
                            borderBottom: "1px dashed var(--border-color)",
                          }}
                        >
                          <span>
                            {item.name} x {item.quantity}
                          </span>
                          <span>${item.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <h4>Delivery Address:</h4>
                      {order.deliveryAddress ? (
                        <p style={{ margin: "0.5rem 0" }}>
                          {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
                          {order.deliveryAddress.postalCode}
                        </p>
                      ) : (
                        <p style={{ margin: "0.5rem 0" }}>N/A</p>
                      )}
                      {order.deliveryAddress && (
                        <p style={{ margin: "0.5rem 0" }}>Phone: {order.deliveryAddress.phone}</p>
                      )}
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Payment: </strong>
                      <span style={{ textTransform: "capitalize" }}>
                        {order.paymentMethod} - {order.paymentStatus}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <div>
                        <strong>Update Order Status:</strong>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {["confirmed", "preparing", "ready", "out-for-delivery", "delivered"].map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() => handleUpdateOrderStatus(order._id, status)}
                                className="btn"
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.875rem",
                                  background:
                                    order.orderStatus === status
                                      ? getStatusColor(status)
                                      : "#f5f5f5",
                                  color: order.orderStatus === status ? "white" : "#333",
                                  border: order.orderStatus === status ? "none" : "1px solid #ddd",
                                }}
                                disabled={order.orderStatus === status}
                              >
                                {status.replace("-", " ")}
                              </button>
                            ),
                          )}
                          {order.orderStatus !== "cancelled" &&
                            order.orderStatus !== "delivered" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order._id, "cancelled")}
                                className="btn"
                                style={{
                                  padding: "0.5rem 1rem",
                                  fontSize: "0.875rem",
                                  background: "#f44336",
                                  color: "white",
                                }}
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </div>

                      <div>
                        <strong>Update Payment Status:</strong>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginTop: "0.5rem",
                          }}
                        >
                          {["pending", "paid", "failed"].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdatePaymentStatus(order._id, status)}
                              className="btn"
                              style={{
                                padding: "0.5rem 1rem",
                                fontSize: "0.875rem",
                                background: order.paymentStatus === status ? "#4caf50" : "#f5f5f5",
                                color: order.paymentStatus === status ? "white" : "#333",
                                border: order.paymentStatus === status ? "none" : "1px solid #ddd",
                              }}
                              disabled={order.paymentStatus === status}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Menu Items Tab */}
      {activeTab === "menu" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2>Menu Items</h2>
            <button
              onClick={() => {
                resetItemForm();
                setShowItemModal(true);
              }}
              className="btn btn-primary"
            >
              + Add Menu Item
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "white",
                }}
              >
                <thead>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Name</th>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Category</th>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Price</th>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "1rem", textAlign: "left" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem" }}>{item.name}</td>
                      <td style={{ padding: "1rem" }}>
                        {item.category && typeof item.category === "object" ? item.category.name : "N/A"}
                      </td>
                      <td style={{ padding: "1rem" }}>${item.price.toFixed(2)}</td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "var(--border-radius)",
                            background: item.isAvailable ? "var(--success-light)" : "#ffebee",
                            color: item.isAvailable ? "var(--success-color)" : "#c62828",
                          }}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <button
                          onClick={() => openEditItem(item)}
                          className="btn"
                          style={{
                            marginRight: "0.5rem",
                            padding: "0.25rem 0.75rem",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="btn"
                          style={{
                            padding: "0.25rem 0.75rem",
                            background: "#ffebee",
                            color: "#c62828",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2>Categories</h2>
            <button
              onClick={() => {
                resetCategoryForm();
                setShowCategoryModal(true);
              }}
              className="btn btn-primary"
            >
              + Add Category
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "white",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Order</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "1rem", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "1rem" }}>{category.name}</td>
                    <td style={{ padding: "1rem" }}>{category.description || "N/A"}</td>
                    <td style={{ padding: "1rem" }}>{category.order}</td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "var(--border-radius)",
                          background: category.isActive ? "var(--success-light)" : "#ffebee",
                          color: category.isActive ? "var(--success-color)" : "#c62828",
                        }}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button
                        onClick={() => openEditCategory(category)}
                        className="btn"
                        style={{
                          marginRight: "0.5rem",
                          padding: "0.25rem 0.75rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="btn"
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "#ffebee",
                          color: "#c62828",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Menu Item Modal */}
      {showItemModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "var(--border-radius)",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2>{editingItem ? "Edit Menu Item" : "Add Menu Item"}</h2>
            <form onSubmit={handleItemSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label>Name *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Description *</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Category *</label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Image URL</label>
                <input
                  type="text"
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Preparation Time (minutes)</label>
                <input
                  type="number"
                  value={itemForm.preparationTime}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      preparationTime: parseInt(e.target.value) || 15,
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        isAvailable: e.target.checked,
                      })
                    }
                  />{" "}
                  Available
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={itemForm.isVegetarian}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        isVegetarian: e.target.checked,
                      })
                    }
                  />{" "}
                  Vegetarian
                </label>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={itemForm.isSpicy}
                    onChange={(e) => setItemForm({ ...itemForm, isSpicy: e.target.checked })}
                  />{" "}
                  Spicy
                </label>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowItemModal(false);
                    resetItemForm();
                  }}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "var(--border-radius)",
              maxWidth: "500px",
              width: "90%",
            }}
          >
            <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>
            <form onSubmit={handleCategorySubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label>Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Image URL</label>
                <input
                  type="text"
                  value={categoryForm.imageUrl}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      imageUrl: e.target.value,
                    })
                  }
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>Order</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={categoryForm.isActive}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        isActive: e.target.checked,
                      })
                    }
                  />{" "}
                  Active
                </label>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    resetCategoryForm();
                  }}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
