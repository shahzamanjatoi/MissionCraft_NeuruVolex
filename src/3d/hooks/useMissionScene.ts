import { useState, useCallback, useEffect } from 'react';
import type { MissionRunOutput } from '../../simulation/missionRunner';
import type { AnimationFrame } from '../types/scene';
import type { MissionPhase } from '../../types/simulation';

const FRAME_INTERVAL_MS = 110; // ms between telemetry frames during playback

export interface UseMissionSceneReturn {
  animFrame: AnimationFrame;
  isPlaying: boolean;
  frameIndex: number;
  totalFrames: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seekTo: (index: number) => void;
}

export function useMissionScene(
  simulation: MissionRunOutput | null,
): UseMissionSceneReturn {
  const totalFrames = simulation?.telemetry.length ?? 0;

  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);

  // ── Playback interval ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) return;

    const id = setInterval(() => {
      setFrameIndex((prev) => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, FRAME_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isPlaying, totalFrames]);

  // ── Controls ─────────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (frameIndex >= totalFrames - 1) setFrameIndex(0);
    setIsPlaying(true);
  }, [frameIndex, totalFrames]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setFrameIndex(0);
  }, []);

  const seekTo = useCallback((idx: number) => {
    setFrameIndex(Math.max(0, Math.min(idx, totalFrames - 1)));
  }, [totalFrames]);

  // ── Derived animation frame ───────────────────────────────────────────────────
  const currentTelemetry = simulation?.telemetry[frameIndex] ?? null;
  const phase: MissionPhase = currentTelemetry?.phase ?? 'launch';
  const progress = totalFrames > 1 ? frameIndex / (totalFrames - 1) : 0;

  const animFrame: AnimationFrame = {
    frameIndex,
    telemetry: currentTelemetry,
    phase,
    progress,
  };

  return {
    animFrame,
    isPlaying,
    frameIndex,
    totalFrames,
    play,
    pause,
    reset,
    seekTo,
  };
}
