"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        transition: "opacity 0.4s ease",
        opacity: progress >= 100 ? 0 : 1,
      }}
    >
      <img src="/loading.gif" alt="" style={{ width: 160, height: "auto" }} />

      <div
        style={{
          width: 240,
          height: 6,
          backgroundColor: "#e5e5e5",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#0100fc",
            transition: "width 0.2s ease",
          }}
        />
      </div>

      <span style={{ fontSize: 12, color: "#0100fc" }}>
        {Math.round(progress)}%
      </span>
    </div>
  );
}