"use client";

import { useRouter } from "next/navigation";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Text } from "@react-three/drei";
import { TextureLoader } from "three";
import { projects } from "./data";
import { useMemo } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three-stdlib";
import { useThree } from "@react-three/fiber";

function ResponsiveCamera({ baseFov = 50 }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    let fov = baseFov;

    if (aspect < 1) {
      // écran plus haut que large (mobile portrait)
      fov = baseFov + (1 - aspect) * 30;
      fov = Math.min(fov, 80);
    }

    camera.fov = fov;
    camera.updateProjectionMatrix();
  }, [size, baseFov]);

  return null;
}

function Card({ position, rotationY, image, slug, router }) {
  const texture = useLoader(TextureLoader, image);

  const imgWidth = texture.image.width;
  const imgHeight = texture.image.height;
  const aspect = imgWidth / imgHeight;

  const maxHeight = 2.6;
  const height = maxHeight;
  const width = maxHeight * aspect;

  const handleClick = (e) => {
    e.stopPropagation();
    router.push(`/projects/${slug}`);
  };

  return (
    <mesh position={position} rotation={[0, rotationY, 0]} onClick={handleClick}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} side={2} />
    </mesh>
  );
}

function Logo() {
  const texture = useLoader(TextureLoader, "/logo.png");
  const aspect = texture.image.width / texture.image.height;
  const height = 0.8;
  const width = height * aspect;

  return (
    <mesh position={[0, 3, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent side={2} />
    </mesh>
  );
}

function CenterModel({ path, scale = 1 }) {
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

  return <primitive object={centeredScene} position={[0, 0, 0]} />;
}

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");

function Model({ position, rotationY, path, router, slug, scale = 1.5, rotationOffset = 0, title, description }) {
  const { scene } = useGLTF(path, undefined, undefined, (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });
  const SCALE = scale;

  const centeredScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.scale.setScalar(SCALE);
    clone.position.set(-center.x * SCALE, -center.y * SCALE, -center.z * SCALE);
    return clone;
  }, [scene, SCALE]);

  const handleClick = (e) => {
    e.stopPropagation();
    router.push(`/projects/${slug}`);
  };

  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={handleClick}>
      <group rotation={[0, rotationOffset, 0]}>
        <primitive object={centeredScene} />
      </group>
      <Text
  position={[0, -1, 0]}
  fontSize={0.18}
  color="black"
  anchorX="center"
  anchorY="middle"
  maxWidth={2.5}
  font="/fonts/semibold.ttf"
>
  {title}
</Text>
<Text
  position={[0, -1.2, 0]}
  fontSize={0.11}
  color="#666666"
  anchorX="center"
  anchorY="middle"
  maxWidth={6}
  font="/fonts/regular.ttf"
>
  {description}
</Text>
    </group>
  );
}

