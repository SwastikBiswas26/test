import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function CardModal({ showCard, sisterName, brotherName, message, setMessage, resetGame }) {
  return (
    <AnimatePresence>
      {showCard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={styles.modalOverlay}
        >
          <div style={styles.modalContent}>
            <h2 style={{ color: "#d63031", marginBottom: 8, fontSize: "1.3rem" }}>
              Happy Raksha Bandhan! 🧵✨
            </h2>
            
            <p style={{ fontSize: "0.85rem", color: "#636e72", marginBottom: 12 }}>
              From <strong>Brother</strong> to <strong>Sister 💕</strong>
            </p>
            <textarea
              style={styles.cardTextarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div style={styles.buttonGroup}>
              <button style={styles.resetBtn} onClick={resetGame}>
                <RefreshCw size={14} style={{ marginRight: 6 }} /> Replay
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "15px",
  },
  modalContent: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "350px",
    textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
  },
  cardTextarea: {
    width: "100%",
    height: "75px",
    background: "#f1f2f6",
    border: "1px solid #dfe6e9",
    borderRadius: "8px",
    color: "#2d3436",
    padding: "8px",
    fontSize: "0.85rem",
    resize: "none",
    outline: "none",
    marginBottom: "10px",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    background: "#74b9ff",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "bold",
  },
};