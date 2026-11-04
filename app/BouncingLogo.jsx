"use client";

import { useEffect, useRef } from "react";

export default function BouncingLogo({ speed = 120 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let x = Math.random() * 200;
    let y = Math.random() * 200;
    let dx = speed;
    let dy = speed;
    let last = performance.now();
    let rafId;

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const maxX = window.innerWidth - el.offsetWidth;
      const maxY = window.innerHeight - el.offsetHeight;

      x += dx * dt;
      y += dy * dt;

      if (x <= 0) {
        x = 0;
        dx = Math.abs(dx);
      } else if (x >= maxX) {
        x = maxX;
        dx = -Math.abs(dx);
      }

      if (y <= 0) {
        y = 0;
        dy = Math.abs(dy);
      } else if (y >= maxY) {
        y = maxY;
        dy = -Math.abs(dy);
      }

      el.style.transform = `translate(${x}px, ${y}px)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [speed]);

  return (
    <img
      ref={ref}
      src="/bouncing-logo.png"
      alt=""
      className="fixed top-0 left-0 z-[3] pointer-events-none w-20 sm:w-[120px] h-auto"
    />
  );
}