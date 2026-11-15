import { describe, expect, it } from 'vitest';
import { sampleIllustrativeTrajectory } from '../illustrativeTrajectoryAdapter';

describe('sampleIllustrativeTrajectory', () => {
  it('samples a scene position and tangent direction at the requested progress', () => {
    const sample = sampleIllustrativeTrajectory('LEO', 0.25);

    expect(sample.position.x).toBeCloseTo(0);
    expect(sample.position.y).toBe(0);
    expect(sample.position.z).toBeCloseTo(2.65);
    expect(sample.direction.x).toBeCloseTo(-1);
    expect(sample.direction.y).toBe(0);
    expect(sample.direction.z).toBeCloseTo(0);
  });

  it('clamps progress to the illustrative orbit bounds', () => {
    const start = sampleIllustrativeTrajectory('LEO', -1);
    const end = sampleIllustrativeTrajectory('LEO', 2);

    expect(start.position.x).toBeCloseTo(2.65);
    expect(end.position.x).toBeCloseTo(2.65);
  });
});
