import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { Camera as CameraIcon, CameraOff } from "lucide-react";

export default function WebcamTracker({ onMove, onReachBrother, tied }) {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let camera = null;
    let hands = null;

    const initTracker = async () => {
      try {
        // 1. Initialize MediaPipe Hands optimized for mobile performance
        hands = new Hands({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // 0 = Fast performance for mobile CPUs
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          if (tied) return;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const indexFingerTip = landmarks[8]; // Landmark 8 is Index Finger Tip

            if (indexFingerTip) {
              // Flip X coordinates (1 - x) to create a natural mirror effect
              const mirroredX = 1 - indexFingerTip.x;
              const percentageX = Math.min(Math.max(mirroredX * 100, 0), 100);

              onMove(percentageX);

              // Trigger Rakhi completion when hand moves across 75% of screen width
              if (percentageX >= 75) {
                onReachBrother();
              }
            }
          }
        });

        // 2. Request Mobile-Friendly Camera Stream (640x480 max resolution)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 30, max: 30 },
            },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            // Wait for video metadata to load before starting MediaPipe Camera Loop
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              setCameraActive(true);

              camera = new Camera(videoRef.current, {
                onFrame: async () => {
                  if (videoRef.current) {
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
          setErrorMsg("Camera access not supported or blocked (Requires HTTPS).");
        }
      } catch (err) {
        console.error("Webcam Error:", err);
        setErrorMsg("Camera permission denied or unavailable.");
      }
    };

    initTracker();

    return () => {
      if (camera) camera.stop();
      if (hands) hands.close();
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [tied]);

  return (
    <div style={styles.container}>
      {/* Hidden processing video element with iOS inline play attributes */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ display: "none" }}
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
    alignItems: "center",
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