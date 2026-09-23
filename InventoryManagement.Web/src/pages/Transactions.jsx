import { useEffect, useState } from "react";
import api from "../services/api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // ==============================
  // LOAD TRANSACTIONS
  // ==============================

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");

      const response = await api.get("/StockTransactions");

      setTransactions(response.data);
    } catch (error) {
      console.error("Transaction error:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Failed to load transactions."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // ==============================
  // DELETE TRANSACTION
  // ==============================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");
      setMessageType("");

      await api.delete(`/StockTransactions/${id}`);

      setMessage("Transaction deleted successfully.");
      setMessageType("success");

      await loadTransactions();
    } catch (error) {
      console.error("Delete transaction error:", error);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.title ||
          "Failed to delete transaction."
      );

      setMessageType("error");
    }
  };

  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  // ==============================
  // TRANSACTION TYPE
  // ==============================

  const getTransactionType = (type) => {
    if (!type) {
      return "-";
    }

    return type.toUpperCase();
  };

  // ==============================
  // PAGE
  // ==============================

  return (
    <div className="transactions-page">

      {/* ==============================
          HEADER
      ============================== */}

      <div className="transactions-header">

        <div>
          <h1>Stock Transactions</h1>

          <p>
            View and manage inventory stock movement history.
          </p>
        </div>

        <button
          type="button"
          className="transactions-refresh-btn"
          onClick={loadTransactions}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ==============================
          MESSAGE
      ============================== */}

      {message && (
        <div
          className={
            messageType === "success"
              ? "transactions-message transactions-success"
              : "transactions-message transactions-error"
          }
        >
          {message}
        </div>
      )}

      {/* ==============================
          SUMMARY
      ============================== */}

      <div className="transactions-summary">

        <div className="transaction-summary-card">
          <span>Total Transactions</span>
          <strong>{transactions.length}</strong>
        </div>

        <div className="transaction-summary-card">
          <span>Stock In</span>
          <strong>
            {
              transactions.filter(
                (transaction) =>
                  transaction.transactionType?.toUpperCase() === "IN"
              ).length
            }
          </strong>
        </div>

        <div className="transaction-summary-card">
          <span>Stock Out</span>
          <strong>
            {
              transactions.filter(
                (transaction) =>
                  transaction.transactionType?.toUpperCase() === "OUT"
              ).length
            }
          </strong>
        </div>

      </div>

      {/* ==============================
          TRANSACTION CARD
      ============================== */}

      <div className="transactions-card">

        <div className="transactions-card-header">

          <div>
            <h2>Transaction History</h2>

            <p>
              {transactions.length} transaction
              {transactions.length !== 1 ? "s" : ""}
            </p>
          </div>

        </div>

        {/* ==============================
            LOADING
        ============================== */}

        {loading ? (

          <div className="transactions-empty">
            Loading transactions...
          </div>

        ) : transactions.length === 0 ? (

          <div className="transactions-empty">
            No transactions found.
          </div>

        ) : (

          /* ==============================
             TABLE
          ============================== */

          <div className="transactions-table-wrapper">

            <table className="transactions-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Equipment</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {transactions.map((transaction) => (

                  <tr key={transaction.id}>

                    {/* ID */}

                    <td>
                      #{transaction.id}
                    </td>

                    {/* EQUIPMENT */}

                    <td className="transaction-equipment-name">

                      {transaction.equipment
                        ? transaction.equipment.name
                        : `Equipment #${transaction.equipmentId}`}

                    </td>

                    {/* EQUIPMENT CODE */}

                    <td>

                      {transaction.equipment
                        ? transaction.equipment.equipmentCode
                        : "-"}

                    </td>

                    {/* TYPE */}

                    <td>

                      {getTransactionType(
                        transaction.transactionType
                      ) === "IN" ? (

                        <span className="transaction-type transaction-in">
                          IN
                        </span>

                      ) : (

                        <span className="transaction-type transaction-out">
                          OUT
                        </span>

                      )}

                    </td>

                    {/* QUANTITY */}

                    <td>
                      {transaction.quantity}
                    </td>

                    {/* DATE */}

                    <td>
                      {formatDate(
                        transaction.transactionDate
                      )}
                    </td>

                    {/* REMARKS */}

                    <td className="transaction-remarks">

                      {transaction.remarks || "-"}

                    </td>

                    {/* DELETE */}

                    <td>

                      <button
                        type="button"
                        className="transaction-delete-btn"
                        onClick={() =>
                          handleDelete(transaction.id)
                        }
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

    </div>
  );
}

export default Transactions;