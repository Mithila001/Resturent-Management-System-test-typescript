import { useState } from "react";
import POS from "./POS";
import Billing from "./Billing";

const CashierDashboard = () => {
  const [activeTab, setActiveTab] = useState("pos");

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto", padding: "1rem" }}>
      <h1 className="page-title">Cashier Point</h1>

      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #ddd" }}>
        <button
          onClick={() => setActiveTab("pos")}
          style={{
            padding: "1rem 2rem",
            background: activeTab === "pos" ? "#ff6b35" : "transparent",
            color: activeTab === "pos" ? "white" : "#666",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.1rem",
          }}
        >
          New Order (POS)
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          style={{
            padding: "1rem 2rem",
            background: activeTab === "billing" ? "#ff6b35" : "transparent",
            color: activeTab === "billing" ? "white" : "#666",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.1rem",
            marginLeft: "1rem",
          }}
        >
          Billing & Active Orders
        </button>
      </div>

      {activeTab === "pos" ? <POS /> : <Billing />}
    </div>
  );
};

export default CashierDashboard;
