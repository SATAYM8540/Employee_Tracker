import React, { useState } from "react";
import client from "../api/client";

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [err,setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await client.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("name", user.name);
      localStorage.setItem("user", JSON.stringify({ id: user.id, name: user.name, role: user.role }));
      if (user.role === "admin") window.location.href = "/admin";
      else window.location.href = "/employee";
    } catch (err) {
      setErr(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="container">
      <h2>TrackNova Login</h2>
      <form onSubmit={handleSubmit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required />
        <button type="submit">Login</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
      {/* <div style={{marginTop:8,color:'#b30000'}}>Admin: admin@tracknova.com / Admin123</div> */}
      {/* <div style={{color:'#b30000'}}>Employee: emp1@tracknova.com / Employee123</div> */}
    </div>
  );
}
