import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Equipment from "./pages/Equipment";
import Assignment from "./pages/Assignments";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import Transactions from "./pages/Transactions";
import ABCAnalysis from "./pages/ABCAnalysis";
import Users from "./pages/Users";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Equipment */}
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <Equipment />
            </ProtectedRoute>
          }
        />

        {/* Home */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
        <Route
  path="/assignments"
  element={
    <ProtectedRoute>
      <Assignment />
    </ProtectedRoute>
  }
/>
<Route
  path="/suppliers"
  element={
    <ProtectedRoute>
      <Suppliers />
    </ProtectedRoute>
  }
/>
<Route
  path="/categories"
  element={
    <ProtectedRoute>
      <Categories />
    </ProtectedRoute>
  }
/>

<Route
  path="/stock-transactions"
  element={
    <ProtectedRoute>
      <Transactions />
    </ProtectedRoute>
  }
/>
<Route
  path="/abc-analysis"
  element={
    <ProtectedRoute>
      <ABCAnalysis />
    </ProtectedRoute>
  }
/>
<Route
  path="/users"
  element={
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  }
/>
 

      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;