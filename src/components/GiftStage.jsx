import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Gift, RefreshCw } from "lucide-react";

export default function GiftStage({ onReset }) {
  const [isOpened, setIsOpened] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isOpenedRef = useRef(isOpened);

  useEffect(() => {
    isOpenedRef.current = isOpened;
  }, [isOpened]);

  useEffect(() => {
    const HandsClass = window.Hands;
    const CameraClass = window.Camera;

    if (!HandsClass || !CameraClass) return;

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
      if (isOpenedRef.current) return;

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
          const normalizedY = indexTip.y;

          if (
            normalizedX > 0.35 &&
            normalizedX < 0.65 &&
            normalizedY > 0.35 &&
            normalizedY < 0.65
          ) {
            handleOpenGift();
          }
        }
      }
    });

    if (videoRef.current) {
      const camera = new CameraClass(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && !isOpenedRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  const handleOpenGift = () => {
    if (!isOpenedRef.current) {
      setIsOpened(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#ff4757", "#ffa502", "#2ed573", "#e1b12c"],
      });
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @media (max-width: 600px) {
          .gift-header {
            flex-direction: column-reverse !important;
            align-items: center !important;
            padding: 10px 14px !important;
            gap: 8px !important;
          }
          .gift-webcam {
            width: 140px !important;
            height: 90px !important;
          }
          .gift-prompt {
            text-align: center !important;
            font-size: 0.95rem !important;
          }
        }
      `}</style>

      {/* Responsive Header Bar */}
      <header style={styles.header} className="gift-header">
        <h2 style={styles.promptText} className="gift-prompt">
          {isOpened
            ? "🎉 Surprise! You opened your gift! 🎁"
            : "Wave your hand over the gift box to open it!"}
        </h2>

        <div style={styles.webcamContainer} className="gift-webcam">
          <div style={styles.liveIndicator}>
            <span
              style={{
                ...styles.redDot,
                backgroundColor: isOpened ? "#74b9ff" : "#2ed573",
              }}
            />
            {isOpened ? "OPENED" : "ACTIVE"}
          </div>
          <video ref={videoRef} style={styles.webcamVideo} playsInline muted />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            style={styles.canvasOverlay}
          />
        </div>
      </header>

      {/* Main Interactive Gift Screen */}
      <div
        style={{
          ...styles.giftBox,
          transform: isOpened ? "scale(1.1) rotate(5deg)" : "scale(1)",
        }}
        onClick={handleOpenGift}
      >
        <div style={styles.ribbonVertical} />
        <div style={styles.ribbonHorizontal} />
        <Gift size={isOpened ? 90 : 70} color="#ffffff" style={styles.icon} />
      </div>

      {isOpened && (
        <div style={styles.rewardCard}>
          <h3 style={styles.rewardTitle}>Special Blessing & Gift ✨</h3>
          <p style={styles.rewardText}>
            Wishing you happiness, safety, and endless laughter today and always!
          </p>
          <button style={styles.resetBtn} onClick={onReset}>
            <RefreshCw size={16} style={{ marginRight: 6 }} /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#ffffff",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    width: "100%",
    maxWidth: "850px",
    background: "rgba(248, 249, 250, 0.95)",
    padding: "12px 20px",
    borderRadius: "20px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    boxSizing: "border-box",
  },
  promptText: {
    fontSize: "clamp(0.95rem, 2.5vw, 1.3rem)",
    color: "#2d3436",
    fontWeight: "bold",
    textAlign: "left",
    margin: 0,
  },
  webcamContainer: {
    position: "relative",
    width: "180px",
    height: "115px",
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
    fontSize: "0.55rem",
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
  giftBox: {
    width: "160px",
    height: "160px",
    backgroundColor: "#ff4757",
    borderRadius: "20px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 30px rgba(255, 71, 87, 0.4)",
    cursor: "pointer",
    transition: "transform 0.4s ease",
    margin: "auto 0",
  },
  ribbonVertical: {
    position: "absolute",
    width: "26px",
    height: "100%",
    backgroundColor: "#ffa502",
    borderRadius: "4px",
  },
  ribbonHorizontal: {
    position: "absolute",
    height: "26px",
    width: "100%",
    backgroundColor: "#ffa502",
    borderRadius: "4px",
  },
  icon: {
    zIndex: 2,
  },
  rewardCard: {
    marginBottom: "20px",
    padding: "16px 24px",
    borderRadius: "16px",
    background: "#f8f9fa",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    boxSizing: "border-box",
  },
  rewardTitle: {
    color: "#2ed573",
    fontSize: "1.1rem",
    fontWeight: "bold",
    marginBottom: "6px",
  },
  rewardText: {
    color: "#636e72",
    fontSize: "0.88rem",
    marginBottom: "14px",
  },
  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 20px",
    backgroundColor: "#2d3436",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};