import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPACECRAFT_SCALE } from '../utils/sceneConstants';
import { getSpacecraftPosition, getSpacecraftRotation } from '../utils/orbitPath';
import type { SceneTarget } from '../types/scene';

// ─── Component ────────────────────────────────────────────────────────────────

interface SpacecraftProps {
  target: SceneTarget;
  progress: number;
  isThrusting?: boolean;
  onSelect?: () => void;
}

export function Spacecraft({
  target,
  progress,
  isThrusting = false,
  onSelect,
}: SpacecraftProps) {
  const groupRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Mesh>(null);
  const orbitAngleRef = useRef(0);

  const resources = useMemo(() => ({
    materials: {
      hull: new THREE.MeshStandardMaterial({
        color: 0xc8d0d8,
        roughness: 0.35,
        metalness: 0.75,
      }),
      panel: new THREE.MeshStandardMaterial({
        color: 0x0d2b55,
        roughness: 0.3,
        metalness: 0.4,
        emissive: new THREE.Color(0x081840),
        emissiveIntensity: 0.4,
      }),
      antenna: new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.5,
        metalness: 0.85,
      }),
      thruster: new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.6,
        metalness: 0.9,
      }),
      thrusterGlow: new THREE.MeshStandardMaterial({
        color: 0xff6600,
        emissive: new THREE.Color(0xff4400),
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.85,
      }),
    },
    geometries: {
      body: new THREE.BoxGeometry(2.0, 0.9, 1.0),
      panelLeft: new THREE.BoxGeometry(1.8, 0.04, 1.4),
      panelRight: new THREE.BoxGeometry(1.8, 0.04, 1.4),
      tank: new THREE.CylinderGeometry(0.32, 0.32, 1.4, 16),
      dish: new THREE.ConeGeometry(0.44, 0.28, 24, 1, true),
      nozzle: new THREE.CylinderGeometry(0.22, 0.30, 0.55, 12),
      exhaust: new THREE.ConeGeometry(0.18, 0.5, 8),
    },
  }), []);

  useEffect(() => () => {
    Object.values(resources.geometries).forEach((geometry) => geometry.dispose());
    Object.values(resources.materials).forEach((material) => material.dispose());
  }, [resources]);

  // Exhaust pulse targets
  const pulseRef = useRef({ t: 0 });

  // ── Advance orbit angle + reposition every frame ──────────────────────────
  useFrame((_state, delta) => {
    const targetAngle = progress * Math.PI * 2;
    orbitAngleRef.current = THREE.MathUtils.damp(
      orbitAngleRef.current,
      targetAngle,
      4,
      delta,
    );
    const angle = orbitAngleRef.current;

    if (groupRef.current) {
      const pos = getSpacecraftPosition(target, angle);
      groupRef.current.position.copy(pos);
      groupRef.current.rotation.y = getSpacecraftRotation(angle);
    }

    // Thruster exhaust pulse
    if (isThrusting && exhaustRef.current) {
      pulseRef.current.t += delta * 8;
      const scale = 1.0 + Math.sin(pulseRef.current.t) * 0.25;
      exhaustRef.current.scale.set(scale, scale, scale);
    }
  });

  // Initial position for first frame
  const initialPos = useMemo(
    () => getSpacecraftPosition(target, 0),
    [target],
  );

  return (
    <group
      ref={groupRef}
      position={initialPos}
      scale={SPACECRAFT_SCALE}
      dispose={null}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
    >
      {/* ── Hull body ───────────────────────────────────────────────────────── */}
      <mesh geometry={resources.geometries.body} material={resources.materials.hull} castShadow />

      {/* ── Solar panels ───────────────────────────────────────────────────── */}
      <mesh
        geometry={resources.geometries.panelLeft}
        material={resources.materials.panel}
        position={[-1.9, 0, 0]}
        castShadow
      />
      <mesh
        geometry={resources.geometries.panelRight}
        material={resources.materials.panel}
        position={[1.9, 0, 0]}
        castShadow
      />

      {/* ── Propellant tank (central cylinder) ─────────────────────────────── */}
      <mesh
        geometry={resources.geometries.tank}
        material={resources.materials.hull}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />

      {/* ── High-gain antenna dish ──────────────────────────────────────────── */}
      <mesh
        geometry={resources.geometries.dish}
        material={resources.materials.antenna}
        position={[0, 0.75, 0]}
        rotation={[Math.PI, 0, 0]}
        castShadow
      />

      {/* ── Main thruster nozzle ────────────────────────────────────────────── */}
      <mesh
        geometry={resources.geometries.nozzle}
        material={resources.materials.thruster}
        position={[0, 0, 0.9]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />

      {/* ── Thruster exhaust (shown when thrusting) ─────────────────────────── */}
      <mesh
        ref={exhaustRef}
        geometry={resources.geometries.exhaust}
        material={resources.materials.thrusterGlow}
        position={[0, 0, 1.4]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={isThrusting}
      />
    </group>
  );
}
