import { useRef, useEffect, useState } from 'react';
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

const PLANET_LOADING_COLOR: Record<PlanetType, THREE.ColorRepresentation> = {
  Earth: 0x315a78,
  Moon: 0x777777,
  Mars: 0x99503a,
};
const PLANET_NORMAL_SCALE = new THREE.Vector2(0.6, 0.6);
const NIGHT_LIGHT_COLOR = new THREE.Color(0xffffff);

function generateProceduralDay(type: PlanetType): THREE.Texture {
  switch (type) {
    case 'Earth': return generateEarthTexture();
    case 'Moon': return generateMoonTexture();
    case 'Mars': return generateMarsTexture();
  }
}

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
      (error) => {
        console.error(`[3D] Failed to load planet texture: ${url}`, error);
        resolve(null);
      },
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

  // ── Texture state (uses simple color while loading; procedural only on failure) ─
  const [loadedTextures, setLoadedTextures] =
    useState<LoadedPlanetTextures | null>(null);
  const activeTextures = loadedTextures?.type === type ? loadedTextures : null;
  const dayTex = activeTextures?.day ?? null;
  const nightTex = activeTextures?.night ?? null;
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

      day ??= generateProceduralDay(type);
      if (type === 'Earth' && !night) night = generateEarthNightTexture();

      if (day) day.colorSpace = THREE.SRGBColorSpace;
      if (night) night.colorSpace = THREE.SRGBColorSpace;
      if (normal) normal.colorSpace = THREE.NoColorSpace;
      texturesToDispose = [day, night, normal].filter(
        (texture): texture is THREE.Texture => texture !== null,
      );
      setLoadedTextures({ type, day, night, normal });
    }

    void load();
    return () => {
      cancelled = true;
      texturesToDispose.forEach((texture) => texture.dispose());
    };
  }, [type]);

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
          key={dayTex?.uuid ?? `${type}-loading`}
          map={dayTex}
          color={dayTex ? 0xffffff : PLANET_LOADING_COLOR[type]}
          normalMap={normalTex ?? undefined}
          normalScale={normalTex ? PLANET_NORMAL_SCALE : undefined}
          emissiveMap={nightTex ?? undefined}
          emissive={nightTex ? NIGHT_LIGHT_COLOR : undefined}
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
