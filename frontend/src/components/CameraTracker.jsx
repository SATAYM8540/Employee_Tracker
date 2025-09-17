



import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://employee-tracker-5.onrender.com");

export default function CameraTracker() {
  const localVideoRef = useRef(null);
  const pcsRef = useRef({});
  const streamRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    // Register as employee
    socket.emit("register", { userId: user.id, role: "employee" });

    // Get camera & mic
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: 640 },
          audio: true,
        });
        streamRef.current = s;
        if (localVideoRef.current) localVideoRef.current.srcObject = s;
      } catch (err) {
        console.error("getUserMedia failed", err);
      }
    })();

    // Handle admin stream request
    socket.on("request-stream", async ({ adminSocketId }) => {
      try {
        const pc = new RTCPeerConnection();
        pcsRef.current[adminSocketId] = pc;

        streamRef.current?.getTracks().forEach((track) =>
          pc.addTrack(track, streamRef.current)
        );

        pc.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("webrtc-ice", {
              targetSocketId: adminSocketId,
              candidate: e.candidate,
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("webrtc-offer", {
          adminSocketId,
          offer,
        });
      } catch (err) {
        console.error("Failed to handle request-stream:", err);
      }
    });

    // Handle answer from admin
    socket.on("webrtc-answer", async ({ answer }) => {
      for (const pc of Object.values(pcsRef.current)) {
        if (!pc._remoteSet) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          pc._remoteSet = true;
          break;
        }
      }
    });

    // ICE candidates
    socket.on("webrtc-ice", async ({ candidate }) => {
      for (const pc of Object.values(pcsRef.current)) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    });

    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      for (const pc of Object.values(pcsRef.current)) pc.close?.();
      socket.off("request-stream");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
    };
  }, []);

  return (
    <div>
      <h4 style={{ color: "#b30000" }}>Your Camera</h4>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{ width: 320, height: 240, background: "#000" }}
      />
    </div>
  );
}
