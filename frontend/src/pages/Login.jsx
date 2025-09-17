
import React, { useState } from "react";
import client from "../api/client";
import "./Login.css"; // Import CSS file

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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

      if (user.role === "admin") window.location.href = "/admin";
      else window.location.href = "/employee";
    } catch (err) {
      setErr(err.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        {/* <img src="/trackNova1.png" alt="TrackNova Logo" className="logo" /> */}

        <h2 className="title">TrackNova Login</h2>

        {/* Error */}
        {err && <p className="error">{err}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <input
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
            {/* <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-btn"
            >
              {showPassword ? "Hide" : "Show"}
            </button> */}
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="demo-creds">
          <p>Admin: admin@tracknova.com / Admin123</p>
          <p>Employee: emp1@tracknova.com / Employee123</p>
        </div>
      </div>
    </div>
  );
}
