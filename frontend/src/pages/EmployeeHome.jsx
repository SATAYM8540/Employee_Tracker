import React from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

function EmployeeHome() {
  const navigate = useNavigate();

  const checkIn = async () => {
    await client.post("/track/checkin");
    alert("Checked In!");
  };

  const checkOut = async () => {
    await client.post("/track/checkout");
    alert("Checked Out!");
  };

  return (
    <div className="container">
      <h2>Welcome, {localStorage.getItem("name")}</h2>
      <button onClick={checkIn}>Check In</button>
      <button onClick={checkOut}>Check Out</button>
      <button onClick={() => navigate("/history")}>View History</button>
    </div>
  );
}

export default EmployeeHome;
