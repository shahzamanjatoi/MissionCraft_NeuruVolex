import { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlanetType } from '../types/scene';
import { SCENE, PLANET_MATERIAL, TEXTURE_PATHS } from '../utils/sceneConstants';
import {
  generateEarthTexture,
  generateMoonTexture,
  generateMarsTexture,
  generateEarthNightTexture,
} from '../utils/proceduralTextures';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanetProps {
  type: PlanetType;
  position?: [number, number, number];
  /** radians / second */
  rotationSpeed?: number;
  onSelect?: () => void;
}

interface LoadedPlanetTextures {
  type: PlanetType;
  day: THREE.Texture | null;
  night: THREE.Texture | null;
  normal: THREE.Texture | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLANET_RADIUS: Record<PlanetType, number> = {
  Earth: SCENE.EARTH_RADIUS,
  Moon:  SCENE.MOON_RADIUS,
  Mars:  SCENE.MARS_RADIUS,
};

/** Try to load a texture URL; resolve to null on error. */
function tryLoadTexture(
  loader: THREE.TextureLoader,
  url: string,
): Promise<THREE.Texture | null> {
  return new Promise((resolve) => {
    loader.load(
      url,
      (tex) => resolve(tex),
      undefined,
      () => resolve(null),
    );
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Planet({
  type,
  position = [0, 0, 0],
  rotationSpeed = 0.0008,
  onSelect,
}: PlanetProps) {
  const meshRef      = useRef<THREE.Mesh>(null);
  const cloudRef     = useRef<THREE.Mesh>(null);

  // ── Procedural fallbacks (generated once) ───────────────────────────────────
  const proceduralDay = useMemo(() => {
    switch (type) {
      case 'Earth': return generateEarthTexture();
      case 'Moon':  return generateMoonTexture();
      case 'Mars':  return generateMarsTexture();
    }
  }, [type]);

  const proceduralNight = useMemo(
    () => (type === 'Earth' ? generateEarthNightTexture() : null),
    [type],
  );

  // ── Texture state (starts procedural, upgrades to real if available) ─────────
  const [loadedTextures, setLoadedTextures] =
    useState<LoadedPlanetTextures | null>(null);
  const activeTextures = loadedTextures?.type === type ? loadedTextures : null;
  const dayTex = activeTextures?.day ?? proceduralDay;
  const nightTex = activeTextures?.night ?? proceduralNight;
  const normalTex = activeTextures?.normal ?? null;

  // ── Async texture loading ─────────────────────────────────────────────────────
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    let texturesToDispose: THREE.Texture[] = [];

    async function load() {
      let day: THREE.Texture | null = null;
      let night: THREE.Texture | null = null;
      let normal: THREE.Texture | null = null;

      if (type === 'Earth') {
        [day, night, normal] = await Promise.all([
          tryLoadTexture(loader, TEXTURE_PATHS.EARTH_DAY),
          tryLoadTexture(loader, TEXTURE_PATHS.EARTH_NIGHT),
          tryLoadTexture(loader, TEXTURE_PATHS.EARTH_NORMAL),
        ]);
      } else if (type === 'Moon') {
        day = await tryLoadTexture(loader, TEXTURE_PATHS.MOON);
      }

      const loaded = [day, night, normal].filter(
        (texture): texture is THREE.Texture => texture !== null,
      );
      if (cancelled) {
        loaded.forEach((texture) => texture.dispose());
        return;
      }

      if (day) day.colorSpace = THREE.SRGBColorSpace;
      if (night) night.colorSpace = THREE.SRGBColorSpace;
      if (normal) normal.colorSpace = THREE.NoColorSpace;
      texturesToDispose = loaded;
      setLoadedTextures({ type, day, night, normal });
    }

    void load();
    return () => {
      cancelled = true;
      texturesToDispose.forEach((texture) => texture.dispose());
    };
  }, [type]);

  // ── Dispose textures on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      proceduralDay.dispose();
      proceduralNight?.dispose();
    };
  }, [proceduralDay, proceduralNight]);

  // ── Rotation animation ────────────────────────────────────────────────────────
  useFrame((_state, delta) => {
    if (meshRef.current)  meshRef.current.rotation.y  += rotationSpeed * delta * 60;
    if (cloudRef.current) cloudRef.current.rotation.y += rotationSpeed * delta * 60 * 1.12;
  });

  const radius = PLANET_RADIUS[type];
  const mat    = PLANET_MATERIAL[type];

  return (
    <group position={position}>
      {/* ── Main planet sphere ──────────────────────────────────────────────── */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.();
        }}
      >
        <sphereGeometry args={[radius, 72, 36]} />
        <meshStandardMaterial
          map={dayTex}
          normalMap={normalTex ?? undefined}
          normalScale={normalTex ? new THREE.Vector2(0.6, 0.6) : undefined}
          emissiveMap={nightTex ?? undefined}
          emissive={nightTex ? new THREE.Color(0xffffff) : undefined}
          emissiveIntensity={nightTex ? 0.5 : 0}
          roughness={mat.roughness}
          metalness={mat.metalness}
        />
      </mesh>

      {/* ── Earth cloud layer ───────────────────────────────────────────────── */}
      {type === 'Earth' && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[radius * 1.008, 72, 36]} />
          <meshStandardMaterial
            color={0xffffff}
            transparent
            opacity={0.22}
            depthWrite={false}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}
    </group>
  );
}
