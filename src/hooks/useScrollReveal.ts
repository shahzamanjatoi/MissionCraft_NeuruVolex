import { useEffect, useRef, useState } from "react";

interface RevealOptions {
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
  /** Shrinks/grows the viewport box used for intersection tests. */
  rootMargin?: string;
  /** If false, the element hides again after it leaves the viewport. */
  once?: boolean;
}

function revealImmediately() {
  return (
    typeof IntersectionObserver === "undefined" ||
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tracks whether an element has scrolled into view.
 * Falls back to "visible" when IntersectionObserver is unavailable
 * or the user prefers reduced motion, so content is never stuck hidden.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -8% 0px",
  once = true,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [skipObserver] = useState(revealImmediately);
  const [observed, setObserved] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || skipObserver) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setObserved(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setObserved(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once, skipObserver]);

  return { ref, visible: skipObserver || observed };
}