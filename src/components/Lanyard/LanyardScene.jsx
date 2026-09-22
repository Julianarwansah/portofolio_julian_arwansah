'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei/core/Gltf.js';
import { useTexture } from '@react-three/drei/core/Texture.js';
import { Environment } from '@react-three/drei/core/Environment.js';
import { Lightformer } from '@react-three/drei/core/Lightformer.js';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';

const cardGLB = `${import.meta.env.BASE_URL}assets/card.glb`;
const lanyard = `${import.meta.env.BASE_URL}assets/lanyard.png`;

const ANCHOR = new THREE.Vector3(0, 4, 0);
const SEGMENTS = 3;
const REST_LENGTH = 1;
const CARD_DROP = 1.5;
// Velocity retained per second, raised to dt each frame so the sway decays at
// the same rate on a 60 Hz and a 144 Hz display.
const DAMPING_PER_SECOND = 0.25;
const ITERATIONS = 12;
const UP = new THREE.Vector3(0, 1, 0);
const SPIN_STIFFNESS = 8;
const SPIN_DAMPING = 3;
const SPIN_FROM_DRAG = 4;

extend({ MeshLineGeometry, MeshLineMaterial });

export default function LanyardScene({ active = true, position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  return (
    <Canvas
      camera={{ position: position, fov: fov }}
      gl={{ alpha: transparent }}
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
    >
      <ambientLight intensity={Math.PI} />
      <Suspense fallback={null}>
        <Band gravity={gravity[1]} />
      </Suspense>
      <Environment blur={0.75}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}

function Band({ gravity = -40 }) {
  const band = useRef(), body = useRef();
  const dragOffset = useRef(new THREE.Vector3());
  const lastPointerX = useRef(null);
  const spin = useRef({ yaw: 0, velocity: 0 });

  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyard);

  const rope = useMemo(
    () =>
      Array.from({ length: SEGMENTS + 1 }, (_, i) => {
        const pos = new THREE.Vector3(ANCHOR.x + i * 0.2, ANCHOR.y - i * REST_LENGTH, ANCHOR.z);
        return { pos, prev: pos.clone() };
      }),
    []
  );

  const scratch = useMemo(
    () => ({
      vec: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      target: new THREE.Vector3(),
      up: new THREE.Vector3(),
      align: new THREE.Quaternion(),
      yaw: new THREE.Quaternion(),
    }),
    []
  );

  const [curve] = useState(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
    c.curveType = 'chordal';
    return c;
  });

  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 1024
  );

  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }, [texture]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const dt2 = dt * dt;
    const damp = Math.pow(DAMPING_PER_SECOND, dt);
    const { vec, dir, target, up, align, yaw } = scratch;
    const tip = rope[SEGMENTS];

    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.copy(state.camera.position).addScaledVector(dir, state.camera.position.length());
      target.copy(vec).sub(dragOffset.current).addScaledVector(UP, CARD_DROP);

      if (lastPointerX.current === null) {
        lastPointerX.current = state.pointer.x;
      } else {
        spin.current.velocity += (state.pointer.x - lastPointerX.current) * SPIN_FROM_DRAG;
        lastPointerX.current = state.pointer.x;
      }

      // Keep a fraction of the drag as momentum so letting go flings the strap.
      tip.prev.lerp(target, 0.5);
      tip.pos.copy(target);
    }

    for (let i = 1; i <= SEGMENTS; i++) {
      if (dragged && i === SEGMENTS) continue;
      const p = rope[i];
      const vx = (p.pos.x - p.prev.x) * damp;
      const vy = (p.pos.y - p.prev.y) * damp;
      const vz = (p.pos.z - p.prev.z) * damp;
      p.prev.copy(p.pos);
      p.pos.x += vx;
      p.pos.y += vy + gravity * dt2;
      p.pos.z += vz;
    }

    for (let k = 0; k < ITERATIONS; k++) {
      for (let i = 0; i < SEGMENTS; i++) {
        const a = rope[i];
        const b = rope[i + 1];
        const aFree = i !== 0;
        const bFree = !(dragged && i + 1 === SEGMENTS);
        const weight = (aFree ? 1 : 0) + (bFree ? 1 : 0);
        if (weight === 0) continue;

        const dx = b.pos.x - a.pos.x;
        const dy = b.pos.y - a.pos.y;
        const dz = b.pos.z - a.pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist === 0) continue;

        const scale = (dist - REST_LENGTH) / dist / weight;
        if (aFree) {
          a.pos.x += dx * scale;
          a.pos.y += dy * scale;
          a.pos.z += dz * scale;
        }
        if (bFree) {
          b.pos.x -= dx * scale;
          b.pos.y -= dy * scale;
          b.pos.z -= dz * scale;
        }
      }
    }

    up.copy(rope[SEGMENTS - 1].pos).sub(tip.pos);
    if (up.lengthSq() < 1e-8) up.copy(UP);
    up.normalize();

    const s = spin.current;
    s.velocity += (-s.yaw * SPIN_STIFFNESS - s.velocity * SPIN_DAMPING) * dt;
    s.yaw += s.velocity * dt;

    body.current.position.copy(tip.pos).addScaledVector(up, -CARD_DROP);
    align.setFromUnitVectors(UP, up);
    yaw.setFromAxisAngle(up, s.yaw);
    body.current.quaternion.copy(yaw.multiply(align));

    curve.points[0].copy(tip.pos);
    curve.points[1].copy(rope[SEGMENTS - 1].pos);
    curve.points[2].copy(rope[SEGMENTS - 2].pos);
    curve.points[3].copy(rope[0].pos);
    band.current.geometry.setPoints(curve.getPoints(32));
  });

  return (
    <>
      <group ref={body} position={[0.6, -0.5, 0]}>
        <group
          scale={2.25}
          position={[0, -1.2, -0.05]}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}
          onPointerUp={(e) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
          onPointerDown={(e) => {
            e.target.setPointerCapture(e.pointerId);
            dragOffset.current.copy(e.point).sub(body.current.position);
            lastPointerX.current = null;
            drag(true);
          }}>
          <mesh geometry={nodes.card.geometry}>
            <meshPhysicalMaterial map={materials.base.map} map-anisotropy={16} clearcoat={1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
          </mesh>
          <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
          <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
        </group>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
