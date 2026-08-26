import React from "react";

export default function RakhiThreadOverlay() {
  return (
    <svg style={styles.svgThreadOverlay}>
      <defs>
        <linearGradient id="threadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d63031" />
          <stop offset="50%" stopColor="#fbc531" />
          <stop offset="100%" stopColor="#d63031" />
        </linearGradient>
      </defs>
      <line
        x1="38%"
        y1="52%"
        x2="63%"
        y2="52%"
        stroke="url(#threadGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 6px #d63031)" }}
      />
    </svg>
  );
}

const styles = {
  svgThreadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 5,
  },
};