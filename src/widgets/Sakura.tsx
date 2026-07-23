import type { CSSProperties } from "react";

/* deterministyczne parametry płatków (bez Math.random — StrictMode/React Compiler nie przetasuje) */
const PETALS = [
  { left: 4, delay: 0, dur: 12, drift: 40, s: 0.9, o: 0.7 },
  { left: 13, delay: 5, dur: 15, drift: -30, s: 0.6, o: 0.5 },
  { left: 21, delay: 2, dur: 10, drift: 26, s: 1.1, o: 0.75 },
  { left: 29, delay: 8, dur: 17, drift: 48, s: 0.7, o: 0.55 },
  { left: 37, delay: 1, dur: 13, drift: -44, s: 0.95, o: 0.68 },
  { left: 45, delay: 6, dur: 11, drift: 18, s: 0.55, o: 0.48 },
  { left: 53, delay: 3, dur: 16, drift: -22, s: 1.05, o: 0.72 },
  { left: 61, delay: 9, dur: 14, drift: 36, s: 0.75, o: 0.58 },
  { left: 69, delay: 4, dur: 12, drift: -38, s: 0.85, o: 0.66 },
  { left: 77, delay: 7, dur: 18, drift: 30, s: 0.65, o: 0.52 },
  { left: 84, delay: 2, dur: 13, drift: -26, s: 1.0, o: 0.7 },
  { left: 91, delay: 10, dur: 15, drift: 42, s: 0.7, o: 0.55 },
  { left: 96, delay: 5, dur: 11, drift: -18, s: 0.9, o: 0.64 },
  { left: 17, delay: 11, dur: 19, drift: 24, s: 0.6, o: 0.5 },
];

export function Sakura() {
  return (
    <div className="sakura" aria-hidden="true">
      {PETALS.map((p, i) => (
        <i
          key={i}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              opacity: p.o,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              "--drift": `${p.drift}px`,
              "--s": p.s,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
