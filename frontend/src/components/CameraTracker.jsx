// import React, { useEffect, useRef } from "react";

// function CameraTracker() {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         videoRef.current.srcObject = stream;
//       })
//       .catch((err) => console.error("Camera error:", err));
//   }, []);

//   return (
//     <div>
//       <video ref={videoRef} autoPlay playsInline width="400" />
//     </div>
//   );
// }

// export default CameraTracker;



import React, { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function CameraTracker() {
  const videoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    socket.emit("register", { userId, role });

    socket.on("request-stream", async () => {
      console.log("📹 Admin requested stream");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;

      peerConnection.current = new RTCPeerConnection();
      stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));

      peerConnection.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("webrtc-ice-candidate", { targetId: "admin", candidate: e.candidate });
        }
      };

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("webrtc-offer", { adminId: "admin", offer });
    });

    socket.on("webrtc-answer", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("webrtc-ice-candidate", async ({ candidate }) => {
      if (candidate) {
        try {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("ICE error:", err);
        }
      }
    });
  }, []);

  return <video ref={videoRef} autoPlay playsInline width="400" />;
}

export default CameraTracker;
