/**
 * Procedural planet texture generation using canvas + FBM noise.
 * Used as the primary texture for Mars and as fallback when texture files
 * fail to load for Earth and Moon.
 *
 * All textures are generated synchronously (suitable for useMemo).
 */
import * as THREE from 'three';

// ─── Noise Primitives ─────────────────────────────────────────────────────────

function hash(n: number): number {
  const x = Math.sin(n) * 43758.5453123;
  return x - Math.floor(x);
}

function noise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  const a = hash(ix       + iy       * 157.0);
  const b = hash(ix + 1.0 + iy       * 157.0);
  const c = hash(ix       + (iy + 1.0) * 157.0);
  const d = hash(ix + 1.0 + (iy + 1.0) * 157.0);
  return a + (b - a) * ux + (c - a) * uy + (d - c) * ux * uy + (a - b - c + d) * ux * uy;
}

/** Fractional Brownian Motion — layered noise for natural terrain shapes. */
function fbm(x: number, y: number, octaves = 7): number {
  let v = 0.0;
  let a = 0.5;
  let f = 1.0;
  for (let i = 0; i < octaves; i++) {
    v += a * noise(x * f, y * f);
    a *= 0.5;
    f *= 2.07;
  }
  return v; // approx 0–1
}

// ─── Earth ────────────────────────────────────────────────────────────────────

