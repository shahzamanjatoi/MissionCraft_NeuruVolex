import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Deep-space background: a large rotating star field with depth variation.
 * Uses @react-three/drei's Stars for the base field, plus a slow rotation
 * group for the "slowly drifting cosmos" feel.
 */
export function StarField() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      // Very slow drift so the scene feels alive but not distracting
      groupRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars
        radius={120}
        depth={80}
        count={6000}
        factor={4.5}
        saturation={0.08}
        fade
        speed={0}
      />
    </group>
  );
}
