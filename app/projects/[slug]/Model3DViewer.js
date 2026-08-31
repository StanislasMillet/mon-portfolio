"use client";

import { useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { DRACOLoader } from "three-stdlib";
import Link from "next/link";
import {  useThree } from "@react-three/fiber";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

function ResponsiveCamera({ baseFov = 50 }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    let fov = baseFov;

    if (aspect < 1) {
      fov = baseFov + (1 - aspect) * 30;
      fov = Math.min(fov, 80);
    }

    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [size, baseFov]);

  return null;
}

function CenteredModel({ path, scale = 1 }) {
  const { scene } = useGLTF(path, undefined, undefined, (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });

  const centeredScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return clone;
  }, [scene, scale]);

  return <primitive object={centeredScene} />;
}

export default function Model3DViewer({ project }) {
  const models = project.models;
  const total = models.length;

  const [index, setIndex] = useState(0);

  const goPrev = () => setIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setIndex((prev) => Math.min(total - 1, prev + 1));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, total]);

  const current = models[index];

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 opacity-80 hover:opacity-100 transition-opacity"
      >
        <img src="/logo.png" alt="Retour au carrousel" className="h-8 w-auto" />
      </Link>
      {project.logo && (
  <Link
    href="/"
    className="fixed top-6 left-1/2 -translate-x-1/2 z-50 opacity-80 hover:opacity-100 transition-opacity"
  >
    <img src={project.logo} alt="Retour au carrousel" className="h-8 w-auto" />
  </Link>
)}

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} flat>
  <ResponsiveCamera baseFov={50} />
  <ambientLight intensity={1} />
  <directionalLight position={[5, 5, 5]} intensity={0.8} />
  <directionalLight position={[-5, 3, -5]} intensity={0.5} />
  <Environment preset="warehouse" environmentIntensity={0.5} />
  <CenteredModel path={current.path} scale={current.scale || 1} />
  <OrbitControls
    enableRotate={true}
    enablePan={false}
    enableZoom={true}
    minDistance={1.5}
    maxDistance={5}
  />
</Canvas>

      {index > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-6xl text-[#0100fc] hover:text-[#ff6b35] transition-colors"
          aria-label="Modèle précédent"
        >
          ‹
        </button>
      )}

      {index < total - 1 && (
        <button
          onClick={goNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-6xl text-[#0100fc] hover:text-[#ff6b35] transition-colors"
          aria-label="Modèle suivant"
        >
          ›
        </button>
      )}

      <div className="absolute bottom-20 inset-x-0 text-center px-8 z-40 pointer-events-none">
        <h2 className="text-black text-2xl font-semibold">{current.title}</h2>
      </div>

      <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-40 pointer-events-none">
        {models.map((_, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === index ? 10 : 6,
              height: i === index ? 10 : 6,
              backgroundColor: i === index ? "#0100fc" : "#cccccc",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}