export function generateEarthTexture(resolution = 512): THREE.CanvasTexture {
  const W = resolution;
  const H = resolution / 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const u = px / W;         // 0–1
      const v = py / H;         // 0–1
      // Remap to noise input range
      const nx = u * 4.0;       // base frequency × 2 ≈ continental scale
      const ny = v * 4.0;

      const h = fbm(nx, ny, 7); // 0–1

      // Latitude for polar ice
      const lat = (v - 0.5) * Math.PI; // -π/2 … π/2
      const polar = Math.max(0.0, (Math.abs(lat) / (Math.PI * 0.5) - 0.78) * 5.0);
      const height = Math.min(1.0, h + polar * 0.4);

      let r: number, g: number, b: number;

      if (polar > 0.6) {
        // Polar ice cap
        r = 215; g = 230; b = 255;
      } else if (height < 0.40) {
        // Deep ocean — dark navy → medium blue
        const d = height / 0.40;
        r = Math.round(8  + d * 20);
        g = Math.round(28 + d * 65);
        b = Math.round(80 + d * 85);
      } else if (height < 0.47) {
        // Shallow coastal water
        const d = (height - 0.40) / 0.07;
        r = Math.round(28 + d * 10);
        g = Math.round(93 + d * 10);
        b = Math.round(165 - d * 20);
      } else if (height < 0.515) {
        // Coastline / beach
        r = 194; g = 178; b = 128;
      } else if (height < 0.65) {
        // Lowland — green
        const f = (height - 0.515) / 0.135;
        r = Math.round(55  + f * 20);
        g = Math.round(130 - f * 15);
        b = Math.round(50  - f * 10);
      } else if (height < 0.80) {
        // Highland — brown/khaki
        const f = (height - 0.65) / 0.15;
        r = Math.round(85  + f * 65);
        g = Math.round(100 - f * 35);
        b = Math.round(50  - f * 15);
      } else {
        // Mountain peaks — grey/white
        const f = Math.min(1.0, (height - 0.80) / 0.12);
        r = Math.round(145 + f * 85);
        g = Math.round(135 + f * 85);
        b = Math.round(125 + f * 90);
      }

      const idx = (py * W + px) * 4;
      data[idx]     = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ─── Moon ─────────────────────────────────────────────────────────────────────

export function generateMoonTexture(resolution = 512): THREE.CanvasTexture {
  const W = resolution;
  const H = resolution / 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const nx = (px / W) * 6.0;
      const ny = (py / H) * 6.0;
      const h = fbm(nx, ny, 6);

      // Mare (dark regions) — large low-noise patches
      const mx = (px / W) * 2.5;
      const my = (py / H) * 2.5;
      const mare = Math.max(0.0, 0.52 - fbm(mx + 1.3, my + 0.7, 4)) * 1.6;

      const brightness = Math.max(0.25, Math.min(0.90, h * 0.5 + 0.4 - mare * 0.25));

      const r = Math.round(brightness * 165);
      const g = Math.round(brightness * 160);
      const b = Math.round(brightness * 155);

      const idx = (py * W + px) * 4;
      data[idx]     = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // ── Craters painted on top ──────────────────────────────────────────────────
  const craterDefs: Array<{ x: number; y: number; r: number; depth: number }> = [];
  // Seed deterministic craters
  let seed = 42;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 4294967296; };

  for (let i = 0; i < 60; i++) {
    craterDefs.push({ x: rnd() * W, y: rnd() * H, r: rnd() * 18 + 3, depth: rnd() * 0.5 + 0.3 });
  }
  for (let i = 0; i < 120; i++) {
    craterDefs.push({ x: rnd() * W, y: rnd() * H, r: rnd() * 6 + 1, depth: rnd() * 0.4 + 0.2 });
  }

  for (const c of craterDefs) {
    // Rim highlight
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(200,195,190,${c.depth * 0.45})`;
    ctx.lineWidth = c.r * 0.3;
    ctx.stroke();

    // Floor shadow
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(50,48,46,${c.depth * 0.42})`;
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ─── Mars ─────────────────────────────────────────────────────────────────────

export function generateMarsTexture(resolution = 512): THREE.CanvasTexture {
  const W = resolution;
  const H = resolution / 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(W, H);
  const data = imgData.data;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const nx = (px / W) * 4.5;
      const ny = (py / H) * 4.5;
      const h = fbm(nx, ny, 6);

      // Polar caps
      const lat = ((py / H) - 0.5) * Math.PI;
      const polar = Math.max(0.0, (Math.abs(lat) / (Math.PI * 0.5) - 0.82) * 6.0);

      let r: number, g: number, b: number;

      if (polar > 0.6) {
        r = 220; g = 215; b = 212;
      } else {
        const f = Math.max(0.0, Math.min(1.0, h));
        // Reddish-brown palette: dark rust → bright orange-tan
        r = Math.round(140 + f * 80);
        g = Math.round(55  + f * 45);
        b = Math.round(30  + f * 20);
      }

      const idx = (py * W + px) * 4;
      data[idx]     = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Olympus Mons — large shield volcano (lighter patch, upper-left hemisphere)
  const omx = W * 0.22, omy = H * 0.42, omr = W * 0.09;
  const omGrad = ctx.createRadialGradient(omx, omy, 0, omx, omy, omr);
  omGrad.addColorStop(0.0, 'rgba(230,135,80,0.4)');
  omGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle = omGrad;
  ctx.fillRect(0, 0, W, H);

  // Valles Marineris — large canyon (darker horizontal stripe)
  ctx.fillStyle = 'rgba(90,35,18,0.25)';
  ctx.fillRect(W * 0.38, H * 0.44, W * 0.28, H * 0.07);
  // Soften the edges
  const vmGrad = ctx.createLinearGradient(0, H * 0.44, 0, H * 0.51);
  vmGrad.addColorStop(0, 'rgba(90,35,18,0.15)');
  vmGrad.addColorStop(0.5, 'rgba(90,35,18,0)');
  vmGrad.addColorStop(1, 'rgba(90,35,18,0.15)');
  ctx.fillStyle = vmGrad;
  ctx.fillRect(W * 0.38, H * 0.44, W * 0.28, H * 0.07);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ─── Fallback Emissive Night-Lights (Earth only) ──────────────────────────────

export function generateEarthNightTexture(resolution = 256): THREE.CanvasTexture {
  const W = resolution;
  const H = resolution / 2;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  // Black base
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // City clusters — approximate continents
  const clusters = [
    // North America east coast
    { x: 0.19, y: 0.37, spread: 0.07, brightness: 0.9 },
    // Europe
    { x: 0.49, y: 0.33, spread: 0.08, brightness: 1.0 },
    // East Asia
    { x: 0.78, y: 0.37, spread: 0.09, brightness: 1.0 },
    // South/Southeast Asia
    { x: 0.70, y: 0.50, spread: 0.06, brightness: 0.7 },
    // North America west coast
    { x: 0.12, y: 0.38, spread: 0.04, brightness: 0.7 },
    // South America east
    { x: 0.26, y: 0.60, spread: 0.05, brightness: 0.5 },
    // Africa north
    { x: 0.48, y: 0.47, spread: 0.04, brightness: 0.4 },
    // Australia east
    { x: 0.80, y: 0.65, spread: 0.04, brightness: 0.5 },
  ];

  let seed2 = 77;
  const rnd2 = () => { seed2 = (seed2 * 1664525 + 1013904223) & 0xffffffff; return (seed2 >>> 0) / 4294967296; };

  for (const cl of clusters) {
    const count = Math.round(80 * cl.brightness);
    for (let i = 0; i < count; i++) {
      const angle = rnd2() * Math.PI * 2;
      const dist  = rnd2() * cl.spread;
      const lx = (cl.x + Math.cos(angle) * dist) * W;
      const ly = (cl.y + Math.sin(angle) * dist) * H;
      const size = rnd2() * 2.5 + 0.5;
      const alpha = (rnd2() * 0.5 + 0.5) * cl.brightness;
      const warm = rnd2() > 0.5;
      ctx.beginPath();
      ctx.arc(lx, ly, size, 0, Math.PI * 2);
      ctx.fillStyle = warm
        ? `rgba(255,220,120,${alpha})`
        : `rgba(180,210,255,${alpha})`;
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
