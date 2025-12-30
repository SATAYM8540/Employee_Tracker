

import React, { useEffect } from "react";
import client from "../api/client";

export default function EmployeeHome() {
  const IDLE_LIMIT = 30 * 60 * 1000; // 30 minutes
  const MIN_INTERVAL = 10 * 60 * 1000; // 10 minutes
  const MAX_INTERVAL = 15 * 60 * 1000; // 15 minutes
  let idleTimeout;

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await client.post(
        "/employee/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    let captureTimeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        alert("You have been inactive for 30 minutes. Logging out...");
        handleLogout();
      }, IDLE_LIMIT);
    };

    // Helper to convert Base64 -> Blob (needed for FormData)
    const dataURLtoBlob = (dataURL) => {
      const arr = dataURL.split(",");
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    };

    const captureAndSendImage = async () => {
      try {
        // Request webcam access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement("video");
        video.srcObject = stream;
        await video.play();

        // Capture a frame
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to image Blob
        const imageData = canvas.toDataURL("image/jpeg", 0.85); // compress for smaller size
        const blob = dataURLtoBlob(imageData);
        const file = new File([blob], `snapshot-${Date.now()}.jpg`, { type: blob.type });

        // Stop camera after capture
        stream.getTracks().forEach((track) => track.stop());

        // Send to backend as FormData
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("captureImage", file); // field name must match backend multer

        const res = await client.post("/employee/capture", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📸 Snapshot saved:", res.data);

      } catch (err) {
        console.error("❌ Failed to capture/send image:", err);
      }

      // Schedule next random capture
      const randomInterval =
        Math.floor(Math.random() * (MAX_INTERVAL - MIN_INTERVAL + 1)) + MIN_INTERVAL;
      captureTimeout = setTimeout(captureAndSendImage, randomInterval);
    };

    // Start capture immediately + idle timer
    captureAndSendImage();
    resetIdleTimer();

    // Reset idle timer on user activity
    ["mousemove", "keydown", "scroll", "touchstart"].forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    return () => {
      clearTimeout(captureTimeout);
      clearTimeout(idleTimeout);
      ["mousemove", "keydown", "scroll", "touchstart"].forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, []);

  return (
    <div className="container">
      <h2 style={{ color: "#b30000" }}>
        Welcome, {localStorage.getItem("name")}
      </h2>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => (window.location.href = "/history")}>
          Attendance History
        </button>
        <button onClick={handleLogout} style={{ marginLeft: 8 }}>
          Logout
        </button>
      </div>
    </div>
  );
}
