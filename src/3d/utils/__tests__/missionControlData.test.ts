import { describe, expect, it } from 'vitest';
import { getMissionPhaseSegments } from '../missionPhaseDisplay';
import { getPlaybackFrameInterval } from '../missionPlayback';

describe('mission phase timeline data', () => {
  it('creates clickable segments from phase transitions in telemetry order', () => {
    const segments = getMissionPhaseSegments([
      { phase: 'launch' },
      { phase: 'launch' },
      { phase: 'transfer' },
      { phase: 'arrival' },
      { phase: 'transfer' },
    ]);

    expect(segments).toEqual([
      { phase: 'launch', startIndex: 0, endIndex: 1 },
      { phase: 'transfer', startIndex: 2, endIndex: 2 },
      { phase: 'arrival', startIndex: 3, endIndex: 3 },
      { phase: 'transfer', startIndex: 4, endIndex: 4 },
    ]);
  });
});

describe('mission playback speed', () => {
  it('shortens the telemetry frame interval at faster playback rates', () => {
    const halfSpeed = getPlaybackFrameInterval(0.5);
    const normalSpeed = getPlaybackFrameInterval(1);
    const doubleSpeed = getPlaybackFrameInterval(2);

    expect(halfSpeed).toBe(normalSpeed * 2);
    expect(doubleSpeed).toBe(normalSpeed / 2);
  });
});
