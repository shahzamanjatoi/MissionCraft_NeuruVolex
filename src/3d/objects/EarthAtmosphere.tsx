import * as THREE from 'three';
import { ATMOSPHERE, SCENE } from '../utils/sceneConstants';

interface EarthAtmosphereProps {
  position?: [number, number, number];
}

/**
 * Layered atmospheric glow around Earth.
 *
 * Layer 1 (BackSide): Renders the inside surface of a slightly-larger sphere.
 * When viewed at the planet limb, this creates a rim-glow / Fresnel effect.
 *
 * Layer 2 (FrontSide): Thin translucent outer volume that adds haze depth
 * and makes the planet look like it has a real atmosphere.
 *
 * Both layers use AdditiveBlending so the light adds rather than covers.
 */
export function EarthAtmosphere({ position = [0, 0, 0] }: EarthAtmosphereProps) {
  const r = SCENE.EARTH_RADIUS;

  return (
    <group position={position}>
      {/* Rim glow — back-face inner sphere */}
      <mesh>
        <sphereGeometry args={[r * ATMOSPHERE.INNER_SCALE, 64, 32]} />
        <meshPhongMaterial
          color={ATMOSPHERE.COLOR_HEX}
          side={THREE.BackSide}
          transparent
          opacity={ATMOSPHERE.INNER_OPACITY}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer haze — front-face slightly-larger sphere */}
      <mesh>
        <sphereGeometry args={[r * ATMOSPHERE.OUTER_SCALE, 64, 32]} />
        <meshPhongMaterial
          color={ATMOSPHERE.COLOR_HEX}
          side={THREE.FrontSide}
          transparent
          opacity={ATMOSPHERE.OUTER_OPACITY}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
