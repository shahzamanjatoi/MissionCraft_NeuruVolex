import { useEffect, useRef, useState } from "react";
import { beep, rumble } from "../sfx";
import { RocketIcon } from "./SpecParts";

const SEQ = ["3", "2", "1", "LIFTOFF"];

export function LaunchCountdown({ onDone, onAbort }: { onDone: () => void; onAbort: () => void }) {
  const [i, setI] = useState(0);
  const doneRef = useRef(onDone);
  const abortRef = useRef(onAbort);

  useEffect(() => {
    doneRef.current = onDone;
    abortRef.current = onAbort;
  });

  useEffect(() => {
    const last = i === SEQ.length - 1;
    const t = window.setTimeout(() => {
      if (last) doneRef.current();
      else setI(i + 1);
    }, last ? 1700 : 900);
    return () => window.clearTimeout(t);
  }, [i]);

  useEffect(() => {
    if (i < SEQ.length - 1) beep(520 + i * 140, 0.12, "square", 0.04);
    else {
      beep(1040, 0.3, "square", 0.05);
      rumble(1.7);
    }
  }, [i]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") abortRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = i === SEQ.length - 1;
  return (
    <div className={go ? "sim-countdown is-go" : "sim-countdown"} role="dialog" aria-modal="true" aria-label="Launch countdown">
      <p className="sim-countdown__label mono">{go ? "All systems go" : "T-minus"}</p>
      <div key={i} className="sim-countdown__num">{SEQ[i]}</div>
      <div className="sim-countdown__rocket" aria-hidden="true">
        <RocketIcon tier={2} />
      </div>
      <button type="button" className="sim-countdown__abort" onClick={onAbort}>
        Abort launch (Esc)
      </button>
    </div>
  );
}
