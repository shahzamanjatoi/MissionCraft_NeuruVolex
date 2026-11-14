import type { Target } from "./targets";

/** Levels unlock in this order: finish one to open the next. */
export const LEVEL_ORDER: Target[] = ["LEO", "GEO", "Moon", "Mars"];

export function previousLevel(target: Target): Target | null {
  const i = LEVEL_ORDER.indexOf(target);
  return i > 0 ? LEVEL_ORDER[i - 1] : null;
}

export function nextLevel(target: Target): Target | null {
  const i = LEVEL_ORDER.indexOf(target);
  return i >= 0 && i < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[i + 1] : null;
}

/** The first level is always open. Others open once the previous level is completed. */
export function isTargetUnlocked(completed: Target[], target: Target): boolean {
  const prev = previousLevel(target);
  return prev === null || completed.includes(prev);
}
