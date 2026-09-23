import { useEffect, useState } from "react";
import api from "../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Get categories
  const loadCategories = async () => {
    try {
      const response = await api.get("/Categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
      setMessage("Failed to load categories.");
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open Add form
  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
    });

    setMessage("");
    setShowForm(true);
  };

  // Open Edit form
  const openEditForm = (category) => {
    setEditingId(category.id);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setMessage("");
    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);

    setFormData({
      name: "",
      description: "",
    });
  };

  // Add / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Category name is required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      if (editingId) {
        await api.put(`/Categories/${editingId}`, {
          id: editingId,
          name: formData.name.trim(),
          description: formData.description.trim(),
        });

        setMessage("Category updated successfully.");
      } else {
        await api.post("/Categories", {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });

        setMessage("Category added successfully.");
      }

      closeForm();
      await loadCategories();
    } catch (error) {
      console.error("Category error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Operation failed.";

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/Categories/${id}`);

      setMessage("Category deleted successfully.");

      await loadCategories();
    } catch (error) {
      console.error("Delete error:", error);
      console.error("Status:", error.response?.status);
      console.error("Response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Failed to delete category.";

      setMessage(errorMessage);
    }
  };

  return (
    <div className="categories-page">

      {/* Header */}
      <div className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>Manage equipment categories.</p>
        </div>

        <button
          className="add-category-btn"
          onClick={openAddForm}
        >
          + Add Category
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="category-message">
          {message}
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <div className="category-form-card">

          <div className="form-header">
            <h2>
              {editingId ? "Edit Category" : "Add Category"}
            </h2>

            <button
              className="close-btn"
              onClick={closeForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Category Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                placeholder="Enter category description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Category"
                  : "Save Category"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* Category List */}
      <div className="categories-card">

        <div className="card-title">
          <h2>Category List</h2>

          <span>
            {categories.length} categories
          </span>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            No categories found.
          </div>
        ) : (
          <div className="category-table-wrapper">

            <table className="category-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {categories.map((category) => (
                  <tr key={category.id}>

                    <td>
                      {category.id}
                    </td>

                    <td className="category-name">
                      {category.name}
                    </td>

                    <td>
                      {category.description || "-"}
                    </td>

                    <td>
                      {category.createdAt
                        ? new Date(
                            category.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <div className="category-actions">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            openEditForm(category)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDelete(category.id)
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

export default Categories;