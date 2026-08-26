import React, { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, CameraOff } from "lucide-react";

export default function WebcamTracker({ onMove, onReachBrother, tied }) {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let camera = null;
    let hands = null;
    let isCancelled = false;

    const initTracker = async () => {
      // Poll until window.Hands and window.Camera are loaded from CDN
      let retries = 0;
      while ((!window.Hands || !window.Camera) && retries < 20) {
        if (isCancelled) return;
        await new Promise((r) => setTimeout(r, 200));
        retries++;
      }

      const HandsClass = window.Hands;
      const CameraClass = window.Camera;

      if (!HandsClass || !CameraClass) {
        setErrorMsg("Failed to load MediaPipe scripts.");
        return;
      }

      try {
        // 1. Initialize MediaPipe Hands
        hands = new HandsClass({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // Fast performance
          minDetectionConfidence: 0.4, // Lowered for easier tracking
          minTrackingConfidence: 0.4,
        });

        hands.onResults((results) => {
          if (tied) return;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const indexFingerTip = landmarks[8]; // Index finger tip

            if (indexFingerTip) {
              // Flip X coordinates (1 - x) to create a natural mirror effect
              const mirroredX = 1 - indexFingerTip.x;
              const percentageX = Math.min(Math.max(mirroredX * 100, 0), 100);

              onMove(percentageX);

              // Trigger when hand reaches 75%
              if (percentageX >= 75) {
                onReachBrother();
              }
            }
          }
        });

        // 2. Request Camera Stream
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30, max: 30 },
            },
          });

          if (isCancelled) {
            stream.getTracks().forEach((track) => track.stop());
            return;
          }

          if (videoRef.current) {
            videoRef.current.srcObject = stream;

            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().catch(() => {});
              setCameraActive(true);

              camera = new CameraClass(videoRef.current, {
                onFrame: async () => {
                  if (videoRef.current && hands) {
                    await hands.send({ image: videoRef.current });
                  }
                },
                width: 640,
                height: 480,
              });
              camera.start();
            };
          }
        } else {
          setErrorMsg("Camera access not supported (Requires HTTPS).");
        }
      } catch (err) {
        console.error("Webcam Error:", err);
        setErrorMsg("Camera permission denied or unavailable.");
      }
    };

    initTracker();

    return () => {
      isCancelled = true;
      if (camera) {
        try { camera.stop(); } catch (e) {}
      }
      if (hands) {
        try { hands.close(); } catch (e) {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [tied]);

  return (
    <div style={styles.container}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={styles.videoPreview}
      />

      <div style={styles.badge}>
        {cameraActive ? (
          <>
            <CameraIcon size={16} color="#2ed573" style={{ marginRight: 6 }} />
            <span style={{ color: "#2ed573", fontWeight: "bold", fontSize: "0.8rem" }}>
              Tracking Active
            </span>
          </>
        ) : (
          <>
            <CameraOff size={16} color="#ff4757" style={{ marginRight: 6 }} />
            <span style={{ color: "#ff4757", fontWeight: "bold", fontSize: "0.8rem" }}>
              {errorMsg || "Starting Camera..."}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  videoPreview: {
    width: "140px",
    height: "105px",
    borderRadius: "12px",
    objectFit: "cover",
    transform: "scaleX(-1)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    border: "2px solid #ffffff",
    background: "#000000",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    padding: "6px 12px",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
};