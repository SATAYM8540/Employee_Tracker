// import React from "react";

// function VideoStream({ streamUrl }) {
//   return (
//     <div>
//       <h3>Employee Live Stream</h3>
//       <video src={streamUrl} controls autoPlay width="400" />
//     </div>
//   );
// }

// export default VideoStream;



import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function VideoStream({ employeeId }) {
  const videoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    socket.emit("register", { userId: "admin", role });

    // Send stream request to employee
    socket.emit("request-stream", employeeId);

    socket.on("webrtc-offer", async ({ employeeId, offer }) => {
      peerConnection.current = new RTCPeerConnection();

      peerConnection.current.ontrack = (event) => {
        videoRef.current.srcObject = event.streams[0];
      };

      peerConnection.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("webrtc-ice-candidate", { targetId: employeeId, candidate: e.candidate });
        }
      };

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("webrtc-answer", { employeeId, answer });
    });

    socket.on("webrtc-ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Admin ICE error:", err);
        }
      }
    });
  }, [employeeId]);

  return (
    <div>
      <h3>Live Stream from Employee</h3>
      <video ref={videoRef} autoPlay playsInline controls width="400" />
    </div>
  );
}

export default VideoStream;
