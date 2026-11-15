import { useState, useCallback, useEffect } from 'react';
import type { MissionRunOutput } from '../../simulation/missionRunner';
import type { AnimationFrame, PlaybackSpeed } from '../types/scene';
import type { MissionPhase } from '../../types/simulation';
import { getPlaybackFrameInterval } from '../utils/missionPlayback';

export interface UseMissionSceneReturn {
  animFrame: AnimationFrame;
  isPlaying: boolean;
  frameIndex: number;
  totalFrames: number;
  playbackSpeed: PlaybackSpeed;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seekTo: (index: number) => void;
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;
}

export function useMissionScene(
  simulation: MissionRunOutput | null,
): UseMissionSceneReturn {
  const totalFrames = simulation?.telemetry.length ?? 0;

  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);

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
    }, getPlaybackFrameInterval(playbackSpeed));

    return () => clearInterval(id);
  }, [isPlaying, playbackSpeed, totalFrames]);

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
  const missionStartSeconds = simulation?.telemetry[0]?.elapsedSeconds ?? 0;
  const missionEndSeconds =
    simulation?.telemetry[totalFrames - 1]?.elapsedSeconds ?? missionStartSeconds;
  const missionDurationSeconds = missionEndSeconds - missionStartSeconds;
  const progress = currentTelemetry && missionDurationSeconds > 0
    ? (currentTelemetry.elapsedSeconds - missionStartSeconds) / missionDurationSeconds
    : 0;

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
    playbackSpeed,
    play,
    pause,
    reset,
    seekTo,
    setPlaybackSpeed,
  };
}
