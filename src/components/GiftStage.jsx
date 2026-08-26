import React, { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { Gift, RefreshCw, Maximize, Minimize } from "lucide-react";

export default function GiftStage({ onReset }) {
  const [isOpened, setIsOpened] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const isOpenedRef = useRef(isOpened);

  useEffect(() => {
    isOpenedRef.current = isOpened;
  }, [isOpened]);

  // Track fullscreen changes (e.g., when exiting via swipe or back button)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const docEl = document.documentElement;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch((err) => console.log(err));
      } else if (docEl.webkitRequestFullscreen) {
        /* Safari / iOS support */
        docEl.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const HandsClass = window.Hands;
    const CameraClass = window.Camera;
    let cameraInstance = null;

    if (!HandsClass || !CameraClass) return;

    const hands = new HandsClass({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results) => {
      if (isOpenedRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8];

        if (indexTip) {
          const x = indexTip.x * canvas.width;
          const y = indexTip.y * canvas.height;

          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = "#ff4757";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();

          const normalizedX = 1 - indexTip.x;
          const normalizedY = indexTip.y;

          if (
            normalizedX > 0.20 &&
            normalizedX < 0.80 &&
            normalizedY > 0.20 &&
            normalizedY < 0.80
          ) {
            handleOpenGift();
          }
        }
      }
    });

    if (videoRef.current) {
      cameraInstance = new CameraClass(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && !isOpenedRef.current) {
            await hands.send({ image: videoRef.current });
          }
        },
        width: 480,
        height: 360,
      });
      cameraInstance.start();
    }

    return () => {
      if (cameraInstance) {
        cameraInstance.stop();
      }
      hands.close();
    };
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
            padding: 8px 12px !important;
            gap: 6px !important;
          }
          .gift-webcam {
            width: 110px !important;
            height: 75px !important;
          }
          .gift-prompt {
            text-align: center !important;
            font-size: 0.85rem !important;
          }
          .gift-box-wrapper {
            width: 120px !important;
            height: 120px !important;
            margin: 16px 0 !important;
          }
        }
      `}</style>

      {/* Fullscreen Floating Toggle Button */}
      <button style={styles.fullscreenBtn} onClick={toggleFullscreen} title="Toggle Fullscreen">
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>

      {/* Header Bar */}
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
          <canvas ref={canvasRef} style={styles.canvasOverlay} />
        </div>
      </header>

      {/* Gift Box */}
      <div
        className="gift-box-wrapper"
        style={{
          ...styles.giftBox,
          transform: isOpened ? "scale(1.05) rotate(4deg)" : "scale(1)",
        }}
        onClick={handleOpenGift}
      >
        <div style={styles.ribbonVertical} />
        <div style={styles.ribbonHorizontal} />
        <Gift size={isOpened ? 70 : 55} color="#ffffff" style={styles.icon} />
      </div>

      {/* Reward Card */}
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
    width: "100%",
    height: "100dvh",
    backgroundColor: "#ffffff",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
    boxSizing: "border-box",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  },
  fullscreenBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    zIndex: 10000,
    backgroundColor: "rgba(45, 52, 54, 0.85)",
    color: "#ffffff",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    width: "100%",
    maxWidth: "850px",
    background: "rgba(248, 249, 250, 0.95)",
    padding: "10px 16px",
    borderRadius: "16px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
    boxSizing: "border-box",
  },
  promptText: {
    fontSize: "clamp(0.85rem, 2.5vw, 1.2rem)",
    color: "#2d3436",
    fontWeight: "bold",
    textAlign: "left",
    margin: 0,
  },
  webcamContainer: {
    position: "relative",
    width: "150px",
    height: "100px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "2px solid rgba(255, 255, 255, 0.9)",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
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
    top: "4px",
    left: "6px",
    fontSize: "0.5rem",
    fontWeight: "bold",
    color: "#fff",
    background: "rgba(0, 0, 0, 0.65)",
    padding: "2px 6px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    zIndex: 2,
  },
  redDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
  },
  giftBox: {
    width: "140px",
    height: "140px",
    backgroundColor: "#ff4757",
    borderRadius: "18px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(255, 71, 87, 0.35)",
    cursor: "pointer",
    transition: "transform 0.3s ease",
    margin: "16px 0",
    flexShrink: 0,
  },
  ribbonVertical: {
    position: "absolute",
    width: "20px",
    height: "100%",
    backgroundColor: "#ffa502",
    borderRadius: "3px",
  },
  ribbonHorizontal: {
    position: "absolute",
    height: "20px",
    width: "100%",
    backgroundColor: "#ffa502",
    borderRadius: "3px",
  },
  icon: {
    zIndex: 2,
  },
  rewardCard: {
    margin: "8px 0 12px 0",
    padding: "14px 18px",
    borderRadius: "14px",
    background: "#f8f9fa",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    textAlign: "center",
    maxWidth: "380px",
    width: "100%",
    boxSizing: "border-box",
  },
  rewardTitle: {
    color: "#2ed573",
    fontSize: "1rem",
    fontWeight: "bold",
    marginBottom: "4px",
  },
  rewardText: {
    color: "#636e72",
    fontSize: "0.82rem",
    marginBottom: "12px",
  },
  resetBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    backgroundColor: "#2d3436",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.85rem",
  },
};