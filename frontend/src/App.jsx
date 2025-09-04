import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeHome from "./pages/EmployeeHome";
import AttendanceHistory from "./pages/AttendanceHistory";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/employee" element={token && role === "employee" ? <EmployeeHome /> : <Navigate to="/" />} />
      <Route path="/history" element={token && role === "employee" ? <AttendanceHistory /> : <Navigate to="/" />} />
      <Route path="/admin" element={token && role === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
