import React from "react";
import { Sun } from "lucide-react";

export default function SunBackground() {
  return (
    <div style={styles.backgroundWrapper}>
      {/* Moving Sky Animation */}
      <div style={styles.skyGradient} />

      {/* Animated Clouds Layer 1 (Slower, background) */}
      <div style={{ ...styles.cloudLayer, ...styles.cloudLayer1 }}>
        <div style={{ ...styles.cloud, top: "12%", left: "5%", transform: "scale(1.2)" }} />
        <div style={{ ...styles.cloud, top: "25%", left: "55%", transform: "scale(0.9)" }} />
        <div style={{ ...styles.cloud, top: "18%", left: "80%", transform: "scale(1.4)" }} />
      </div>

      {/* Animated Clouds Layer 2 (Faster, foreground) */}
      <div style={{ ...styles.cloudLayer, ...styles.cloudLayer2 }}>
        <div style={{ ...styles.cloud, top: "8%", left: "30%", transform: "scale(1.5)", opacity: 0.9 }} />
        <div style={{ ...styles.cloud, top: "22%", left: "70%", transform: "scale(1.1)", opacity: 0.85 }} />
      </div>

      {/* Animated Sun */}
      <div style={styles.sunBox}>
        <Sun size={68} color="#fbc531" style={styles.sunGlow} />
      </div>
    </div>
  );
}

const styles = {
  backgroundWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    zIndex: 0,
    pointerEvents: "none",
  },
  skyGradient: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "linear-gradient(180deg, #ffffff 0%, #f1f2f6 60%, #eccc68 100%)",
  },
  sunBox: {
    position: "absolute",
    top: "25px",
    right: "200px",
    zIndex: 2,
    animation: "pulseSun 4s ease-in-out infinite alternate",
  },
  sunGlow: {
    filter: "drop-shadow(0 0 20px #fbc531)",
  },
  cloudLayer: {
    position: "absolute",
    width: "200%",
    height: "100%",
    top: 0,
    left: 0,
  },
  cloudLayer1: {
    animation: "moveClouds 35s linear infinite",
  },
  cloudLayer2: {
    animation: "moveClouds 20s linear infinite",
  },
  cloud: {
    position: "absolute",
    width: "140px",
    height: "45px",
    background: "#ffffff",
    borderRadius: "50px",
    boxShadow: "0 8px 15px rgba(0,0,0,0.04)",
    opacity: 0.8,
  },
};

// Inject Global CSS Animation Keyframes
const animationStyles = `
@keyframes moveClouds {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes pulseSun {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.08) rotate(15deg); }
}
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = animationStyles;
  document.head.appendChild(styleSheet);
}