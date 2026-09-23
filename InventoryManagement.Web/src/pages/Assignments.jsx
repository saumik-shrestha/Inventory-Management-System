
import { useEffect, useState } from "react";
import api from "../services/api";

function Assignment() {
  const [assignments, setAssignments] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    equipmentId: "",
    assignedTo: "",
    department: "",
    assignedDate: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  // =========================================================
  // LOAD ASSIGNMENTS
  // =========================================================

  const loadAssignments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/EquipmentAssignments");

      setAssignments(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load assignment records."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD EQUIPMENT
  // =========================================================

  const loadEquipment = async () => {
    try {
      const response = await api.get("/Equipment");

      setEquipment(response.data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load equipment. Please check your login session."
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAssignments();
    loadEquipment();
  }, []);

  // =========================================================
  // FORM INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN FORM
  // =========================================================

  const openForm = () => {
    setError("");
    setSuccess("");

    setForm({
      equipmentId: "",
      assignedTo: "",
      department: "",
      assignedDate: new Date().toISOString().split("T")[0],
      remarks: "",
    });

    setShowForm(true);
  };

  // =========================================================
  // CLOSE FORM
  // =========================================================

  const closeForm = () => {
    if (formLoading) return;

    setShowForm(false);
    setError("");
  };

  // =========================================================
  // CREATE ASSIGNMENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.equipmentId) {
      setError("Please select equipment.");
      return;
    }

    if (!form.assignedTo.trim()) {
      setError("Please enter the assigned person's name.");
      return;
    }

    try {
      setFormLoading(true);

      const data = {
        equipmentId: Number(form.equipmentId),
        assignedTo: form.assignedTo.trim(),
        department: form.department.trim() || null,
        assignedDate: form.assignedDate,
        remarks: form.remarks.trim() || null,
      };

      await api.post("/EquipmentAssignments", data);

      setSuccess("Equipment assigned successfully.");

      setShowForm(false);

      setForm({
        equipmentId: "",
        assignedTo: "",
        department: "",
        assignedDate:
          new Date().toISOString().split("T")[0],
        remarks: "",
      });

      await loadAssignments();
      await loadEquipment();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to assign equipment."
      );
    } finally {
      setFormLoading(false);
    }
  };

  // =========================================================
  // RETURN EQUIPMENT
  // =========================================================

  const handleReturn = async (assignment) => {
    const confirmed = window.confirm(
      `Return ${assignment.equipment?.name || "this equipment"}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.put(
        `/EquipmentAssignments/${assignment.id}/return`
      );

      setSuccess("Equipment returned successfully.");

      await loadAssignments();
      await loadEquipment();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to return equipment."
      );
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "assigned":
        return "assignment-status assigned";

      case "returned":
        return "assignment-status returned";

      default:
        return "assignment-status";
    }
  };

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalAssignments = assignments.length;

  const activeAssignments = assignments.filter(
    (item) =>
      item.status?.toLowerCase() === "assigned"
  ).length;

  const returnedAssignments = assignments.filter(
    (item) =>
      item.status?.toLowerCase() === "returned"
  ).length;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="assignment-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="assignment-header">

        <div>
          <h1>Equipment Assignments</h1>

          <p>
            Track equipment assigned to employees and departments.
          </p>
        </div>

        <button
          className="add-assignment-btn"
          onClick={openForm}
        >
          + Assign Equipment
        </button>

      </div>


      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {success && (
        <div className="assignment-success">
          ✓ {success}
        </div>
      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="assignment-error">
          ⚠ {error}
        </div>
      )}


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="assignment-summary">

        <div className="assignment-card">

          <div className="assignment-icon blue">
            📋
          </div>

          <div>
            <span>Total Assignments</span>
            <strong>{totalAssignments}</strong>
          </div>

        </div>


        <div className="assignment-card">

          <div className="assignment-icon green">
            ✓
          </div>

          <div>
            <span>Active Assignments</span>
            <strong>{activeAssignments}</strong>
          </div>

        </div>


        <div className="assignment-card">

          <div className="assignment-icon orange">
            ↩
          </div>

          <div>
            <span>Returned</span>
            <strong>{returnedAssignments}</strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          ASSIGNMENT FORM
      ===================================================== */}

      {showForm && (

        <div className="assignment-form-card">

          <div className="assignment-form-header">

            <div>
              <h2>Assign Equipment</h2>

              <p>
                Assign available equipment to an employee.
              </p>
            </div>

            <button
              type="button"
              className="close-form-btn"
              onClick={closeForm}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="assignment-form-grid">

              {/* EQUIPMENT */}

              <div className="form-group">

                <label>
                  Equipment <span>*</span>
                </label>

                <select
                  name="equipmentId"
                  value={form.equipmentId}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select equipment
                  </option>

                  {equipment
                    .filter(
                      (item) =>
                        Number(item.quantity) > 0
                    )
                    .map((item) => (

                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.equipmentCode} -{" "}
                        {item.name}{" "}
                        ({item.quantity} available)
                      </option>

                    ))}

                </select>

              </div>


              {/* ASSIGNED TO */}

              <div className="form-group">

                <label>
                  Assigned To <span>*</span>
                </label>

                <input
                  type="text"
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                />

              </div>


              {/* DEPARTMENT */}

              <div className="form-group">

                <label>
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. IT Department"
                />

              </div>


              {/* DATE */}

              <div className="form-group">

                <label>
                  Assignment Date
                </label>

                <input
                  type="date"
                  name="assignedDate"
                  value={form.assignedDate}
                  onChange={handleChange}
                />

              </div>

            </div>


            {/* REMARKS */}

            <div className="form-group">

              <label>
                Remarks
              </label>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter any additional remarks..."
                rows="3"
              />

            </div>


            {/* BUTTONS */}

            <div className="assignment-form-actions">

              <button
                type="button"
                className="cancel-assignment-btn"
                onClick={closeForm}
                disabled={formLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-assignment-btn"
                disabled={formLoading}
              >
                {formLoading
                  ? "Assigning..."
                  : "Assign Equipment"}
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="assignment-table-card">

        <div className="assignment-table-header">

          <div>
            <h3>Assignment Records</h3>

            <p>
              View equipment assignment history
            </p>
          </div>

          <span>
            {assignments.length}{" "}
            {assignments.length === 1
              ? "record"
              : "records"}
          </span>

        </div>


        {loading ? (

          <div className="assignment-message">
            Loading assignments...
          </div>

        ) : assignments.length === 0 ? (

          <div className="assignment-message">

            <div className="empty-icon">
              📋
            </div>

            <h3>
              No assignment records
            </h3>

            <p>
              No equipment has been assigned yet.
            </p>

          </div>

        ) : (

          <div className="assignment-table-wrapper">

            <table className="assignment-table">

              <thead>

                <tr>
                  <th>Equipment</th>
                  <th>Assigned To</th>
                  <th>Department</th>
                  <th>Assigned Date</th>
                  <th>Returned Date</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>


              <tbody>

                {assignments.map((item) => (

                  <tr key={item.id}>

                    {/* EQUIPMENT */}

                    <td>

                      <div className="assignment-equipment">

                        <div className="assignment-equipment-icon">
                          💻
                        </div>

                        <div>

                          <strong>
                            {item.equipment?.name || "-"}
                          </strong>

                          <span>
                            {item.equipment?.equipmentCode || "-"}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* ASSIGNED TO */}

                    <td>
                      <strong>
                        {item.assignedTo || "-"}
                      </strong>
                    </td>


                    {/* DEPARTMENT */}

                    <td>

                      <span className="department-badge">
                        {item.department || "-"}
                      </span>

                    </td>


                    {/* ASSIGNED DATE */}

                    <td>
                      {formatDate(item.assignedDate)}
                    </td>


                    {/* RETURNED DATE */}

                    <td>
                      {formatDate(item.returnedDate)}
                    </td>


                    {/* REMARKS */}

                    <td>

                      <span className="assignment-remarks">
                        {item.remarks || "-"}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={getStatusClass(
                          item.status
                        )}
                      >
                        {item.status || "Unknown"}
                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      {item.status?.toLowerCase() ===
                      "assigned" ? (

                        <button
                          className="return-equipment-btn"
                          onClick={() =>
                            handleReturn(item)
                          }
                        >
                          Return
                        </button>

                      ) : (

                        <span className="returned-text">
                          Returned
                        </span>

                      )}

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

export default Assignment;

