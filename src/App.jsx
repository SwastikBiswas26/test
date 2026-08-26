import React, { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, UserCheck } from "lucide-react";

import SunBackground from "./components/SunBackground";
import Stickman from "./components/Stickman";
import RakhiThreadOverlay from "./components/RakhiThreadOverlay";
import CardModal from "./components/CardModal";
import WebcamTracker from "./components/WebcamTracker";
import GiftStage from "./components/GiftStage";

export default function App() {
  const [showNameSetup, setShowNameSetup] = useState(true);
  const [sisterName, setSisterName] = useState("Sister");
  const [brotherName, setBrotherName] = useState("Brother");
  const [tied, setTied] = useState(false);
  const [message, setMessage] = useState(
    "Even across regions, screens, and unseen faces, our bond is as real as it gets! Distance means nothing when a friendship is this special. Happy Rakhi! ❤️"
  );
  const [showCard, setShowCard] = useState(false);
  const [showGiftStage, setShowGiftStage] = useState(false);

  const sisterRef = useRef(null);
  const brotherRef = useRef(null);
  const maxDistanceRef = useRef(0);
  const targetXRef = useRef(0);
  const currentXRef = useRef(0);

  // Recalculate distance so Sister crosses Brother completely to stand on his RIGHT side
  const updateMaxDistance = () => {
    if (sisterRef.current && brotherRef.current) {
      const sisterRect = sisterRef.current.getBoundingClientRect();
      const brotherRect = brotherRef.current.getBoundingClientRect();

      // Distance to left side + full width of Brother + 10px offset to stand right next to him
      const distanceToCross = (brotherRect.left - sisterRect.left) + brotherRect.width + 10;
      maxDistanceRef.current = Math.max(0, distanceToCross);
    }
  };

  useEffect(() => {
    updateMaxDistance();
    window.addEventListener("resize", updateMaxDistance);
    return () => window.removeEventListener("resize", updateMaxDistance);
  }, [showNameSetup]);

  // Smooth Interpolation (LERP Loop) for 60 FPS motion
  useEffect(() => {
    let animationFrameId;

    const updatePosition = () => {
      currentXRef.current += (targetXRef.current - currentXRef.current) * 0.15;

      if (sisterRef.current) {
        sisterRef.current.style.setProperty(
          "--sister-x",
          `${currentXRef.current}px`
        );
      }

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleSaveNames = (e) => {
    e.preventDefault();
    if (sisterName.trim() && brotherName.trim()) {
      setShowNameSetup(false);
      setTimeout(updateMaxDistance, 100);
    }
  };

  const handleWebcamMove = (percentageX) => {
    if (tied || showNameSetup) return;
    // Map webcam movement percentage (0 - 100) directly to crossing distance
    targetXRef.current = (percentageX / 100) * maxDistanceRef.current;
  };

  const handleReachBrother = () => {
    if (!tied && !showNameSetup) {
      setTied(true);
      // Lock sister position on the right side of Brother upon arrival
      targetXRef.current = maxDistanceRef.current;

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#ff4757", "#2ed573", "#ffa502", "#70a1ff"],
      });
      setTimeout(() => setShowCard(true), 800);
    }
  };

  const resetGame = () => {
    setTied(false);
    setShowCard(false);
    setShowGiftStage(false);
    targetXRef.current = 0;
    currentXRef.current = 0;
  };

  if (showGiftStage) {
    return <GiftStage onReset={resetGame} />;
  }

  return (
    <div style={styles.container}>
      <SunBackground />

      {/* Initial First-Time Name Setup Form Modal */}
      {showNameSetup && (
        <div style={styles.setupOverlay}>
          <form style={styles.setupCard} onSubmit={handleSaveNames}>
            <div style={styles.setupIconHeader}>
              <Sparkles size={28} color="#ffa502" />
            </div>
            <h2 style={styles.setupTitle}>Welcome to Virtual Rakhi!</h2>
            <p style={styles.setupSubtitle}>
              Please enter the names to customize your experience before starting:
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Sister's Name</label>
              <input
                type="text"
                value={sisterName}
                onChange={(e) => setSisterName(e.target.value)}
                placeholder="Enter Sister's name"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Brother's Name</label>
              <input
                type="text"
                value={brotherName}
                onChange={(e) => setBrotherName(e.target.value)}
                placeholder="Enter Brother's name"
                required
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.submitBtn}>
              <UserCheck size={18} style={{ marginRight: 8 }} /> Start Virtual Rakhi
            </button>
          </form>
        </div>
      )}

      <header style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>
            <Sparkles style={{ marginRight: 6, color: "#e1b12c" }} />
            Virtual Rakhi
          </h1>
          <p style={styles.subtitle}>
            {tied
              ? "Rakhi Tied! 🎉"
              : "Move your index finger across screen to make Sister reach Brother!"}
          </p>
        </div>
        <WebcamTracker
          onMove={handleWebcamMove}
          onReachBrother={handleReachBrother}
          tied={tied}
        />
      </header>

      <div style={styles.stage}>
        <div style={styles.interactiveArea}>
          {tied && <RakhiThreadOverlay />}

          <div style={styles.gameGrid}>
            <Stickman
              containerRef={sisterRef}
              name={sisterName}
              strokeColor="#d63031"
              isTied={tied}
              showRakhi={false}
            />

            <div style={styles.threadZone} />

            <Stickman
              containerRef={brotherRef}
              name={brotherName}
              strokeColor="#0984e3"
              isTied={tied}
              showRakhi={true}
            />
          </div>

          <div style={styles.dinoGround}>
            <div style={styles.groundLine} />
          </div>
        </div>
      </div>

      <CardModal
        showCard={showCard}
        sisterName={sisterName}
        brotherName={brotherName}
        message={message}
        setMessage={setMessage}
        resetGame={() => {
          setShowCard(false);
          setShowGiftStage(true);
        }}
      />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
    width: "100vw",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    boxSizing: "border-box",
    position: "relative",
    overflowX: "hidden",
  },
  setupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100dvh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(6px)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    boxSizing: "border-box",
  },
  setupCard: {
    background: "#ffffff",
    padding: "24px 20px",
    borderRadius: "24px",
    maxWidth: "380px",
    width: "100%",
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  setupIconHeader: {
    background: "#fff8e7",
    padding: "12px",
    borderRadius: "50%",
    marginBottom: "12px",
  },
  setupTitle: {
    fontSize: "1.35rem",
    fontWeight: "bold",
    color: "#2d3436",
    margin: "0 0 6px 0",
  },
  setupSubtitle: {
    fontSize: "0.85rem",
    color: "#636e72",
    marginBottom: "20px",
  },
  inputGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "2px solid #dfe6e9",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#ff4757",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "8px",
    boxShadow: "0 4px 14px rgba(255, 71, 87, 0.3)",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    width: "100%",
    maxWidth: "850px",
    zIndex: 2,
    marginTop: "6px",
    background: "rgba(255, 255, 255, 0.85)",
    padding: "12px 16px",
    borderRadius: "20px",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
    flex: "1 1 180px",
  },
  title: {
    fontSize: "clamp(1.1rem, 4vw, 1.8rem)",
    display: "flex",
    alignItems: "center",
    color: "#2d3436",
    fontWeight: "bold",
    margin: 0,
  },
  subtitle: {
    fontSize: "clamp(0.75rem, 2.8vw, 0.9rem)",
    color: "#636e72",
    marginTop: "4px",
    fontWeight: "600",
    lineHeight: "1.2",
  },
  stage: {
    width: "100%",
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
    margin: "auto 0 12px 0",
  },
  interactiveArea: {
    position: "relative",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  gameGrid: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    width: "100%",
    alignItems: "end",
    justifyItems: "center",
    marginBottom: "0px",
  },
  threadZone: { width: "15vw" },
  dinoGround: {
    width: "100vw",
    marginLeft: "calc(-50vw + 50%)",
    height: "16px",
    background: "#2ed573",
    position: "relative",
    boxShadow: "0 -2px 10px rgba(46, 213, 115, 0.3)",
  },
  groundLine: {
    width: "100%",
    height: "100%",
    borderTop: "3px dashed #26de81",
  },
};