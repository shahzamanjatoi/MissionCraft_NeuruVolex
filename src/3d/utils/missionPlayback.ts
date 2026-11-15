import type { PlaybackSpeed } from '../types/scene';

const BASE_FRAME_INTERVAL_MS = 110;

export function getPlaybackFrameInterval(speed: PlaybackSpeed): number {
  return Math.max(16, BASE_FRAME_INTERVAL_MS / speed);
}
