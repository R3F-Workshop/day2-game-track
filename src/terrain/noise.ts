import { lerp } from 'math';
import { fbm } from 'math/noise';

// Integer lattice hash, so the same seed always produces the same landscape.
function hashLattice(x: number, z: number, seed: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(z, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const smoothstep = (t: number) => t * t * (3 - 2 * t);

// Smoothly interpolated value noise in [0, 1].
export function valueNoise2D(x: number, z: number, seed: number) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const tx = smoothstep(x - x0);
  const tz = smoothstep(z - z0);

  const near = lerp(hashLattice(x0, z0, seed), hashLattice(x0 + 1, z0, seed), tx);
  const far = lerp(hashLattice(x0, z0 + 1, seed), hashLattice(x0 + 1, z0 + 1, seed), tx);

  return lerp(near, far, tz);
}

// Fractal sum of noise octaves, normalized back to [0, 1].
export function fbm2D(x: number, z: number, seed: number, octaves = 3, lacunarity = 2, gain = 0.5) {
  // Decorrelate each octave with its own seed.
  let octave = 0;
  return fbm(
    (frequency) => valueNoise2D(x * frequency, z * frequency, seed + octave++ * 1013),
    octaves,
    lacunarity,
    gain
  );
}
