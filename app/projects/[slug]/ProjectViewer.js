"use client";

import { useRef, useState,useEffect } from "react";
import Link from "next/link";
import { Canvas, useLoader, useFrame,useThree } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { TextureLoader } from "three";
import * as THREE from "three";
import { parseGIF, decompressFrames } from "gifuct-js";


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

function useGifTexture(url) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let rafId;
    let tex;

    (async () => {
      const buffer = await fetch(url).then((r) => r.arrayBuffer());
      if (cancelled) return;

      const gif = parseGIF(buffer);
      const frames = decompressFrames(gif, true);
      const { width, height } = gif.lsd;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const patchCanvas = document.createElement("canvas");
      const patchCtx = patchCanvas.getContext("2d");

      tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;

      const draw = (frame) => {
        const { dims, patch } = frame;
        patchCanvas.width = dims.width;
        patchCanvas.height = dims.height;
        patchCtx.putImageData(new ImageData(patch, dims.width, dims.height), 0, 0);
        ctx.drawImage(patchCanvas, dims.left, dims.top);
        tex.needsUpdate = true;
      };

      let i = 0;
      let last = performance.now();
      draw(frames[0]);
      setTexture(tex);

      const tick = (now) => {
        if (cancelled) return;
        if (now - last >= (frames[i].delay || 100)) {
          const prev = frames[i];
          if (prev.disposalType === 2) {
            ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
          }
          i = (i + 1) % frames.length;
          if (i === 0) ctx.clearRect(0, 0, width, height);
          draw(frames[i]);
          last = now;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (tex) tex.dispose();
    };
  }, [url]);

  return texture;
}

function CardMesh({ texture, angle, title, text, video, link, radius }) {
  const aspect = texture.image.width / texture.image.height;
  const height = CARD_HEIGHT;
  const width = height * aspect;
  const target = video || link;

  const handleClick = (e) => {
    e.stopPropagation();
    if (target) window.open(target, "_blank", "noopener,noreferrer");
  };

  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <mesh
        onClick={handleClick}
        onPointerOver={() => target && (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
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

function StaticCard(props) {
  const texture = useLoader(TextureLoader, props.image);
  texture.colorSpace = THREE.SRGBColorSpace;
  return <CardMesh texture={texture} {...props} />;
}

function GifCard(props) {
  const texture = useGifTexture(props.image);
  if (!texture) return null;
  return <CardMesh texture={texture} {...props} />;
}

function RingCard(props) {
  const isGif = props.image.toLowerCase().endsWith(".gif");
  return isGif ? <GifCard {...props} /> : <StaticCard {...props} />;
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
  link={section.link}
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

  const goNext = () => setLiveOffset((prev) => Math.round(prev) + 1);
  const goPrev = () => setLiveOffset((prev) => Math.round(prev) - 1);

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

      <button
        onClick={goPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-50 text-6xl text-[#0100fc] hover:text-[#ff6b35] transition-colors"
        aria-label="Section précédente"
      >
        ‹
      </button>

      <button
        onClick={goNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-50 text-6xl text-[#0100fc] hover:text-[#ff6b35] transition-colors"
        aria-label="Section suivante"
      >
        ›
      </button>
    </div>
  );
}