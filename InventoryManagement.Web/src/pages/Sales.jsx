import { useEffect, useState } from "react";
import api from "../services/api";
import "./Sales.css";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // New customer popup
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [form, setForm] = useState({
    customerId: "",
    saleDate: new Date().toISOString().split("T")[0],
    status: "Completed",
    tax: 0,
    discount: 0,
    remarks: "",
    items: [
      {
        equipmentId: "",
        quantity: 1,
        unitPrice: 0,
      },
    ],
  });

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // LOAD DATA
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [salesRes, customersRes, equipmentRes] =
        await Promise.all([
          api.get("/Sales"),
          api.get("/Customers"),
          api.get("/Equipment"),
        ]);

      setSales(salesRes.data);
      setCustomers(customersRes.data);
      setEquipment(equipmentRes.data);
    } catch (error) {
      console.error("Failed to load sales data:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load sales data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SALE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Customer dropdown
    if (name === "customerId" && value === "ADD_NEW") {
      setShowCustomerForm(true);

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CUSTOMER FORM
  // =========================================================

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;

    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createCustomer = async (e) => {
    e.preventDefault();

    if (!newCustomer.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    try {
      setSavingCustomer(true);

      const response = await api.post(
        "/Customers",
        {
          name: newCustomer.name.trim(),
          phone: newCustomer.phone.trim() || null,
          email: newCustomer.email.trim() || null,
          address: newCustomer.address.trim() || null,
        }
      );

      const createdCustomer = response.data;

      // Add new customer to dropdown
      setCustomers((prev) => [
        createdCustomer,
        ...prev,
      ]);

      // Automatically select new customer
      setForm((prev) => ({
        ...prev,
        customerId: String(createdCustomer.id),
      }));

      // Reset customer form
      setNewCustomer({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      setShowCustomerForm(false);

      alert("Customer added successfully.");
    } catch (error) {
      console.error(
        "Failed to create customer:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create customer."
      );
    } finally {
      setSavingCustomer(false);
    }
  };

  const closeCustomerForm = () => {
    if (savingCustomer) {
      return;
    }

    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setShowCustomerForm(false);
  };

  // =========================================================
  // SALE ITEM CHANGE
  // =========================================================

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const updatedItems = [...prev.items];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      // Automatically use equipment selling price
      if (
        field === "equipmentId" &&
        value
      ) {
        const selectedEquipment =
          equipment.find(
            (eq) => eq.id === Number(value)
          );

        if (selectedEquipment) {
          updatedItems[index].unitPrice =
            selectedEquipment.unitPrice || 0;
        }
      }

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  // =========================================================
  // ADD ITEM
  // =========================================================

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          equipmentId: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    }));
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = (index) => {
    if (form.items.length === 1) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      items: prev.items.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // =========================================================
  // GET EQUIPMENT
  // =========================================================

  const getSelectedEquipment = (
    equipmentId
  ) => {
    return equipment.find(
      (eq) => eq.id === Number(equipmentId)
    );
  };

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const calculateSubtotal = () => {
    return form.items.reduce(
      (total, item) => {
        return (
          total +
          Number(item.quantity || 0) *
            Number(item.unitPrice || 0)
        );
      },
      0
    );
  };

  const calculateGrandTotal = () => {
    return (
      calculateSubtotal() +
      Number(form.tax || 0) -
      Number(form.discount || 0)
    );
  };

  // =========================================================
  // CREATE SALE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.status === "Completed" &&
      !form.customerId
    ) {
      alert("Please select a customer.");
      return;
    }

    if (form.items.length === 0) {
      alert("Please add at least one item.");
      return;
    }

    for (const item of form.items) {
      if (!item.equipmentId) {
        alert(
          "Please select equipment for every item."
        );
        return;
      }

      if (Number(item.quantity) <= 0) {
        alert(
          "Quantity must be greater than 0."
        );
        return;
      }

      if (Number(item.unitPrice) < 0) {
        alert(
          "Unit price cannot be negative."
        );
        return;
      }

      const selectedEquipment =
        getSelectedEquipment(
          item.equipmentId
        );

      if (!selectedEquipment) {
        alert(
          "Selected equipment was not found."
        );
        return;
      }

      if (
        Number(item.quantity) >
        Number(selectedEquipment.quantity)
      ) {
        alert(
          `Not enough stock for ${selectedEquipment.name}. ` +
            `Available: ${selectedEquipment.quantity}.`
        );

        return;
      }
    }

    if (
      Number(form.discount) >
      calculateSubtotal()
    ) {
      alert(
        "Discount cannot be greater than subtotal."
      );

      return;
    }

    if (calculateGrandTotal() < 0) {
      alert(
        "Grand total cannot be negative."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        customerId: form.customerId
          ? Number(form.customerId)
          : null,

        saleDate: form.saleDate,

        status: form.status,

        tax: Number(form.tax || 0),

        discount: Number(
          form.discount || 0
        ),

        remarks: form.remarks,

        items: form.items.map((item) => ({
          equipmentId: Number(
            item.equipmentId
          ),

          quantity: Number(
            item.quantity
          ),

          unitPrice: Number(
            item.unitPrice
          ),
        })),
      };

      await api.post(
        "/Sales",
        payload
      );

      alert(
        "Sale created successfully!"
      );

      resetForm();

      await loadData();
    } catch (error) {
      console.error(
        "Sale creation failed:",
        error
      );

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create sale."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RESET SALE FORM
  // =========================================================

  const resetForm = () => {
    setForm({
      customerId: "",
      saleDate:
        new Date()
          .toISOString()
          .split("T")[0],
      status: "Completed",
      tax: 0,
      discount: 0,
      remarks: "",
      items: [
        {
          equipmentId: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    });

    setShowForm(false);
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-NP",
      {
        style: "currency",
        currency: "NPR",
        maximumFractionDigits: 0,
      }
    ).format(Number(value || 0));
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString("en-GB");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="sales-page">
        <div className="loading">
          Loading sales...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="sales-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="sales-header">

        <div>
          <h1>
            Sales Management
          </h1>

          <p>
            Manage equipment sales and
            stock transactions.
          </p>
        </div>

        <button
          className="add-sale-btn"
          onClick={() =>
            setShowForm(true)
          }
        >
          + New Sale
        </button>

      </div>


      {/* =====================================================
          SALE FORM
      ====================================================== */}

      {showForm && (
        <div className="sale-form-card">

          <div className="form-header">

            <div>
              <h2>
                Create Sale
              </h2>

              <p>
                Record equipment sold
                to a customer.
              </p>
            </div>

            <button
              type="button"
              className="close-btn"
              onClick={resetForm}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            {/* =================================================
                SALE INFORMATION
            ================================================== */}

            <div className="form-section">

              <h3>
                Sale Information
              </h3>

              <div className="form-grid">

                {/* CUSTOMER */}

                <div className="form-group">

                  <label>
                    Customer
                    <span className="required">
                      *
                    </span>
                  </label>

                  <select
                    name="customerId"
                    value={form.customerId}
                    onChange={handleChange}
                    required={
                      form.status ===
                      "Completed"
                    }
                  >

                    <option value="">
                      Select Customer
                    </option>

                    {customers.map(
                      (customer) => (
                        <option
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                        >
                          {customer.name}

                          {customer.phone
                            ? ` - ${customer.phone}`
                            : ""}
                        </option>
                      )
                    )}

                    {/* ADD CUSTOMER */}

                    <option
                      value="ADD_NEW"
                    >
                      + Add New Customer
                    </option>

                  </select>

                  {customers.length ===
                    0 && (
                    <small className="field-warning">
                      No customers found.
                      Use "Add New Customer"
                      above.
                    </small>
                  )}

                </div>


                {/* SALE DATE */}

                <div className="form-group">

                  <label>
                    Sale Date
                    <span className="required">
                      *
                    </span>
                  </label>

                  <input
                    type="date"
                    name="saleDate"
                    value={
                      form.saleDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>


                {/* STATUS */}

                <div className="form-group">

                  <label>
                    Status
                    <span className="required">
                      *
                    </span>
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* =================================================
                SALE ITEMS
            ================================================== */}

            <div className="form-section">

              <div className="section-title-row">

                <div>
                  <h3>
                    Sale Items
                  </h3>

                  <p>
                    Select equipment and
                    enter the quantity
                    being sold.
                  </p>
                </div>

                <button
                  type="button"
                  className="add-item-btn"
                  onClick={addItem}
                >
                  + Add Item
                </button>

              </div>


              {form.items.map(
                (item, index) => {

                  const selectedEquipment =
                    getSelectedEquipment(
                      item.equipmentId
                    );

                  return (
                    <div
                      className="sale-item"
                      key={index}
                    >

                      {/* EQUIPMENT */}

                      <div className="form-group equipment-field">

                        <label>
                          Equipment
                          <span className="required">
                            *
                          </span>
                        </label>

                        <select
                          value={
                            item.equipmentId
                          }
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

                          {equipment
                            .filter(
                              (eq) =>
                                Number(
                                  eq.quantity
                                ) > 0
                            )
                            .map((eq) => (
                              <option
                                key={eq.id}
                                value={eq.id}
                              >
                                {eq.equipmentCode}
                                {" - "}
                                {eq.name}
                              </option>
                            ))}

                        </select>

                        {selectedEquipment && (
                          <small className="stock-info">
                            Available stock:{" "}
                            <strong>
                              {
                                selectedEquipment.quantity
                              }
                            </strong>
                          </small>
                        )}

                      </div>


                      {/* QUANTITY */}

                      <div className="form-group">

                        <label>
                          Quantity
                          <span className="required">
                            *
                          </span>
                        </label>

                        <input
                          type="number"
                          min="1"
                          max={
                            selectedEquipment?.quantity ||
                            undefined
                          }
                          value={
                            item.quantity
                          }
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


                      {/* UNIT PRICE */}

                      <div className="form-group">

                        <label>
                          Unit Price (NPR)
                          <span className="required">
                            *
                          </span>
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            item.unitPrice
                          }
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          required
                        />

                      </div>


                      {/* TOTAL */}

                      <div className="item-total">

                        <label>
                          Total
                        </label>

                        <strong>
                          {formatCurrency(
                            Number(
                              item.quantity ||
                                0
                            ) *
                              Number(
                                item.unitPrice ||
                                  0
                              )
                          )}
                        </strong>

                      </div>


                      {/* REMOVE */}

                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                        disabled={
                          form.items
                            .length === 1
                        }
                      >
                        Remove
                      </button>

                    </div>
                  );
                }
              )}

            </div>


            {/* =================================================
                ADDITIONAL CHARGES
            ================================================== */}

            <div className="form-section">

              <h3>
                Additional Charges
              </h3>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Tax (NPR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="tax"
                    value={
                      form.tax
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Discount (NPR)
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="discount"
                    value={
                      form.discount
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                REMARKS
            ================================================== */}

            <div className="form-section">

              <h3>
                Remarks
              </h3>

              <textarea
                name="remarks"
                value={
                  form.remarks
                }
                onChange={
                  handleChange
                }
                placeholder="Enter sale remarks..."
                rows="3"
              />

            </div>


            {/* =================================================
                SUMMARY
            ================================================== */}

            <div className="sale-summary">

              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    calculateSubtotal()
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Tax
                </span>

                <strong>
                  {formatCurrency(
                    form.tax
                  )}
                </strong>
              </div>


              <div>
                <span>
                  Discount
                </span>

                <strong className="discount-value">
                  -{" "}
                  {formatCurrency(
                    form.discount
                  )}
                </strong>
              </div>


              <div className="grand-total">

                <span>
                  Grand Total
                </span>

                <strong>
                  {formatCurrency(
                    calculateGrandTotal()
                  )}
                </strong>

              </div>

            </div>


            {/* =================================================
                FORM ACTIONS
            ================================================== */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Sale"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =====================================================
          SALES HISTORY
      ====================================================== */}

      <div className="sales-table-card">

        <div className="table-header">

          <div>
            <h2>
              Sales History
            </h2>

            <p>
              Previous equipment
              sales
            </p>
          </div>

          <span>
            {sales.length} sale
            {sales.length !== 1
              ? "s"
              : ""}
          </span>

        </div>


        {sales.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🧾
            </div>

            <h3>
              No sales yet
            </h3>

            <p>
              Create your first
              equipment sale.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>
                    Sale No.
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Equipment
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Items
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>
                </tr>

              </thead>


              <tbody>

                {sales.map(
                  (sale) => (

                    <tr
                      key={sale.id}
                    >

                      {/* SALE NUMBER */}

                      <td>
                        <strong>
                          {
                            sale.saleNumber
                          }
                        </strong>
                      </td>


                      {/* CUSTOMER */}

                      <td>

                        {sale.customerName ? (

                          <div className="customer-cell">

                            <strong>
                              {
                                sale.customerName
                              }
                            </strong>

                            {sale.customerPhone && (
                              <span>
                                {
                                  sale.customerPhone
                                }
                              </span>
                            )}

                          </div>

                        ) : (

                          <span className="no-customer">
                            Walk-in Customer
                          </span>

                        )}

                      </td>


                      {/* EQUIPMENT */}

                      <td>

                        <div className="equipment-list">

                          {sale.items?.map(
                            (item) => (

                              <div
                                className="equipment-row"
                                key={
                                  item.id
                                }
                              >

                                <strong>
                                  {
                                    item.equipmentName ||
                                    "Unknown"
                                  }
                                </strong>

                                <span>
                                  {
                                    item.equipmentCode ||
                                    "-"
                                  }

                                  {" × "}

                                  {
                                    item.quantity
                                  }
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      </td>


                      {/* DATE */}

                      <td>
                        {formatDate(
                          sale.saleDate
                        )}
                      </td>


                      {/* ITEM COUNT */}

                      <td>
                        {
                          sale.items
                            ?.length || 0
                        }
                      </td>


                      {/* TOTAL */}

                      <td>

                        <strong>
                          {formatCurrency(
                            sale.grandTotal
                          )}
                        </strong>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`status-badge status-${(
                            sale.status ||
                            ""
                          ).toLowerCase()}`}
                        >
                          {
                            sale.status
                          }
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          ADD CUSTOMER MODAL
      ====================================================== */}

      {showCustomerForm && (

        <div className="customer-modal-overlay">

          <div className="customer-modal">

            <div className="customer-modal-header">

              <div>
                <h2>
                  Add New Customer
                </h2>

                <p>
                  Enter basic customer
                  information.
                </p>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={
                  closeCustomerForm
                }
                disabled={
                  savingCustomer
                }
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                createCustomer
              }
            >

              {/* NAME */}

              <div className="form-group">

                <label>
                  Customer Name
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    newCustomer.name
                  }
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Enter customer name"
                  required
                />

              </div>


              {/* PHONE */}

              <div className="form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={
                    newCustomer.phone
                  }
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Enter phone number"
                />

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    newCustomer.email
                  }
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Enter email address"
                />

              </div>


              {/* ADDRESS */}

              <div className="form-group">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  value={
                    newCustomer.address
                  }
                  onChange={
                    handleCustomerChange
                  }
                  placeholder="Enter address"
                  rows="3"
                />

              </div>


              {/* CUSTOMER ACTIONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeCustomerForm
                  }
                  disabled={
                    savingCustomer
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    savingCustomer
                  }
                >
                  {savingCustomer
                    ? "Saving..."
                    : "Add Customer"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}