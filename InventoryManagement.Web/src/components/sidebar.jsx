import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "📊",
    },
    {
      path: "/equipment",
      label: "Equipment",
      icon: "💻",
    },
    {
      path: "/categories",
      label: "Categories",
      icon: "📁",
    },
    {
      path: "/suppliers",
      label: "Suppliers",
      icon: "🚚",
    },
    {
      path: "/customers",
      label: "Customers",
      icon: "👥",
    },
    {
      path: "/purchases",
      label: "Purchases",
      icon: "🛒",
    },
    {
      path: "/sales",
      label: "Sales",
      icon: "💰",
    },
    {
      path: "/assignments",
      label: "Assignments",
      icon: "📋",
    },
    {
      path: "/stock-transactions",
      label: "Stock Transactions",
      icon: "🔄",
    },
    {
      path: "/abc-analysis",
      label: "ABC Analysis",
      icon: "📈",
    },
    {
      path: "/users",
      label: "Users",
      icon: "👤",
    },
  ];

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          📦
        </div>

        <div>
          <h2>Inventory</h2>
          <span>Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        <p className="nav-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${
                isActive ? "active" : ""
              }`
            }
          >
            <span className="sidebar-icon">
              {item.icon}
            </span>

            <span className="sidebar-label">
              {item.label}
            </span>
          </NavLink>
        ))}

      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">

        <div className="sidebar-version">
          Inventory Management System
          <span>v1.0</span>
        </div>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <span>🚪</span>
          Logout
        </button>

      </div>

    </aside>
  );
}