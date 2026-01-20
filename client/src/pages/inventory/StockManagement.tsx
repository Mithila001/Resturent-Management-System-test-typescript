// Stock Management Component for Inventory Management
import React, { useState, useEffect } from "react";
import { inventoryAPI } from "../../api/inventoryAPI";

interface StockItem {
  _id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastUpdated: Date;
}

const StockManagement: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newItem, setNewItem] = useState({
    itemName: "",
    category: "",
    quantity: 0,
    unit: "pcs",
    lowStockThreshold: 10,
  });

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    filterItems();
  }, [stockItems, searchTerm, categoryFilter, showLowStock]);

  const fetchStock = async () => {
    try {
      const response = await inventoryAPI.getInventory();
      setStockItems(response.data || []);
    } catch (error) {
      console.error("Failed to fetch stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = stockItems;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (showLowStock) {
      filtered = filtered.filter((item) => item.quantity <= item.lowStockThreshold);
    }

    setFilteredItems(filtered);
  };

  const addStockItem = async () => {
    try {
      await inventoryAPI.addInventoryItem(newItem);
      setNewItem({
        itemName: "",
        category: "",
        quantity: 0,
        unit: "pcs",
        lowStockThreshold: 10,
      });
      setShowAddForm(false);
      fetchStock();
    } catch (error) {
      console.error("Failed to add stock item:", error);
      alert("Failed to add stock item");
    }
  };

  const updateStock = async (itemId: string, newQuantity: number) => {
    try {
      await inventoryAPI.updateInventoryItem(itemId, { quantity: newQuantity });
      fetchStock();
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock");
    }
  };

  const deleteStockItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this stock item?")) return;

    try {
      await inventoryAPI.deleteInventoryItem(itemId);
      fetchStock();
    } catch (error) {
      console.error("Failed to delete stock item:", error);
      alert("Failed to delete stock item");
    }
  };

  const getStockStatus = (item: StockItem) => {
    if (item.quantity <= 0) return { status: "out-of-stock", text: "Out of Stock" };
    if (item.quantity <= item.lowStockThreshold) return { status: "low-stock", text: "Low Stock" };
    return { status: "in-stock", text: "In Stock" };
  };

  const categories = [...new Set(stockItems.map((item) => item.category))];

  if (loading) {
    return <div className="loading-container">Loading inventory...</div>;
  }

  return (
    <div className="stock-management">
      <div className="stock-header">
        <h2>📦 Stock Management</h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="add-stock-btn">
          ➕ Add Stock Item
        </button>
      </div>

      {/* Add Stock Form */}
      {showAddForm && (
        <div className="add-form-overlay">
          <div className="add-form">
            <h3>Add New Stock Item</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Item Name"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              />
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="Meat">Meat</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Dairy">Dairy</option>
                <option value="Beverages">Beverages</option>
                <option value="Spices">Spices</option>
                <option value="Grains">Grains</option>
                <option value="Seafood">Seafood</option>
                <option value="Fruits">Fruits</option>
                <option value="General">General</option>
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              />
              <select
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="l">Liter (l)</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="packs">Packs</option>
              </select>
              <input
                type="number"
                placeholder="Low Stock Threshold"
                value={newItem.lowStockThreshold}
                onChange={(e) =>
                  setNewItem({ ...newItem, lowStockThreshold: Number(e.target.value) })
                }
              />
            </div>
            <div className="form-actions">
              <button onClick={addStockItem} className="save-btn">
                Save
              </button>
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <label className="low-stock-filter">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
          />
          Show Low Stock Only
        </label>
      </div>

      {/* Stock Items */}
      <div className="stock-grid">
        {filteredItems.map((item) => {
          const stockStatus = getStockStatus(item);
          return (
            <div key={item._id} className={`stock-card ${stockStatus.status}`}>
              <div className="stock-header">
                <h4>{item.itemName}</h4>
                <span className={`stock-badge ${stockStatus.status}`}>{stockStatus.text}</span>
              </div>
              <div className="stock-details">
                <p>
                  <strong>Category:</strong> {item.category}
                </p>
                <p>
                  <strong>Current Stock:</strong> {item.quantity} {item.unit}
                </p>
                <p>
                  <strong>Low Stock Threshold:</strong> {item.lowStockThreshold} {item.unit}
                </p>
                <p>
                  <strong>Last Updated:</strong> {new Date(item.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div className="stock-actions">
                <div className="quantity-controls">
                  <button
                    onClick={() => updateStock(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 0}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateStock(item._id, item.quantity + 1)}>+</button>
                </div>
                <button onClick={() => deleteStockItem(item._id)} className="delete-btn">
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <p>No stock items found</p>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
