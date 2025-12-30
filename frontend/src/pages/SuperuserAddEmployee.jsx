
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";

export default function SuperuserAddEmployee() {
  const { id } = useParams(); // if id exists → edit mode
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "employee" });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await client.get(`/superuser/employees/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFormData({ ...res.data, password: "" });
          setIsEditing(true);
        } catch (err) {
          console.error(err);
          alert("Failed to load employee data");
        }
      };
      fetchEmployee();
    }
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (isEditing) {
        await client.put(`/superuser/employees/${id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
        alert("Employee updated successfully!");
      } else {
        await client.post("/superuser/employees", formData, { headers: { Authorization: `Bearer ${token}` } });
        alert("Employee added successfully!");
      }
      navigate("/superuser/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to save employee");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 500, margin: "0 auto" }}>
      <h2>{isEditing ? "Edit Employee" : "Add Employee"}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: "100%", padding: 8 }} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isEditing ? "Leave blank if not changing" : ""}
            required={!isEditing}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange} required style={{ width: "100%", padding: 8 }}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={{ background: "green", color: "white", padding: "8px 16px", borderRadius: 6 }}>
          Save
        </button>
        <button type="button" onClick={() => navigate("/superuser/dashboard")} style={{ marginLeft: 10, background: "gray", color: "white", padding: "8px 16px", borderRadius: 6 }}>
          Back
        </button>
      </form>
    </div>
  );
}

