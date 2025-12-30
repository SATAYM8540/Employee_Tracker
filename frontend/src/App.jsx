

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmployeeHome from "./pages/EmployeeHome";
import AttendanceHistory from "./pages/AttendanceHistory";
import AdminDashboard from "./pages/AdminDashboard";
import AddEmployee from "./pages/AddEmployee";
import SuperuserDashboard from "./pages/SuperuserDashboard";
import SuperuserAddEmployee from "./pages/SuperuserAddEmployee";

export default function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Employee */}
      <Route path="/employee" element={token && role === "employee" ? <EmployeeHome /> : <Navigate to="/" />} />
      <Route path="/history" element={token && role === "employee" ? <AttendanceHistory /> : <Navigate to="/" />} />

      {/* Admin */}
      <Route path="/admin" element={token && role === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
      <Route path="/admin/add-employee" element={token && role === "admin" ? <AddEmployee /> : <Navigate to="/" />} />
      <Route path="/admin/add-employee/:id" element={token && role === "admin" ? <AddEmployee /> : <Navigate to="/" />} />

      {/* Superuser */}
      <Route path="/superuser/dashboard" element={token && role === "superuser" ? <SuperuserDashboard /> : <Navigate to="/" />} />
      <Route path="/superuser/add-employee" element={token && role === "superuser" ? <SuperuserAddEmployee /> : <Navigate to="/" />} />
      <Route path="/superuser/add-employee/:id" element={token && role === "superuser" ? <SuperuserAddEmployee /> : <Navigate to="/" />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
