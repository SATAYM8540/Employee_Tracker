

import React, { useState } from "react";
import client from "../api/client";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr(""); // clear previous errors

    try {
      const res = await client.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem(
        "user",
        JSON.stringify({ id: user.id, name: user.name, role: user.role })
      );

      // Redirect based on role
      if (user.role === "superuser") window.location.href = "/superuser/dashboard";
      else if (user.role === "admin") window.location.href = "/admin";
      else window.location.href = "/employee";
    } catch (err) {
      if (err.response) {
        setErr(err.response.data?.error || "Invalid credentials");
      } else {
        setErr("Server unreachable. Please try again later.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="title">TrackNova Login</h2>
        {err && <p className="error">{err}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <div className="password-field">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* <div className="demo-creds">
          <p>Superuser: superuser@tracknova.com / Super123</p>
          <p>Admin: admin@tracknova.com / Admin123</p>
          <p>Employee: emp1@tracknova.com / Employee123</p>
        </div> */}
      </div>
    </div>
  );
}
