import { useEffect, useState } from "react";
import api from "../services/api";

function Equipment() {
  // =========================================================
  // STATE
  // =========================================================

  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [lowStock, setLowStock] = useState(false);

  // Add / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  // =========================================================
  // EMPTY FORM
  // =========================================================

  const emptyEquipment = {
    equipmentCode: "",
    name: "",
    categoryId: "",
    supplierId: "",
    brand: "",
    model: "",
    serialNumber: "",
    quantity: 0,
    unitPrice: 0,
    minimumStock: 0,
    purchaseDate: "",
    status: "Available",
    description: "",
  };

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState(emptyEquipment);

  // =========================================================
  // LOAD EQUIPMENT
  // =========================================================

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (categoryId) {
        params.categoryId = categoryId;
      }

      if (status) {
        params.status = status;
      }

      if (lowStock) {
        params.lowStock = true;
      }

      const response = await api.get("/Equipment", {
        params,
      });

      setEquipment(response.data);
    } catch (err) {
      console.error("Unable to load equipment:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please login again.");
      } else {
        setError("Unable to load equipment.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = async () => {
    try {
      const response = await api.get("/Categories");

      setCategories(response.data);
    } catch (err) {
      console.error("Unable to load categories:", err);
    }
  };

  // =========================================================
  // LOAD SUPPLIERS
  // =========================================================

  const loadSuppliers = async () => {
    try {
      const response = await api.get("/Suppliers");

      setSuppliers(response.data);
    } catch (err) {
      console.error("Unable to load suppliers:", err);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    loadEquipment();
  }, []);

  // =========================================================
  // SEARCH / FILTER
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEquipment();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, categoryId, status, lowStock]);

  // =========================================================
  // RESET FILTERS
  // =========================================================

  const resetFilters = () => {
    setSearch("");
    setCategoryId("");
    setStatus("");
    setLowStock(false);
  };

  // =========================================================
  // STOCK STATUS
  // =========================================================

  const getStockStatus = (item) => {
    if (item.quantity <= 0) {
      return {
        text: "Out of Stock",
        className: "stock-out",
      };
    }

    if (item.quantity <= item.minimumStock) {
      return {
        text: "Low Stock",
        className: "stock-low",
      };
    }

    return {
      text: "In Stock",
      className: "stock-good",
    };
  };

  // =========================================================
  // EQUIPMENT STATUS
  // =========================================================

  const getStatusClass = (value) => {
    switch (value?.toLowerCase()) {
      case "available":
        return "status-available";

      case "assigned":
        return "status-assigned";

      case "maintenance":
        return "status-maintenance";

      case "inactive":
        return "status-inactive";

      default:
        return "status-default";
    }
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAdd = () => {
    setEditingEquipment(null);
    setFormData({ ...emptyEquipment });
    setError("");
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEdit = (item) => {
    setEditingEquipment(item);

    setFormData({
      equipmentCode: item.equipmentCode || "",
      name: item.name || "",
      categoryId: item.categoryId || "",
      supplierId: item.supplierId || "",
      brand: item.brand || "",
      model: item.model || "",
      serialNumber: item.serialNumber || "",
      quantity: item.quantity ?? 0,
      unitPrice: item.unitPrice ?? 0,
      minimumStock: item.minimumStock ?? 0,
      purchaseDate: item.purchaseDate
        ? item.purchaseDate.substring(0, 10)
        : "",
      status: item.status || "Available",
      description: item.description || "",
    });

    setError("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setShowModal(false);
    setEditingEquipment(null);
    setFormData({ ...emptyEquipment });
  };

  // =========================================================
  // FORM INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // ADD / UPDATE EQUIPMENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      // Basic validation
      if (!formData.equipmentCode.trim()) {
        setError("Equipment code is required.");
        return;
      }

      if (!formData.name.trim()) {
        setError("Equipment name is required.");
        return;
      }

      if (!formData.categoryId) {
        setError("Please select a category.");
        return;
      }

      const data = {
        equipmentCode: formData.equipmentCode.trim(),

        name: formData.name.trim(),

        categoryId: Number(formData.categoryId),

        supplierId: formData.supplierId
          ? Number(formData.supplierId)
          : null,

        brand: formData.brand.trim() || null,

        model: formData.model.trim() || null,

        serialNumber: formData.serialNumber.trim() || null,

        quantity: Number(formData.quantity),

        unitPrice: Number(formData.unitPrice),

        minimumStock: Number(formData.minimumStock),

        purchaseDate: formData.purchaseDate
          ? formData.purchaseDate
          : null,

        status: formData.status,

        description:
          formData.description.trim() || null,
      };

      console.log("Equipment data:", data);

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingEquipment) {
        await api.put(
          `/Equipment/${editingEquipment.id}`,
          data
        );

        alert("Equipment updated successfully.");
      }

      // =====================================================
      // CREATE
      // =====================================================

      else {
        await api.post("/Equipment", data);

        alert("Equipment added successfully.");
      }

      closeModal();

      await loadEquipment();
    } catch (err) {
      console.error("Unable to save equipment:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Unable to save equipment.";

      setError(message);
    }
  };

  // =========================================================
  // DELETE EQUIPMENT
  // =========================================================

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/Equipment/${item.id}`);

      alert("Equipment deleted successfully.");

      await loadEquipment();
    } catch (err) {
      console.error("Unable to delete equipment:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Unable to delete equipment.";

      setError(message);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="equipment-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="equipment-header">

        <div>
          <h1>Equipment</h1>

          <p>
            Manage your organization's equipment and inventory.
          </p>
        </div>

        <button
          className="add-equipment-btn"
          onClick={handleAdd}
        >
          ＋ Add Equipment
        </button>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="equipment-summary">

        {/* Total Equipment */}

        <div className="summary-card">

          <div className="summary-icon blue">
            📦
          </div>

          <div>
            <span>Total Equipment</span>

            <strong>
              {equipment.length}
            </strong>
          </div>

        </div>


        {/* Available */}

        <div className="summary-card">

          <div className="summary-icon green">
            ✓
          </div>

          <div>
            <span>Available</span>

            <strong>
              {
                equipment.filter(
                  (item) =>
                    item.status?.toLowerCase() ===
                    "available"
                ).length
              }
            </strong>
          </div>

        </div>


        {/* Low Stock */}

        <div className="summary-card">

          <div className="summary-icon orange">
            ⚠
          </div>

          <div>
            <span>Low Stock</span>

            <strong>
              {
                equipment.filter(
                  (item) =>
                    item.quantity <= item.minimumStock
                ).length
              }
            </strong>
          </div>

        </div>


        {/* Total Units */}

        <div className="summary-card">

          <div className="summary-icon purple">
            💻
          </div>

          <div>
            <span>Total Units</span>

            <strong>
              {equipment.reduce(
                (total, item) =>
                  total + item.quantity,
                0
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          FILTER CARD
      ===================================================== */}

      <div className="filter-card">

        <div className="filter-title">

          <div>
            <h3>Equipment List</h3>

            <p>
              View and manage all equipment
            </p>
          </div>

          <span>
            {equipment.length}{" "}
            {equipment.length === 1
              ? "record"
              : "records"}
          </span>

        </div>


        <div className="filter-row">

          {/* Search */}

          <div className="search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* Category */}

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
          >

            <option value="">
              All Categories
            </option>

            {categories.map((category) => (

              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>

            ))}

          </select>


          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >

            <option value="">
              All Status
            </option>

            <option value="Available">
              Available
            </option>

            <option value="Assigned">
              Assigned
            </option>

            <option value="Maintenance">
              Maintenance
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>


          {/* Low Stock */}

          <label className="low-stock-checkbox">

            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) =>
                setLowStock(e.target.checked)
              }
            />

            <span>
              Low Stock
            </span>

          </label>


          {/* Reset */}

          <button
            className="reset-btn"
            onClick={resetFilters}
          >
            Reset
          </button>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="equipment-error">
          ⚠ {error}
        </div>

      )}


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="table-card">

        {loading ? (

          <div className="equipment-loading">

            <p>
              Loading equipment...
            </p>

          </div>

        ) : equipment.length === 0 ? (

          <div className="empty-equipment">

            <div className="empty-icon">
              📦
            </div>

            <h3>
              No equipment found
            </h3>

            <p>
              Try changing your search or filter settings.
            </p>

          </div>

        ) : (

          <div className="equipment-table-wrapper">

            <table className="equipment-table">

              <thead>

                <tr>

                  <th>
                    Equipment
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Supplier
                  </th>

                  <th>
                    Brand / Model
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Unit Price
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {equipment.map((item) => {

                  const stock =
                    getStockStatus(item);

                  return (

                    <tr key={item.id}>

                      {/* Equipment */}

                      <td>

                        <div className="equipment-name">

                          <div className="equipment-avatar">
                            📦
                          </div>

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.equipmentCode}
                            </span>

                            {item.serialNumber && (

                              <small>
                                SN: {item.serialNumber}
                              </small>

                            )}

                          </div>

                        </div>

                      </td>


                      {/* Category */}

                      <td>

                        <span className="category-badge">

                          {item.categoryName || "-"}

                        </span>

                      </td>


                      {/* Supplier */}

                      <td>

                        <span className="supplier-badge">

                          {item.supplierName || "-"}

                        </span>

                      </td>


                      {/* Brand / Model */}

                      <td>

                        <div className="brand-model">

                          <strong>
                            {item.brand || "-"}
                          </strong>

                          <span>
                            {item.model || "-"}
                          </span>

                        </div>

                      </td>


                      {/* Quantity */}

                      <td>

                        <div className="quantity-info">

                          <strong>
                            {item.quantity}
                          </strong>

                          <span>
                            Min: {item.minimumStock}
                          </span>

                        </div>

                      </td>


                      {/* Price */}

                      <td>

                        <strong className="price">

                          {formatPrice(
                            item.unitPrice
                          )}

                        </strong>

                      </td>


                      {/* Status */}

                      <td>

                        <span
                          className={`status-badge ${getStatusClass(
                            item.status
                          )}`}
                        >

                          {item.status || "Unknown"}

                        </span>

                      </td>


                      {/* Stock */}

                      <td>

                        <span
                          className={`stock-badge ${stock.className}`}
                        >

                          {stock.text}

                        </span>

                      </td>


                      {/* Actions */}

                      <td>

                        <div className="action-buttons">

                          <button
                            className="edit-btn"
                            title="Edit equipment"
                            onClick={() =>
                              handleEdit(item)
                            }
                          >
                            ✎
                          </button>

                          <button
                            className="delete-btn"
                            title="Delete equipment"
                            onClick={() =>
                              handleDelete(item)
                            }
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="equipment-modal-overlay">

          <div className="equipment-modal">

            {/* Modal Header */}

            <div className="equipment-modal-header">

              <div>

                <h2>
                  {editingEquipment
                    ? "Edit Equipment"
                    : "Add Equipment"}
                </h2>

                <p>
                  {editingEquipment
                    ? "Update equipment information."
                    : "Add a new equipment item."}
                </p>

              </div>


              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            {/* Error */}

            {error && (

              <div className="form-error">
                {error}
              </div>

            )}


            {/* Form */}

            <form onSubmit={handleSubmit}>

              <div className="equipment-form-grid">

                {/* Equipment Code */}

                <div className="form-group">

                  <label>
                    Equipment Code *
                  </label>

                  <input
                    type="text"
                    name="equipmentCode"
                    value={formData.equipmentCode}
                    onChange={handleChange}
                    placeholder="Example: IT-002"
                    required
                  />

                </div>


                {/* Equipment Name */}

                <div className="form-group">

                  <label>
                    Equipment Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Example: HP Laptop"
                    required
                  />

                </div>


                {/* Category */}

                <div className="form-group">

                  <label>
                    Category *
                  </label>

                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select Category
                    </option>

                    {categories.map((category) => (

                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>

                    ))}

                  </select>

                </div>


                {/* Supplier */}

                <div className="form-group">

                  <label>
                    Supplier
                  </label>

                  <select
                    name="supplierId"
                    value={formData.supplierId || ""}
                    onChange={handleChange}
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


                {/* Brand */}

                <div className="form-group">

                  <label>
                    Brand
                  </label>

                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Example: Dell"
                  />

                </div>


                {/* Model */}

                <div className="form-group">

                  <label>
                    Model
                  </label>

                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Example: Latitude 5520"
                  />

                </div>


                {/* Serial Number */}

                <div className="form-group">

                  <label>
                    Serial Number
                  </label>

                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="Example: DL5520-002"
                  />

                </div>


                {/* Quantity */}

                <div className="form-group">

                  <label>
                    Quantity *
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* Minimum Stock */}

                <div className="form-group">

                  <label>
                    Minimum Stock *
                  </label>

                  <input
                    type="number"
                    name="minimumStock"
                    min="0"
                    value={formData.minimumStock}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* Unit Price */}

                <div className="form-group">

                  <label>
                    Unit Price (NPR) *
                  </label>

                  <input
                    type="number"
                    name="unitPrice"
                    min="0"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* Purchase Date */}

                <div className="form-group">

                  <label>
                    Purchase Date
                  </label>

                  <input
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                  />

                </div>


                {/* Status */}

                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >

                    <option value="Available">
                      Available
                    </option>

                    <option value="Assigned">
                      Assigned
                    </option>

                    <option value="Maintenance">
                      Maintenance
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>

                  </select>

                </div>


                {/* Description */}

                <div className="form-group full-width">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter equipment description..."
                  />

                </div>

              </div>


              {/* Form Buttons */}

              <div className="equipment-form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-equipment-btn"
                >

                  {editingEquipment
                    ? "Update Equipment"
                    : "Add Equipment"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Equipment;