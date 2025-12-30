

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

export default function SuperuserDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Fetch all admins + employees from backend
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await client.get("/superuser/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      alert("Failed to fetch employees from server.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add new employee/admin
  const handleAddEmployee = () => navigate("/superuser/add-employee");

  // ✅ Edit existing employee/admin
  const handleEditEmployee = (id) => navigate(`/superuser/add-employee/${id}`);

  // ✅ Delete employee/admin
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await client.delete(`/superuser/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete user.");
    }
  };

  // ✅ Logout superuser
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: "#b30000", marginBottom: "1rem" }}>Superuser Dashboard</h2>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={handleAddEmployee}
          style={{
            background: "green",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            marginRight: 10,
            cursor: "pointer",
          }}
        >
          Add Employee/Admin
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "red",
            color: "white",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            textAlign: "left",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td>{emp.name}</td>
                  <td>{emp.email}</td>
                  <td style={{ textTransform: "capitalize" }}>{emp.role}</td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleEditEmployee(emp._id)}
                      style={{
                        background: "blue",
                        color: "white",
                        padding: "4px 8px",
                        marginRight: 6,
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp._id)}
                      style={{
                        background: "red",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "gray" }}>
                  No employees or admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
