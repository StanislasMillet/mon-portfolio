"use client";

import { useEffect, useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import { DRACOLoader } from "three-stdlib";
import Link from "next/link";

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

const mod = (n, m) => ((n % m) + m) % m;

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
  }, [size, baseFov, camera]);

  return null;
}

function RingModel({ model, angle, radius, onSelect }) {
  const { scene } = useGLTF(model.path, undefined, undefined, (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });
  const scale = model.scale || 1;

  const centeredScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.scale.setScalar(scale);
    clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return clone;
  }, [scene, scale]);

  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  return (
    <group
      position={[x, 0, z]}
      rotation={[0, angle, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <group rotation={[0, model.rotationOffset || 0, 0]}>
        <primitive object={centeredScene} />
      </group>
    </group>
  );
}

function Ring3D({ models, targetRotation, radius, onSelect }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const current = groupRef.current.rotation.y;
    groupRef.current.rotation.y = current + (targetRotation - current) * 0.12;
  });

  const anglePer = (Math.PI * 2) / models.length;

  return (
    <group ref={groupRef}>
      {models.map((model, i) => (
        <RingModel
          key={model.path}
          model={model}
          angle={i * anglePer}
          radius={radius}
          onSelect={() => onSelect(i)}
        />
      ))}
    </group>
  );
}

export default function Model3DViewer({ project }) {
  const models = project.models;
  const total = models.length;
  const isSingle = total === 1;

  const RADIUS = Math.max(6, total * 1.6);
  const controlsTarget = useMemo(() => [0, 0, RADIUS], [RADIUS]);

  const [live, setLive] = useState(0);
  const index = mod(Math.round(live), total);

  const goNext = () => {
    if (total > 1) setLive((prev) => Math.round(prev) + 1);
  };
  const goPrev = () => {
    if (total > 1) setLive((prev) => Math.round(prev) - 1);
  };

  const goTo = (i) =>
    setLive((prev) => {
      const current = Math.round(prev);
      let diff = mod(i - current, total);
      if (diff > total / 2) diff -= total;
      return current + diff;
    });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [total]);

  const anglePer = (Math.PI * 2) / total;
  const targetRotation = -live * anglePer;
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

      <Canvas camera={{ position: [0, 0, RADIUS + 5], fov: 50 }} flat>
        <ResponsiveCamera baseFov={50} />
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} />
        <Environment preset="warehouse" environmentIntensity={0.5} />
        <Suspense fallback={null}>
          <Ring3D
            models={models}
            targetRotation={targetRotation}
            radius={RADIUS}
            onSelect={goTo}
          />
        </Suspense>
        <OrbitControls
          target={controlsTarget}
          enableRotate={!isSingle}
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={5}
        />
      </Canvas>

      {!isSingle && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-6xl text-[#0100fc] hover:text-[#ff6b35] transition-colors"
            aria-label="Modèle précédent"
          >
            ‹
          </button>

          <button
            onClick={goNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-6xl text-[#0100fc] hover:text-[#ff6b35] transition-colors"
            aria-label="Modèle suivant"
          >
            ›
          </button>
        </>
      )}

      <div className="absolute bottom-20 inset-x-0 text-center px-8 z-40 pointer-events-none">
        <h2 className="text-black text-2xl font-semibold">{current.title}</h2>
      </div>

      {!isSingle && (
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
      )}
    </div>
  );
}