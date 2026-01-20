import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../../config/api";

// Medium-level types for Inventory
type Unit = "kg" | "g" | "l" | "ml" | "pcs" | "packs";

type Category =
  | "Meat"
  | "Vegetables"
  | "Dairy"
  | "Beverages"
  | "Spices"
  | "Grains"
  | "Seafood"
  | "Fruits"
  | "General";

interface InventoryItem {
  _id: string;
  itemName: string;
  quantity: number;
  unit: Unit;
  lowStockThreshold: number;
  category: Category;
  lastUpdated?: string | Date;
}

interface InventoryForm {
  itemName: string;
  quantity: number;
  unit: Unit;
  lowStockThreshold: number;
  category: Category;
}

const InventoryDashboard: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<InventoryForm>({
    itemName: "",
    quantity: 0,
    unit: "pcs",
    lowStockThreshold: 10,
    category: "General",
  });

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<InventoryItem[]>(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/inventory`, newItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInventory();
      setShowAddModal(false);
      setNewItem({
        itemName: "",
        quantity: 0,
        unit: "pcs",
        lowStockThreshold: 10,
        category: "General",
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add item");
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/inventory/${id}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchInventory();
    } catch (err) {
      alert("Failed to update quantity");
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/inventory/${editingItem._id}`,
        {
          itemName: editingItem.itemName,
          quantity: editingItem.quantity,
          unit: editingItem.unit,
          lowStockThreshold: editingItem.lowStockThreshold,
          category: editingItem.category,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchInventory();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInventory();
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Inventory...</p>
      </div>
    );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">📦</span>
            Inventory Management
          </h1>
          <p className="dashboard-subtitle">Track and manage restaurant inventory items</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <span>➕</span> Add New Item
        </button>
      </div>

      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="table-row-hover">
                <td title={item.itemName.length > 30 ? item.itemName : undefined}>
                  {item.itemName.length > 30
                    ? `${item.itemName.substring(0, 30)}...`
                    : item.itemName}
                </td>
                <td>{item.category}</td>
                <td>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item._id, Math.max(0, item.quantity - 1))}
                    >
                      -
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td>{item.unit}</td>
                <td>
                  {item.quantity <= item.lowStockThreshold ? (
                    <span className="modern-badge badge-error">
                      <span className="badge-icon">⚠️</span>
                      Low Stock
                    </span>
                  ) : (
                    <span className="modern-badge badge-success">
                      <span className="badge-icon">✓</span>
                      Good
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEditItem(item)}
                      className="action-btn edit-btn"
                      title="Edit item"
                    >
                      <span>✏️</span> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="action-btn delete-btn"
                      title="Delete item"
                    >
                      <span>🗑️</span> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📦</span>
          <p>No inventory items found. Add your first item to get started!</p>
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">
              <span className="title-icon">➕</span>
              Add Inventory Item
            </h2>
            <form onSubmit={handleAddItem} className="modern-form">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📝</span>
                  Item Name{" "}
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    ({newItem.itemName.length}/50)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  className="form-input"
                  placeholder="Enter item name (max 50 characters)"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏷️</span>
                  Category
                </label>
                <select
                  className="form-input"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                >
                  <option value="General">General</option>
                  <option value="Meat">Meat</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Spices">Spices</option>
                  <option value="Grains">Grains</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🔢</span>
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={1000000}
                    className="form-input"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📏</span>
                    Unit
                  </label>
                  <select
                    className="form-input"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value as Unit })}
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="packs">packs</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">⚠️</span>
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  required
                  className="form-input"
                  placeholder="e.g., 10"
                  value={newItem.lowStockThreshold}
                  onChange={(e) =>
                    setNewItem({ ...newItem, lowStockThreshold: Number(e.target.value) })
                  }
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  <span>✓</span> Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  <span>✕</span> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay">
          <div className="modern-modal">
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="modal-icon">✏️</span>
                Edit Inventory Item
              </h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">📝</span>
                  Item Name{" "}
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    ({editingItem.itemName.length}/50)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  className="form-input"
                  placeholder="Enter item name (max 50 characters)"
                  value={editingItem.itemName}
                  onChange={(e) => setEditingItem({ ...editingItem, itemName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏷️</span>
                  Category
                </label>
                <select
                  className="form-input"
                  value={editingItem.category}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, category: e.target.value as Category })
                  }
                >
                  <option value="General">General</option>
                  <option value="Meat">Meat</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Spices">Spices</option>
                  <option value="Grains">Grains</option>
                  <option value="Seafood">Seafood</option>
                  <option value="Fruits">Fruits</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🔢</span>
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={1000000}
                    className="form-input"
                    placeholder="0"
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, quantity: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📏</span>
                    Unit
                  </label>
                  <select
                    className="form-input"
                    value={editingItem.unit}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unit: e.target.value as Unit })
                    }
                  >
                    <option value="pcs">pcs</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">l</option>
                    <option value="ml">ml</option>
                    <option value="packs">packs</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">⚠️</span>
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={10000}
                  className="form-input"
                  placeholder="e.g., 10"
                  value={editingItem.lowStockThreshold}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, lowStockThreshold: Number(e.target.value) })
                  }
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  <span>✓</span> Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="btn btn-secondary"
                >
                  <span>✕</span> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
