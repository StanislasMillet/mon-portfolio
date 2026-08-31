"use client";

import Link from "next/link";

export default function AboutViewer({ project }) {
  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 opacity-80 hover:opacity-100 transition-opacity"
      >
        <img src="/logo.png" alt="Retour au carrousel" className="h-8 w-auto" />
      </Link>

      <video
        src={project.aboutVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-16 left-0 w-full h-auto z-10"
      />

      
        <a
        
  href={project.cvPdf}
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 block group"
>
  <img
    src={project.cvThumbnail}
    alt="Voir mon CV"
    className="w-32 h-auto rounded-md group-hover:opacity-80 transition-opacity"
  />
  <span className="block text-center mt-2 text-sm text-[#0100fc] group-hover:text-[#ff6b35] transition-colors">
    View my resume
  </span>
</a>
    </div>
  );
}