"use client";

import { useRef, useState,useEffect } from "react";
import Link from "next/link";
import { Canvas, useLoader, useFrame,useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";


const DRAG_SENSITIVITY = 300;
const CARD_HEIGHT = 2.6;

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

function RingCard({ image, angle, title, text, video, radius }) {
  const texture = useLoader(TextureLoader, image);
  texture.colorSpace = THREE.SRGBColorSpace;

  const aspect = texture.image.width / texture.image.height;
  const height = CARD_HEIGHT;
  const width = height * aspect;

  const handleClick = (e) => {
    e.stopPropagation();
    if (video) {
      window.open(video, "_blank");
    }
  };

  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh onClick={handleClick}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} side={2} />
      </mesh>
      <Text
        position={[0, -height / 2 - 0.3, 0]}
        fontSize={0.14}
        color="black"
        anchorX="center"
        anchorY="middle"
        maxWidth={6}
        font="/fonts/semibold.ttf"
      >
        {title}
      </Text>
      <Text
        position={[0, -height / 2 - 0.48, 0]}
        fontSize={0.09}
        color="#666666"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        font="/fonts/regular.ttf"
      >
        {text}
      </Text>
    </group>
  );
}

function Ring3D({ sections, targetRotation, radius }) {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const current = groupRef.current.rotation.y;
    groupRef.current.rotation.y = current + (targetRotation - current) * 0.15;
  });

  const total = sections.length;
  const anglePer = (Math.PI * 2) / total;

  return (
    <group ref={groupRef}>
      {sections.map((section, i) => (
        <RingCard
          key={i}
          image={section.image}
          angle={i * anglePer}
          title={section.title}
          text={section.text}
          video={section.video}
          radius={radius}
        />
      ))}
    </group>
  );
}

export default function ProjectViewer({ project }) {
  const sections = project.sections;
  const total = sections.length;

  const RADIUS = Math.max(5, total * 0.75);
  const CAMERA_DISTANCE = Math.max(10, RADIUS + 5);

  const [liveOffset, setLiveOffset] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      setLiveOffset((prev) => Math.round(prev) + 1);
    } else if (e.key === "ArrowLeft") {
      setLiveOffset((prev) => Math.round(prev) - 1);
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);

  const handleStart = (clientX) => {
    isDragging.current = true;
    startX.current = clientX;
    startOffset.current = liveOffset;
  };

  const handleMove = (clientX) => {
    if (!isDragging.current) return;
    const delta = (startX.current - clientX) / DRAG_SENSITIVITY;
    setLiveOffset(startOffset.current + delta);
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const anglePer = (Math.PI * 2) / total;
  const targetRotation = -liveOffset * anglePer;

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

      <div
        className="absolute inset-0"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => handleStart(e.clientX)}
        onPointerMove={(e) => handleMove(e.clientX)}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
      >
        <Canvas camera={{ position: [0, 0, CAMERA_DISTANCE], fov: 50 }} flat>
  <ResponsiveCamera baseFov={50} />
  <Ring3D sections={sections} targetRotation={targetRotation} radius={RADIUS} />
  <OrbitControls
    enableRotate={false}
    enablePan={false}
    enableZoom={true}
    minDistance={6}
    maxDistance={CAMERA_DISTANCE + 4}
  />
</Canvas>
      </div>
    </div>
  );
}