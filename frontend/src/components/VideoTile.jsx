


import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function VideoTile({ emp }) {
  const videoRef = useRef(null);
  const pcRef = useRef(null);
  const [status, setStatus] = useState(emp.status || "offline");
  const [lastLogin, setLastLogin] = useState(emp.latestLogin || null);
  const [duration, setDuration] = useState("00:00:00");

  // Format seconds -> hh:mm:ss
  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return "00:00:00";
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Update live duration if online
  useEffect(() => {
    let interval;
    if (status === "online" && lastLogin) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - new Date(lastLogin)) / 1000);
        setDuration(formatDuration(diff));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [status, lastLogin]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) socket.emit("register", { userId: user.id });

    const onOffer = async ({ offer, fromSocketId, userId }) => {
      if (String(userId) !== String(emp._id)) return;
      try {
        pcRef.current = new RTCPeerConnection();
        pcRef.current.ontrack = (e) => {
          videoRef.current.srcObject = e.streams[0];
        };
        pcRef.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("webrtc-ice", {
              targetSocketId: fromSocketId,
              candidate: e.candidate,
            });
          }
        };
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("webrtc-answer", { toSocketId: fromSocketId, answer });
      } catch (err) {
        console.error(err);
      }
    };

    const onIce = async ({ candidate }) => {
      if (pcRef.current && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    };

    const onUserStatus = ({ userId, status, lastLogin }) => {
      if (String(userId) === String(emp._id)) {
        setStatus(status);
        if (status === "online") setLastLogin(lastLogin);
      }
    };

    socket.on("webrtc-offer", onOffer);
    socket.on("webrtc-ice", onIce);
    socket.on("user-status", onUserStatus);

    return () => {
      socket.off("webrtc-offer", onOffer);
      socket.off("webrtc-ice", onIce);
      socket.off("user-status", onUserStatus);
      if (pcRef.current) pcRef.current.close();
    };
  }, [emp]);

  return (
    <div
      style={{
        width: 320,
        border: "1px solid #ddd",
        borderRadius: 6,
        padding: 6,
        margin: 6,
      }}
    >
      <div style={{ height: 200, background: "#000" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600, color: "#b30000" }}>{emp.name}</div>
        <div style={{ fontSize: 12 }}>{emp.email}</div>
        <div style={{ fontSize: 12 }}>
          Status:{" "}
          <span style={{ color: status === "online" ? "green" : "gray" }}>
            {status}
          </span>
        </div>
        {status === "online" && (
          <div style={{ fontSize: 12 }}>
            Duration: <b>{duration}</b>
          </div>
        )}
        
      </div>
    </div>
  );
}
