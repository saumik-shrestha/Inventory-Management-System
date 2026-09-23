import "./Dashboard.css";
import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Dashboard");

      setDashboard(response.data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (error.response?.status === 403) {
        setError("You do not have permission to access the dashboard.");
      } else {
        setError("Unable to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>{error}</h2>

        <button onClick={logout}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>Inventory</h2>
          <span>Management System</span>
        </div>

        <nav className="sidebar-nav">

  <a href="/dashboard">
    Dashboard
  </a>

  <a href="/equipment">
    Equipment
  </a>

  <a href="/categories">
    Categories
  </a>

  <a href="/suppliers">
    Suppliers
  </a>

  <a href="/stock-transactions">
    Stock Transactions
  </a>

  <a href="/assignments">
    Assignments
  </a>

  <a href="/abc-analysis">
    ABC Analysis
  </a>

  {user?.role === "admin" && (
    <a href="/users">
      Users
    </a>
  )}

</nav>
        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </aside>

      {/* Main Content */}
      <main className="dashboard-content">

        {/* Header */}
        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome back,{" "}
              <strong>
                {user?.fullName || user?.username}
              </strong>
            </p>
          </div>

          <div className="user-info">
            <div className="user-avatar">
              {(user?.fullName || user?.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {user?.fullName || user?.username}
              </strong>

              <span>
                {user?.role}
              </span>
            </div>
          </div>

        </header>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">
              📦
            </div>

            <div>
              <p>Total Equipment</p>
              <h2>{dashboard.totalEquipment}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              📊
            </div>

            <div>
              <p>Total Stock</p>
              <h2>{dashboard.totalStock}</h2>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              ⚠️
            </div>

            <div>
              <p>Low Stock</p>
              <h2>{dashboard.lowStock}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              🚚
            </div>

            <div>
              <p>Suppliers</p>
              <h2>{dashboard.totalSuppliers}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              👥
            </div>

            <div>
              <p>Users</p>
              <h2>{dashboard.totalUsers}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              💻
            </div>

            <div>
              <p>Assigned Equipment</p>
              <h2>{dashboard.assignedEquipment}</h2>
            </div>
          </div>

        </section>

        {/* Recent Transactions */}
        <section className="recent-section">

          <div className="section-header">
            <div>
              <h2>Recent Transactions</h2>
              <p>Latest inventory movements</p>
            </div>

            <div className="transaction-count">
              Total: {dashboard.totalTransactions}
            </div>
          </div>

          {dashboard.recentTransactions?.length === 0 ? (

            <div className="empty-state">
              <div>📋</div>
              <h3>No transactions yet</h3>
              <p>
                Stock transactions will appear here.
              </p>
            </div>

          ) : (

            <div className="transaction-table-wrapper">

              <table className="transaction-table">

                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>

                <tbody>

                  {dashboard.recentTransactions.map(
                    (transaction) => (

                      <tr key={transaction.id}>

                        <td>
                          {transaction.equipment?.name ||
                            "Unknown"}
                        </td>

                        <td>
                          {transaction.equipment
                            ?.equipmentCode || "-"}
                        </td>

                        <td>
                          <span
                            className={
                              transaction.transactionType ===
                              "IN"
                                ? "badge badge-in"
                                : "badge badge-out"
                            }
                          >
                            {transaction.transactionType}
                          </span>
                        </td>

                        <td>
                          {transaction.quantity}
                        </td>

                        <td>
                          {new Date(
                            transaction.transactionDate
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          {transaction.remarks || "-"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;