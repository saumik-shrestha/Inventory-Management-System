import { useEffect, useState } from "react";
import api from "../services/api";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================
  // LOAD SUPPLIERS
  // =========================

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Suppliers");

      setSuppliers(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredSuppliers = suppliers.filter((supplier) => {
    const text = search.toLowerCase();

    return (
      supplier.name?.toLowerCase().includes(text) ||
      supplier.contactPerson?.toLowerCase().includes(text) ||
      supplier.phone?.toLowerCase().includes(text) ||
      supplier.email?.toLowerCase().includes(text) ||
      supplier.address?.toLowerCase().includes(text)
    );
  });

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // ADD SUPPLIER
  // =========================

  const openAddModal = () => {
    setEditingSupplier(null);

    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================
  // EDIT SUPPLIER
  // =========================

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);

    setFormData({
      name: supplier.name || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingSupplier(null);
    setFormError("");
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Supplier name is required.");
      return;
    }

    if (!formData.contactPerson.trim()) {
      setFormError("Contact person is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }

    try {
      setSaving(true);

      const supplierData = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      };

      if (editingSupplier) {
        await api.put(
          `/Suppliers/${editingSupplier.id}`,
          supplierData
        );
      } else {
        await api.post(
          "/Suppliers",
          supplierData
        );
      }

      setShowModal(false);
      setEditingSupplier(null);

      setFormData({
        name: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
      });

      await loadSuppliers();
    } catch (err) {
      console.error(err);

      setFormError(
        err.response?.data?.message ||
          "Unable to save supplier."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (supplier) => {
    alert(
      `Delete supplier "${supplier.name}" will be added next.`
    );
  };

  return (
    <div className="suppliers-page">

      {/* HEADER */}

      <div className="suppliers-header">

        <div>
          <h1>Suppliers</h1>

          <p>
            Manage your equipment and inventory suppliers.
          </p>
        </div>

        <button
          className="add-supplier-btn"
          onClick={openAddModal}
        >
          + Add Supplier
        </button>

      </div>


      {/* SUMMARY */}

      <div className="supplier-summary">

        <div className="supplier-summary-card">

          <div className="supplier-summary-icon">
            🏢
          </div>

          <div>
            <span>Total Suppliers</span>

            <strong>
              {suppliers.length}
            </strong>
          </div>

        </div>


        <div className="supplier-summary-card">

          <div className="supplier-summary-icon">
            📦
          </div>

          <div>
            <span>Suppliers</span>

            <strong>
              {suppliers.length}
            </strong>
          </div>

        </div>

      </div>


      {/* SUPPLIER LIST */}

      <div className="supplier-list-card">

        <div className="supplier-list-header">

          <div>
            <h2>Supplier List</h2>

            <p>
              View and manage all suppliers
            </p>
          </div>

          <span className="supplier-count">
            {filteredSuppliers.length}{" "}
            {filteredSuppliers.length === 1
              ? "supplier"
              : "suppliers"}
          </span>

        </div>


        {/* SEARCH */}

        <div className="supplier-search-row">

          <div className="supplier-search">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="supplier-error">
            ⚠ {error}
          </div>
        )}


        {/* LOADING */}

        {loading ? (

          <div className="supplier-loading">

            <div className="supplier-spinner"></div>

            <p>
              Loading suppliers...
            </p>

          </div>

        ) : filteredSuppliers.length === 0 ? (

          <div className="supplier-empty">

            <div className="supplier-empty-icon">
              🏢
            </div>

            <h3>
              No suppliers found
            </h3>

            <p>
              Try changing your search or add a new supplier.
            </p>

          </div>

        ) : (

          <div className="supplier-table-wrapper">

            <table className="supplier-table">

              <thead>

                <tr>
                  <th>Supplier</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredSuppliers.map((supplier) => (

                  <tr key={supplier.id}>

                    <td>

                      <div className="supplier-name">

                        <div className="supplier-avatar">
                          🏢
                        </div>

                        <div>

                          <strong>
                            {supplier.name}
                          </strong>

                          <span>
                            Supplier #{supplier.id}
                          </span>

                        </div>

                      </div>

                    </td>


                    <td>
                      {supplier.contactPerson || "-"}
                    </td>


                    <td>
                      {supplier.phone || "-"}
                    </td>


                    <td>
                      {supplier.email || "-"}
                    </td>


                    <td>
                      {supplier.address || "-"}
                    </td>


                    <td>

                      <div className="supplier-actions">

                        <button
                          className="supplier-edit-btn"
                          onClick={() =>
                            handleEdit(supplier)
                          }
                          title="Edit supplier"
                        >
                          ✎
                        </button>

                        <button
                          className="supplier-delete-btn"
                          onClick={() =>
                            handleDelete(supplier)
                          }
                          title="Delete supplier"
                        >
                          🗑
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div
          className="supplier-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="supplier-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="supplier-modal-header">

              <div>

                <h2>
                  {editingSupplier
                    ? "Edit Supplier"
                    : "Add Supplier"}
                </h2>

                <p>
                  {editingSupplier
                    ? "Update supplier information."
                    : "Add a new equipment supplier."}
                </p>

              </div>

              <button
                className="supplier-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {formError && (

                <div className="supplier-form-error">
                  ⚠ {formError}
                </div>

              )}


              {/* NAME */}

              <div className="supplier-form-group">

                <label>
                  Supplier Name *
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter supplier name"
                  value={formData.name}
                  onChange={handleChange}
                />

              </div>


              {/* CONTACT */}

              <div className="supplier-form-group">

                <label>
                  Contact Person *
                </label>

                <input
                  type="text"
                  name="contactPerson"
                  placeholder="Enter contact person"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />

              </div>


              {/* PHONE */}

              <div className="supplier-form-group">

                <label>
                  Phone *
                </label>

                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />

              </div>


              {/* EMAIL */}

              <div className="supplier-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                />

              </div>


              {/* ADDRESS */}

              <div className="supplier-form-group">

                <label>
                  Address
                </label>

                <textarea
                  name="address"
                  placeholder="Enter supplier address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />

              </div>


              {/* BUTTONS */}

              <div className="supplier-form-actions">

                <button
                  type="button"
                  className="supplier-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="supplier-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingSupplier
                    ? "Update Supplier"
                    : "Save Supplier"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Suppliers;