function Ring({ router }) {
  const total = projects.length;
  const radius = 5;

  const items = [];
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;

    if (i === 0) {
      items.push(
        <Model
          key="model-bench"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/bench-texturedv2.glb"
          router={router}
          slug={projects[i].slug}
          scale={1.5}
          title="Coffeeshop bench"
          description="Bench that allows the drinker to put its cup on the side"
        />
      );
    } else if (i === 1) {
      items.push(
        <Model
          key="model-clock"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/alarm-clockv2.glb"
          router={router}
          slug={projects[i].slug}
          scale={10}
          title="Teenage Engineering Alarm"
          description="Alarm designed using the Teenage Engineering aesthetic"
        />
      );
    } else if (i === 2) {
      items.push(
        <Model
          key="model-elops"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/elops-accessoriesv2.glb"
          router={router}
          slug={projects[i].slug}
          scale={3}
          rotationOffset={Math.PI}
          title="Elops Bike Accessories"
          description="Accessories for fixie bikes : front rack, sunglasses and bike handles"
        />
      );
    } else if (i === 3) {
      items.push(
        <Model
          key="model-desktop-holder"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/desktop-holderv2.glb"
          router={router}
          slug={projects[i].slug}
          scale={8}
          title="Desktop Holder"
          description="Professional project for Studio Raphaël Lutz to hold pencils and desk accessories"
        />
      );
    } else if (i === 4) {
      items.push(
        <Model
          key="coffee-table"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/coffee-tablev2.glb"
          router={router}
          slug={projects[i].slug}
          scale={2.5}
          title="Furniture Font Exploration"
          description="Metal furniture imagined on the basis of a font created by Awista Montagne"
        />
      );
    } else if (i === 5) {
      items.push(
        <Model
          key="model-printer"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/printer.glb"
          router={router}
          slug={projects[i].slug}
          scale={2.3}
          title="3D Printing Projects"
          description="Personal 3D printed projects for friends and family"
        />
      );
    } else if (i === 6) {
      items.push(
        <Model
          key="model-master"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/master.glb"
          router={router}
          slug={projects[i].slug}
          scale={5.5}
          title="Master's Project"
          description="Wearable device that helps blind people use domestic technology"
        />
      );
      } else if (i === 7) {
      items.push(
        <Model
          key="model-stan"
          position={[x, 0, z]}
          rotationY={angle}
          path="/models/stan.glb"
          router={router}
          slug={projects[i].slug}
          scale={8}
          title="About me"
          description="Contact CV info"
        />
      );
    } else {
      items.push(
        <Card
          key={projects[i].id}
          position={[x, 0, z]}
          rotationY={angle}
          image={projects[i].image}
          slug={projects[i].slug}
          router={router}
        />
      );
    }
  }

  return <group>{items}</group>;
}

import { useState, useEffect } from "react";

const backgrounds = [
  "/backgrounds/bg1.jpg",
  "/backgrounds/bg2.jpg",
  "/backgrounds/bg3.jpg",
  "/backgrounds/bg4.jpg",
  "/backgrounds/bg5.jpg",
];

export default function Carousel() {
  const router = useRouter();
  const [bgIndex, setBgIndex] = useState(0);

useEffect(() => {
  setBgIndex(Math.floor(Math.random() * backgrounds.length));
}, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") {
        setBgIndex((prev) => (prev - 1 + backgrounds.length) % backgrounds.length);
      } else if (e.key === "ArrowDown") {
        setBgIndex((prev) => (prev + 1) % backgrounds.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [initialRotation] = useState(() => {
    const total = projects.length;
    const randomIndex = Math.floor(Math.random() * total);
    const anglePerCard = (Math.PI * 2) / total;
    return randomIndex * anglePerCard;
  });

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative", overflow: "hidden" }}>
      <img
        src={backgrounds[bgIndex]}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          transition: "opacity 0.4s ease",
        }}
      />
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <Canvas camera={{ position: [0, 1.5, 11], fov: 50 }} gl={{ alpha: true }}>
  <ResponsiveCamera baseFov={50} baseAspect={16 / 9} />
  <ambientLight intensity={1.5} />
  <directionalLight position={[5, 5, 5]} intensity={0.8} />
  <directionalLight position={[-5, 3, -5]} intensity={0.5} />
  <Environment preset="warehouse" environmentIntensity={0.5} />
  <Logo />
  <CenterModel path="/models/north-star.glb" scale={10} />
  <group rotation={[0, initialRotation, 0]}>
    <Ring router={router} />
  </group>
  <OrbitControls
    enableZoom={true}
    enablePan={false}
    minPolarAngle={Math.PI / 3}
    maxPolarAngle={Math.PI / 1.7}
    minDistance={8}
    maxDistance={12}
  />
      </Canvas>
      </div>

      <div className="fixed bottom-5 inset-x-0 z-[2] flex flex-col items-center gap-1 sm:flex-row sm:justify-between sm:px-6">
        <div className="text-sm text-[#0100fc]">
          milletstanislas@gmail.com
        </div>
        <div className="text-sm text-[#0100fc] pointer-events-none">
          © Stanislas Millet
        </div>
        <div className="text-sm text-[#0100fc] pointer-events-none">
          ↑↓ images
        </div>
      </div>
    </div>
  );
}