import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Equipment from "./pages/Equipment";
import Assignment from "./pages/Assignments";
import Suppliers from "./pages/Suppliers";
import Categories from "./pages/Categories";
import Transactions from "./pages/Transactions";
import ABCAnalysis from "./pages/ABCAnalysis";
import Users from "./pages/Users";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";

import MainLayout from "./components/MainLayout";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ====================================== */}
        {/* LOGIN */}
        {/* ====================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ====================================== */}
        {/* PROTECTED PAGES */}
        {/* ====================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Equipment />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Assignment />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Suppliers />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Categories />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/stock-transactions"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Transactions />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/abc-analysis"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ABCAnalysis />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Users />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Purchases />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Sales />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Customers />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* ====================================== */}
        {/* DEFAULT */}
        {/* ====================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* ====================================== */}
        {/* UNKNOWN URL */}
        {/* ====================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


/* ========================================== */
/* PROTECTED ROUTE */
/* ========================================== */

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


export default App;