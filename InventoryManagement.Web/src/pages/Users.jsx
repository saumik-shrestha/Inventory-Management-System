import { useEffect, useState } from "react";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    passwordHash: "",
    role: "staff",
  });

  // ==============================
  // LOAD USERS
  // ==============================

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/Users");

      setUsers(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ==============================
  // FORM CHANGE
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // OPEN ADD FORM
  // ==============================

  const openAddForm = () => {
    setEditingId(null);

    setForm({
      fullName: "",
      username: "",
      email: "",
      passwordHash: "",
      role: "staff",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // ==============================
  // OPEN EDIT FORM
  // ==============================

  const openEditForm = async (id) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.get(`/Users/${id}`);

      const user = response.data;

      setEditingId(id);

      setForm({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        passwordHash: "",
        role: user.role || "staff",
      });

      setShowForm(true);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load user information."
      );
    }
  };

  // ==============================
  // CLOSE FORM / BACK TO USERS
  // ==============================

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);

    setForm({
      fullName: "",
      username: "",
      email: "",
      passwordHash: "",
      role: "staff",
    });

    setError("");
  };

  // ==============================
  // ADD / UPDATE USER
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!editingId && !form.passwordHash.trim()) {
      setError("Password is required.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        fullName: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role,
      };

      // Send password when creating
      // or when changing password during edit
      if (form.passwordHash.trim()) {
        data.passwordHash = form.passwordHash;
      }

      if (editingId) {
        await api.put(`/Users/${editingId}`, data);

        setSuccess("User updated successfully.");
      } else {
        await api.post("/Users", {
          ...data,
          passwordHash: form.passwordHash,
        });

        setSuccess("User created successfully.");
      }

      closeForm();

      await loadUsers();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // DELETE USER
  // ==============================

  const handleDelete = async (id) => {
    const user = users.find((u) => u.id === id);

    if (!user) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${user.fullName}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/Users/${id}`);

      setSuccess("User deleted successfully.");

      await loadUsers();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to delete user."
      );
    }
  };

  return (
    <div className="users-page">

      {/* ==============================
          HEADER
      ============================== */}

      <div className="users-header">

        <div>
          <h1>Users</h1>

          <p>
            Manage system users, accounts and roles.
          </p>
        </div>

        {!showForm && (
          <button
            className="users-add-btn"
            onClick={openAddForm}
          >
            + Add User
          </button>
        )}

      </div>

      {/* ==============================
          MESSAGES
      ============================== */}

      {error && (
        <div className="users-message users-error">
          {error}
        </div>
      )}

      {success && (
        <div className="users-message users-success">
          {success}
        </div>
      )}

      {/* ==============================
          ADD / EDIT FORM
      ============================== */}

      {showForm ? (

        <div className="users-form-card">

          {/* FORM HEADER */}

          <div className="users-form-header">

            <button
              type="button"
              className="users-back-btn"
              onClick={closeForm}
            >
              ← Back to Users
            </button>

            <h2>
              {editingId
                ? "Edit User"
                : "Add New User"}
            </h2>

            <p>
              {editingId
                ? "Update user information."
                : "Create a new system user."}
            </p>

          </div>

          {/* FORM */}

          <form
            className="users-form"
            onSubmit={handleSubmit}
          >

            <div className="users-form-grid">

              {/* FULL NAME */}

              <div className="users-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                />

              </div>

              {/* USERNAME */}

              <div className="users-field">

                <label>
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                />

              </div>

              {/* EMAIL */}

              <div className="users-field">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />

              </div>

              {/* ROLE */}

              <div className="users-field">

                <label>
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="staff">
                    Staff
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>

              </div>

              {/* PASSWORD */}

              <div className="users-field users-password-field">

                <label>
                  {editingId
                    ? "New Password"
                    : "Password"}
                </label>

                <input
                  type="password"
                  name="passwordHash"
                  value={form.passwordHash}
                  onChange={handleChange}
                  placeholder={
                    editingId
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />

                {editingId && (
                  <small>
                    Leave blank if you don't want
                    to change the password.
                  </small>
                )}

              </div>

            </div>

            {/* FORM BUTTONS */}

            <div className="users-form-actions">

              <button
                type="button"
                className="users-cancel-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Back
              </button>

              <button
                type="submit"
                className="users-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update User"
                  : "Create User"}
              </button>

            </div>

          </form>

        </div>

      ) : (

        /* ==============================
           USER TABLE
        ============================== */

        <div className="users-card">

          <div className="users-card-header">

            <div>
              <h2>
                User List
              </h2>

              <p>
                {users.length} user
                {users.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            <button
              className="users-refresh-btn"
              onClick={loadUsers}
            >
              Refresh
            </button>

          </div>

          {loading ? (

            <div className="users-empty">
              Loading users...
            </div>

          ) : users.length === 0 ? (

            <div className="users-empty">
              No users found.
            </div>

          ) : (

            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>

                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>

                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr key={user.id}>

                      <td>
                        {user.id}
                      </td>

                      <td className="user-name">
                        {user.fullName}
                      </td>

                      <td>
                        {user.username}
                      </td>

                      <td>
                        {user.email}
                      </td>

                      <td>

                        <span
                          className={
                            user.role?.toLowerCase() ===
                            "admin"
                              ? "user-role-admin"
                              : "user-role-staff"
                          }
                        >
                          {user.role}
                        </span>

                      </td>

                      <td>
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>

                        <div className="users-actions">

                          <button
                            className="users-edit-btn"
                            onClick={() =>
                              openEditForm(user.id)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="users-delete-btn"
                            onClick={() =>
                              handleDelete(user.id)
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

      )}

    </div>
  );
}

export default Users;