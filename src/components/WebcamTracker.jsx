import React, { useEffect, useRef, useState } from "react";
import { Camera as CameraIcon, CameraOff } from "lucide-react";

export default function WebcamTracker({ onMove, onReachBrother, tied }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let camera = null;
    let hands = null;
    let isCancelled = false;

    const initTracker = async () => {
      // Poll until window.Hands and window.Camera are loaded from CDN
      let retries = 0;
      while ((!window.Hands || !window.Camera) && retries < 25) {
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
        hands = new HandsClass({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, 
          minDetectionConfidence: 0.3, 
          minTrackingConfidence: 0.3,
        });

        hands.onResults((results) => {
          if (tied) return;

          // Draw fingertip animation indicator on canvas overlay
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
              canvas.width = canvas.clientWidth;
              canvas.height = canvas.clientHeight;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const landmarks = results.multiHandLandmarks[0];
              const targetPoint = landmarks[8] || landmarks[9]; // Index tip / fallback palm

              if (targetPoint) {
                // Draw moving dot on fingertip position
                const x = targetPoint.x * canvas.width;
                const y = targetPoint.y * canvas.height;

                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = "#ff4757";
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();

                // Movement calculation
                const mirroredX = 1 - targetPoint.x;
                const minBound = 0.15;
                const maxBound = 0.85;
                
                const normalizedX = (mirroredX - minBound) / (maxBound - minBound);
                const percentageX = Math.min(Math.max(normalizedX * 100, 0), 100);

                onMove(percentageX);

                if (percentageX >= 98) {
                  onReachBrother();
                }
              }
            }
          }
        });

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
                  if (videoRef.current && hands && !isCancelled) {
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
      <div style={styles.videoWrapper}>
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          style={styles.videoPreview}
        />
        <canvas ref={canvasRef} style={styles.canvasOverlay} />
      </div>

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
  videoWrapper: {
    position: "relative",
    width: "140px",
    height: "105px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    border: "2px solid #ffffff",
    background: "#000000",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
  },
  canvasOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    transform: "scaleX(-1)",
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