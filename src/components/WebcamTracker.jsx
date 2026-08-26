import React, { useEffect, useRef } from "react";

export default function WebcamTracker({ onMove, onReachBrother, tied }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const tiedRef = useRef(tied);

  useEffect(() => {
    tiedRef.current = tied;
  }, [tied]);

  useEffect(() => {
    const HandsClass = window.Hands;
    const CameraClass = window.Camera;

    if (!HandsClass || !CameraClass) {
      console.error("MediaPipe Hands script not loaded");
      return;
    }

    const hands = new HandsClass({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((results) => {
      if (tiedRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8];

        if (indexTip) {
          const x = indexTip.x * canvas.width;
          const y = indexTip.y * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.fillStyle = "#ff4757";
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();

          const normalizedX = 1 - indexTip.x;
          onMove(normalizedX * 100);

          if (normalizedX > 0.65) {
            onReachBrother();
          }
        }
      }
    });

    if (videoRef.current) {
      const camera = new CameraClass(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && !tiedRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [onMove, onReachBrother]);

  return (
    <div style={styles.webcamContainer} className="webcam-box">
      <div style={styles.liveIndicator}>
        <span style={{ ...styles.redDot, backgroundColor: tied ? "#74b9ff" : "#2ed573" }} />
        {tied ? "COMPLETED" : "FINGERTIP ACTIVE"}
      </div>
      <video ref={videoRef} style={styles.webcamVideo} playsInline muted />
      <canvas ref={canvasRef} width="640" height="480" style={styles.canvasOverlay} />
    </div>
  );
}

const styles = {
  webcamContainer: {
    position: "relative",
    width: "220px",
    height: "145px",
    borderRadius: "14px",
    overflow: "hidden",
    border: "3px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
    background: "#000",
    flexShrink: 0,
  },
  webcamVideo: {
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
  liveIndicator: {
    position: "absolute",
    top: "6px",
    left: "8px",
    fontSize: "0.6rem",
    fontWeight: "bold",
    color: "#fff",
    background: "rgba(0, 0, 0, 0.65)",
    padding: "3px 8px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    zIndex: 2,
  },
  redDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
  },
};