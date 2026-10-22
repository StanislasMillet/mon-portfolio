"use client";

import Link from "next/link";

export default function ComingSoonViewer() {
  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 opacity-80 hover:opacity-100 transition-opacity"
      >
        <img src="/logo.png" alt="Retour au carrousel" className="h-8 w-auto" />
      </Link>

      <img
        src="/moving-logo.png"
        alt=""
        className="absolute left-0 pointer-events-none"
        style={{
          top: "calc(50% - 140px)",
          width: 200,
          height: "auto",
          animation: "moveAcross 8s linear infinite",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-black text-2xl font-semibold">Coming soon</h1>
      </div>
    </div>
  );
}