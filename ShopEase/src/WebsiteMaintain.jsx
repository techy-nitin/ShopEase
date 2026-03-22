import React from "react";
import Maintain from "./assets/maintain.mp4";

export default function MaintainPage() {
  return (
    <div style={styles.container}>
      <video
        src={Maintain}
        autoPlay
        loop
        muted
        playsInline
        style={styles.video}
      />

      <div style={styles.overlay}>
        <h1 style={styles.text}>We are coming soon</h1>
      </div>
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
    overflow: "hidden",
    background: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  overlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  text: {
    color: "#000",                // 🔥 black text
    fontSize: "42px",
    fontWeight: "700",
    padding: "12px 24px",
    background: "rgba(255,255,255,0.8)", // 🔥 white box behind text
    borderRadius: "10px",
  },
};