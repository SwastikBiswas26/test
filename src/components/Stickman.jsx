import React from "react";
import { Heart } from "lucide-react";

export default function Stickman({
  name,
  strokeColor,
  isTied,
  showRakhi,
  containerRef,
}) {
  return (
    <div
      ref={containerRef}
      style={{
        ...styles.wrapper,
        transform: "translate3d(var(--sister-x, 0px), 0, 0)",
        willChange: "transform",
      }}
    >
      {/* Fixed Non-Editable Name Label */}
      <div style={styles.nameContainer}>
        <span style={styles.nameTag}>{name}</span>
      </div>

      <svg width="100" height="180" viewBox="0 0 100 180" style={styles.svg}>
        {/* Head */}
        <circle
          cx="50"
          cy="35"
          r="18"
          stroke={strokeColor}
          strokeWidth="4"
          fill="#ffffff"
        />

        {/* Face */}
        <circle cx="43" cy="32" r="2" fill={strokeColor} />
        <circle cx="57" cy="32" r="2" fill={strokeColor} />
        <path
          d="M 43 40 Q 50 46 57 40"
          stroke={strokeColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Body */}
        <line
          x1="50"
          y1="53"
          x2="50"
          y2="110"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Left Arm - Sister (now on the right) extends her left arm back toward Brother */}
        <line
          x1="50"
          y1="70"
          x2={!showRakhi ? (isTied ? "15" : "25") : "30"}
          y2={isTied ? "75" : "85"}
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Right Arm - Brother (on the left) extends his right arm forward toward Sister */}
        <line
          x1="50"
          y1="70"
          x2={showRakhi ? (isTied ? "85" : "70") : "75"}
          y2={isTied ? "75" : "85"}
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Legs reaching ground */}
        <line
          x1="50"
          y1="110"
          x2="40"
          y2="180"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="50"
          y1="110"
          x2="60"
          y2="180"
          stroke={strokeColor}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Rakhi tied indicator on Brother's wrist */}
        {showRakhi && isTied && (
          <g>
            <circle cx="85" cy="75" r="6" fill="#ff4757" />
            <circle cx="85" cy="75" r="3" fill="#ffa502" />
          </g>
        )}
      </svg>

      {isTied && (
        <div style={styles.heartWrapper}>
          <Heart size={20} color="#ff4757" fill="#ff4757" />
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    marginBottom: "0px",
  },
  nameContainer: {
    marginBottom: "6px",
    zIndex: 3,
  },
  nameTag: {
    background: "rgba(255, 255, 255, 0.9)",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#2d3436",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    userSelect: "none",
  },
  svg: {
    overflow: "visible",
    display: "block",
  },
  heartWrapper: {
    position: "absolute",
    top: "-15px",
  },
};