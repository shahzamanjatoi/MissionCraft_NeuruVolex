import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { MissionDesign } from "../types/mission";

export type Quality = "high" | "low";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? <div className="viewer__fail">3D preview is not available on this device.</div> : this.props.children;
  }
}

function CraftModel({ spacecraft: s }: { spacecraft: MissionDesign["spacecraft"] }) {
  const bus = 0.8 + (s.dryMass_kg / 2000) * 0.5;
  const tankH = 0.25 + (s.propellantMass_kg / 8000) * 1.5;
  const panelW = 0.5 + (s.solarArea_m2 / 30) * 2.4;
  const dishR = 0.16 + (s.antennaGain_dBi / 38) * 0.32;
  const batt = 0.15 + (s.batteryWh / 2000) * 0.35;
  const engine = s.isp_s >= 450 ? "#c084fc" : s.isp_s >= 320 ? "#38bdf8" : "#fbbf24";

  return (
    <group rotation={[0, 0.5, 0]}>
      {/* bus */}
      <mesh>
        <boxGeometry args={[bus, bus, bus]} />
        <meshStandardMaterial color="#9fb6cc" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* tank + engine */}
      <mesh position={[0, -(bus / 2 + tankH / 2), 0]}>
        <cylinderGeometry args={[0.32, 0.32, tankH, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -(bus / 2 + tankH + 0.2), 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.4, 20]} />
        <meshStandardMaterial color={engine} emissive={engine} emissiveIntensity={0.6} />
      </mesh>
      {/* solar wings */}
      {[-1, 1].map((sign) => (
        <group key={sign}>
          <mesh position={[sign * (bus / 2 + 0.06), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.12, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[sign * (bus / 2 + 0.12 + panelW / 2), 0, 0]}>
            <boxGeometry args={[panelW, 0.04, 0.9]} />
            <meshStandardMaterial color="#1d4ed8" emissive="#0b2a6b" emissiveIntensity={0.7} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* antenna */}
      <mesh position={[0, bus / 2 + 0.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, bus / 2 + 0.42, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[dishR, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e2e8f0" side={2} metalness={0.4} roughness={0.35} />
      </mesh>
      {/* instruments */}
      {s.instruments.slice(0, 6).map((ins, i) => (
        <mesh key={ins.name} position={[(i % 3 - 1) * 0.28, i < 3 ? 0.2 : -0.2, bus / 2 + 0.08]}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshStandardMaterial color="#f1f5f9" emissive="#38bdf8" emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* battery pack */}
      <mesh position={[0, 0, -(bus / 2 + 0.1)]}>
        <boxGeometry args={[batt, batt, 0.2]} />
        <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

export function SpacecraftPreview({ design, quality }: { design: MissionDesign; quality: Quality }) {
  return (
    <Boundary>
      <Canvas
        dpr={quality === "low" ? 1 : [1, 2]}
        camera={{ position: [3.4, 2.1, 3.8], fov: 38 }}
        gl={{ alpha: true, antialias: quality !== "low" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 5, 3]} intensity={2.4} />
        <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#38bdf8" />
        <CraftModel spacecraft={design.spacecraft} />
        <gridHelper args={[8, 16, "#164e63", "#0e2a3a"]} position={[0, -2.2, 0]} />
        <OrbitControls enablePan={false} autoRotate autoRotateSpeed={1.2} minDistance={2.6} maxDistance={8} />
      </Canvas>
    </Boundary>
  );
}

export function LaunchPad3D({ tier, quality }: { tier: 0 | 1 | 2; quality: Quality }) {
  const h = 1.7 + tier * 0.6;
  const base = -1.075;
  return (
    <Boundary>
      <Canvas
        dpr={quality === "low" ? 1 : [1, 2]}
        camera={{ position: [3.8, 1.2, 4.4], fov: 42 }}
        gl={{ alpha: true, antialias: quality !== "low" }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 3]} intensity={2.2} />
        <directionalLight position={[-5, 2, -4]} intensity={0.7} color="#fb923c" />
        {/* pad */}
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[3, 3.3, 0.25, 48]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        <mesh position={[0, -1.06, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.04, 40]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* tower */}
        <mesh position={[1.1, base + 1.6, 0]}>
          <boxGeometry args={[0.18, 3.2, 0.18]} />
          <meshStandardMaterial color="#ef4444" roughness={0.6} />
        </mesh>
        {[0.6, 1.4, 2.2].map((y) => (
          <mesh key={y} position={[0.78, base + y, 0]}>
            <boxGeometry args={[0.65, 0.05, 0.05]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        ))}
        {/* rocket */}
        <mesh position={[0, base + h / 2, 0]}>
          <cylinderGeometry args={[0.26, 0.26, h, 28]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, base + h + 0.25, 0]}>
          <coneGeometry args={[0.26, 0.5, 28]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, base + h * 0.35, 0]}>
          <cylinderGeometry args={[0.265, 0.265, 0.2, 28]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
        </mesh>
        {tier >= 1 &&
          [-1, 1].map((sign) => (
            <group key={sign}>
              <mesh position={[sign * 0.4, base + (h * 0.6) / 2, 0]}>
                <cylinderGeometry args={[0.12, 0.12, h * 0.6, 20]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.45} />
              </mesh>
              <mesh position={[sign * 0.4, base + h * 0.6 + 0.14, 0]}>
                <coneGeometry args={[0.12, 0.28, 20]} />
                <meshStandardMaterial color="#94a3b8" />
              </mesh>
            </group>
          ))}
        <OrbitControls
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
          target={[0, 0.1, 0]}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={3.5}
          maxDistance={9}
        />
      </Canvas>
    </Boundary>
  );
}
