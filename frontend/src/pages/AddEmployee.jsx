
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function AddEmployee() {
  const navigate = useNavigate();
  const { id } = useParams(); // if id exists → editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Load employee data if editing
  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await client.get(`/admin/employees/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData({
            name: res.data.name,
            email: res.data.email,
            password: "", // don’t show actual password
            role: res.data.role,
          });
          setIsEditing(true);
        } catch (err) {
          console.error(err);
          alert("Failed to load employee details");
        }
      };
      fetchEmployee();
    }
  }, [id]);

  // handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new employee
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await client.post("/admin/employees", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Employee added successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    }
  };

  // Edit existing employee
  const handleEdit = async () => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");
      await client.put(`/admin/employees/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Employee updated successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Failed to update employee");
    }
  };

  // Delete existing employee
  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      await client.delete(`/admin/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Employee deleted successfully!");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h2>{isEditing ? "Edit Employee" : "Add Employee"}</h2>
      <div style={{ marginBottom: 10 }}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={isEditing ? "Enter new password if changing" : ""}
          style={{ width: "100%", padding: 8 }}
          required={!isEditing}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Role:</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          style={{ width: "100%", padding: 8 }}
        >
          <option value="">Select Role</option>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Buttons */}
      {!isEditing && (
        <button
          onClick={handleSave}
          style={{
            background: "green",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Save
        </button>
      )}

      {isEditing && (
        <>
          <button
            onClick={handleEdit}
            style={{
              background: "orange",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            style={{
              marginLeft: 10,
              background: "red",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}
