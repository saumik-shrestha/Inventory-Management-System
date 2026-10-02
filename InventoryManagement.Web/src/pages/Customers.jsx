
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Customers.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/Customers");

      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to load customers:", error);
      alert("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openAddForm = () => {
    setEditingCustomer(null);

    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);

    setForm({
      name: "",
      phone: "",
      email: "",
      address: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Customer name is required.");
      return;
    }

    try {
      if (editingCustomer) {
        await api.put(
          `/Customers/${editingCustomer.id}`,
          {
            id: editingCustomer.id,
            name: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
          }
        );

        alert("Customer updated successfully.");
      } else {
        await api.post("/Customers", {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
        });

        alert("Customer added successfully.");
      }

      closeForm();
      await loadCustomers();
    } catch (error) {
      console.error("Customer save failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to save customer."
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/Customers/${id}`);

      alert("Customer deleted successfully.");

      await loadCustomers();
    } catch (error) {
      console.error("Customer delete failed:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete customer."
      );
    }
  };

  if (loading) {
    return (
      <div className="customer-page">
        <div className="customer-loading">
          Loading customers...
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">

      {/* HEADER */}

      <div className="customer-header">

        <div>
          <h1>Customers</h1>

          <p>
            Manage customer information for equipment sales.
          </p>
        </div>

        <button
          className="add-customer-btn"
          onClick={openAddForm}
        >
          + Add Customer
        </button>

      </div>


      {/* FORM */}

      {showForm && (
        <div className="customer-form-card">

          <div className="customer-form-header">

            <h2>
              {editingCustomer
                ? "Edit Customer"
                : "Add Customer"}
            </h2>

            <button
              className="customer-close-btn"
              onClick={closeForm}
              type="button"
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="customer-form-grid">

              <div className="customer-form-group">

                <label>
                  Customer Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />

              </div>


              <div className="customer-form-group">

                <label>
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />

              </div>


              <div className="customer-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />

              </div>


              <div className="customer-form-group">

                <label>
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />

              </div>

            </div>


            <div className="customer-form-actions">

              <button
                type="button"
                className="customer-cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="customer-save-btn"
              >
                {editingCustomer
                  ? "Update Customer"
                  : "Add Customer"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* CUSTOMER TABLE */}

      <div className="customer-table-card">

        <div className="customer-table-header">

          <h2>
            Customer List
          </h2>

          <span>
            {customers.length} customer
            {customers.length !== 1 ? "s" : ""}
          </span>

        </div>


        {customers.length === 0 ? (

          <div className="customer-empty">

            <div>👤</div>

            <h3>
              No customers yet
            </h3>

            <p>
              Add your first customer.
            </p>

          </div>

        ) : (

          <div className="customer-table-wrapper">

            <table className="customer-table">

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {customers.map((customer) => (

                  <tr key={customer.id}>

                    <td>
                      <strong>
                        {customer.name}
                      </strong>
                    </td>

                    <td>
                      {customer.phone || "-"}
                    </td>

                    <td>
                      {customer.email || "-"}
                    </td>

                    <td>
                      {customer.address || "-"}
                    </td>

                    <td>

                      <div className="customer-actions">

                        <button
                          className="edit-customer-btn"
                          onClick={() =>
                            openEditForm(customer)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-customer-btn"
                          onClick={() =>
                            handleDelete(customer.id)
                          }
                        >
                          Delete
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

    </div>
  );
}
