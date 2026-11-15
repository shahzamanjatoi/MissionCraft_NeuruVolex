import type { CSSProperties, ElementType, ReactNode } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Stagger delay in milliseconds. */
  delay?: number;
}

/** Wraps content so it fades/slides up the first time it scrolls into view. */
export function Reveal({ children, as: Tag = "div", className = "", style, delay = 0 }: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLElement>();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}