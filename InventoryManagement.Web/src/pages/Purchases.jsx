import { useEffect, useState } from "react";
import api from "../services/api";
import "./Purchases.css";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    receivedDate: new Date().toISOString().split("T")[0],
    status: "Received",
    tax: 0,
    discount: 0,
    otherCharges: 0,
    remarks: "",
    items: [
      {
        equipmentId: "",
        quantity: 1,
        unitCost: 0,
      },
    ],
  });

  useEffect(() => {
    loadData();
  }, []);

  // =========================
  // LOAD DATA
  // =========================

  const loadData = async () => {
    try {
      setLoading(true);

      const [purchaseRes, supplierRes, equipmentRes] =
        await Promise.all([
          api.get("/Purchases"),
          api.get("/Suppliers"),
          api.get("/Equipment"),
        ]);

      setPurchases(purchaseRes.data);
      setSuppliers(supplierRes.data);
      setEquipment(equipmentRes.data);
    } catch (error) {
      console.error("Failed to load purchase data:", error);
      alert("Failed to load purchase data.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM HANDLERS
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          equipmentId: "",
          quantity: 1,
          unitCost: 0,
        },
      ],
    });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) {
      return;
    }

    const updatedItems = form.items.filter(
      (_, i) => i !== index
    );

    setForm({
      ...form,
      items: updatedItems,
    });
  };

  // =========================
  // CALCULATIONS
  // =========================

  const calculateSubtotal = () => {
    return form.items.reduce((total, item) => {
      return (
        total +
        Number(item.quantity || 0) *
          Number(item.unitCost || 0)
      );
    }, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();

    return (
      subtotal +
      Number(form.tax || 0) +
      Number(form.otherCharges || 0) -
      Number(form.discount || 0)
    );
  };

  // =========================
  // SUBMIT PURCHASE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.supplierId) {
      alert("Please select a supplier.");
      return;
    }

    for (const item of form.items) {
      if (!item.equipmentId) {
        alert("Please select equipment for every item.");
        return;
      }

      if (Number(item.quantity) <= 0) {
        alert("Quantity must be greater than 0.");
        return;
      }

      if (Number(item.unitCost) < 0) {
        alert("Unit cost cannot be negative.");
        return;
      }
    }

    try {
      const payload = {
        supplierId: Number(form.supplierId),

        invoiceNumber: form.invoiceNumber,

        purchaseDate: form.purchaseDate,

        receivedDate:
          form.status === "Received"
            ? form.receivedDate
            : null,

        status: form.status,

        tax: Number(form.tax),

        discount: Number(form.discount),

        otherCharges: Number(form.otherCharges),

        remarks: form.remarks,

        items: form.items.map((item) => ({
          equipmentId: Number(item.equipmentId),
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      };

      await api.post("/Purchases", payload);

      alert("Purchase created successfully!");

      resetForm();

      await loadData();
    } catch (error) {
      console.error(
        "Purchase creation failed:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create purchase."
      );
    }
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setForm({
      supplierId: "",
      invoiceNumber: "",
      purchaseDate:
        new Date().toISOString().split("T")[0],

      receivedDate:
        new Date().toISOString().split("T")[0],

      status: "Received",

      tax: 0,
      discount: 0,
      otherCharges: 0,

      remarks: "",

      items: [
        {
          equipmentId: "",
          quantity: 1,
          unitCost: 0,
        },
      ],
    });

    setShowForm(false);
  };

  // =========================
  // CURRENCY FORMAT
  // =========================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="purchase-page">
        <div className="loading">
          Loading purchases...
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="purchase-page">

      {/* HEADER */}

      <div className="purchase-header">

        <div>
          <h1>Purchase Management</h1>

          <p>
            Manage equipment purchases and stock
            receiving.
          </p>
        </div>

        <button
          className="add-purchase-btn"
          onClick={() => setShowForm(true)}
        >
          + New Purchase
        </button>

      </div>

      {/* PURCHASE FORM */}

      {showForm && (
        <div className="purchase-form-card">

          <div className="form-header">

            <h2>Create Purchase</h2>

            <button
              className="close-btn"
              onClick={resetForm}
            >
              ×
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            {/* PURCHASE INFORMATION */}

            <div className="form-section">

              <h3>Purchase Information</h3>

              <div className="form-grid">

                <div className="form-group">

                  <label>Supplier *</label>

                  <select
                    name="supplierId"
                    value={form.supplierId}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Supplier
                    </option>

                    {suppliers.map((supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </option>
                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>Invoice Number</label>

                  <input
                    type="text"
                    name="invoiceNumber"
                    value={form.invoiceNumber}
                    onChange={handleChange}
                    placeholder="INV-2026-001"
                  />

                </div>

                <div className="form-group">

                  <label>Purchase Date *</label>

                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="form-group">

                  <label>Status *</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Received">
                      Received
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

                {form.status === "Received" && (
                  <div className="form-group">

                    <label>Received Date</label>

                    <input
                      type="date"
                      name="receivedDate"
                      value={form.receivedDate}
                      onChange={handleChange}
                    />

                  </div>
                )}

              </div>

            </div>

            {/* PURCHASE ITEMS */}

            <div className="form-section">

              <div className="section-title-row">

                <h3>Purchase Items</h3>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addItem}
                >
                  + Add Item
                </button>

              </div>

              {form.items.map((item, index) => (

                <div
                  className="purchase-item"
                  key={index}
                >

                  <div className="form-group">

                    <label>Equipment *</label>

                    <select
                      value={item.equipmentId}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "equipmentId",
                          e.target.value
                        )
                      }
                      required
                    >

                      <option value="">
                        Select Equipment
                      </option>

                      {equipment.map((eq) => (
                        <option
                          key={eq.id}
                          value={eq.id}
                        >
                          {eq.equipmentCode} -{" "}
                          {eq.name}
                        </option>
                      ))}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>Quantity *</label>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>Unit Cost (NPR) *</label>

                    <input
                      type="number"
                      min="0"
                      value={item.unitCost}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "unitCost",
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                  <div className="item-total">

                    <label>Total</label>

                    <strong>
                      {formatCurrency(
                        Number(item.quantity || 0) *
                          Number(item.unitCost || 0)
                      )}
                    </strong>

                  </div>

                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() =>
                      removeItem(index)
                    }
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>

            {/* ADDITIONAL CHARGES */}

            <div className="form-section">

              <h3>Additional Charges</h3>

              <div className="form-grid">

                <div className="form-group">

                  <label>Tax (NPR)</label>

                  <input
                    type="number"
                    min="0"
                    name="tax"
                    value={form.tax}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Discount (NPR)</label>

                  <input
                    type="number"
                    min="0"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>Other Charges (NPR)</label>

                  <input
                    type="number"
                    min="0"
                    name="otherCharges"
                    value={form.otherCharges}
                    onChange={handleChange}
                  />

                </div>

              </div>

            </div>

            {/* REMARKS */}

            <div className="form-section">

              <h3>Remarks</h3>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter purchase remarks..."
                rows="3"
              />

            </div>

            {/* SUMMARY */}

            <div className="purchase-summary">

              <div>
                <span>Subtotal</span>

                <strong>
                  {formatCurrency(
                    calculateSubtotal()
                  )}
                </strong>
              </div>

              <div>
                <span>Tax</span>

                <strong>
                  {formatCurrency(form.tax)}
                </strong>
              </div>

              <div>
                <span>Discount</span>

                <strong>
                  - {formatCurrency(form.discount)}
                </strong>
              </div>

              <div>
                <span>Other Charges</span>

                <strong>
                  {formatCurrency(
                    form.otherCharges
                  )}
                </strong>
              </div>

              <div className="grand-total">

                <span>Grand Total</span>

                <strong>
                  {formatCurrency(
                    calculateGrandTotal()
                  )}
                </strong>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
              >
                Save Purchase
              </button>

            </div>

          </form>

        </div>
      )}

      {/* PURCHASE HISTORY */}

      <div className="purchase-table-card">

        <div className="table-header">

          <div>
            <h2>Purchase History</h2>

            <p>
              Previously recorded equipment purchases
            </p>
          </div>

          <span>
            {purchases.length} purchase
            {purchases.length !== 1 ? "s" : ""}
          </span>

        </div>

        {purchases.length === 0 ? (

          <div className="empty-state">

            <h3>No purchases yet</h3>

            <p>
              Create your first equipment purchase.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>Purchase No.</th>
                  <th>Supplier</th>
                  <th>Equipment</th>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {purchases.map((purchase) => (

                  <tr key={purchase.id}>

                    {/* Purchase Number */}

                    <td>
                      <strong>
                        {purchase.purchaseNumber}
                      </strong>
                    </td>

                    {/* Supplier */}

                    <td>
                      {purchase.supplierName || "-"}
                    </td>

                    {/* Equipment Name */}

                    <td>

                      {purchase.items &&
                      purchase.items.length > 0 ? (

                        <div className="purchase-equipment-list">

                          {purchase.items.map((item) => (

                            <div
                              className="purchase-equipment-item"
                              key={item.id}
                            >

                              <strong>
                                {item.equipmentName ||
                                  "Unknown Equipment"}
                              </strong>

                              <small>
                                {item.equipmentCode ||
                                  "-"}
                              </small>

                            </div>

                          ))}

                        </div>

                      ) : (

                        <span>
                          No equipment
                        </span>

                      )}

                    </td>

                    {/* Invoice */}

                    <td>
                      {purchase.invoiceNumber || "-"}
                    </td>

                    {/* Date */}

                    <td>
                      {new Date(
                        purchase.purchaseDate
                      ).toLocaleDateString()}
                    </td>

                    {/* Quantity */}

                    <td>

                      {purchase.items &&
                      purchase.items.length > 0 ? (

                        <div className="purchase-quantity-list">

                          {purchase.items.map((item) => (

                            <div key={item.id}>
                              {item.quantity}
                            </div>

                          ))}

                        </div>

                      ) : (
                        "-"
                      )}

                    </td>

                    {/* Total */}

                    <td>

                      <strong>
                        {formatCurrency(
                          purchase.grandTotal
                        )}
                      </strong>

                    </td>

                    {/* Status */}

                    <td>

                      <span
                        className={`status-badge status-${(
                          purchase.status || ""
                        ).toLowerCase()}`}
                      >
                        {purchase.status}
                      </span>

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