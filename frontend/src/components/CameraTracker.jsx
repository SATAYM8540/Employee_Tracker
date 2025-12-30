import React, { useEffect, useRef } from "react";
import client from "../api/client";

export default function CameraTracker() {
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement("canvas"));

  useEffect(() => {
    let intervalId;
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        scheduleSnapshot();
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };

    const scheduleSnapshot = () => {
      // Random interval between 10-15 minutes in milliseconds
      const min = 10 * 60 * 1000;
      const max = 15 * 60 * 1000;
      const randomInterval = Math.floor(Math.random() * (max - min + 1)) + min;

      intervalId = setTimeout(async () => {
        await captureSnapshot();
        scheduleSnapshot(); // schedule next snapshot
      }, randomInterval);
    };

    const captureSnapshot = async () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg");

      try {
        const token = localStorage.getItem("token");
        await client.post(
          "/employee/capture",
          { url: dataUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Snapshot captured and uploaded");
      } catch (err) {
        console.error("Failed to upload snapshot", err);
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearTimeout(intervalId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div>
      <video
        ref={videoRef}
        style={{ display: "none" }} // hide video from user
      ></video>
    </div>
  );
}
