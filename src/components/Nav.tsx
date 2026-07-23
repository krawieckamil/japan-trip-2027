import { useMemo } from "react";

import type { Trip } from "../data/trip";

import { cssVar } from "../lib/format";

export function Nav({ trip, activeCity }: { trip: Trip; activeCity: string | null }) {
  const firstStint = useMemo(() => {
    const map: Record<string, number> = {};
    trip.stints.forEach((s, i) => {
      if (!(s.city in map)) map[s.city] = i;
    });
    return map;
  }, [trip.stints]);

  const jumpTo = (city: string) => {
    const el = document.getElementById(`ch-${firstStint[city]}`);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  const now = activeCity ? trip.cities[activeCity] : null;

  return (
    <nav
      className="nav sticky top-0 z-20 flex items-center justify-between gap-3.5 px-[22px] py-[11px] min-[720px]:px-10"
      aria-label="Nawigacja po wyjeździe"
    >
      <span className="nav-now flex min-w-0 items-baseline gap-[9px]">
        <span className="font-jp text-[1.15rem] text-[var(--now)]">{now ? now.jp : "日本"}</span>
        <span className="overflow-hidden text-[0.72rem] font-bold tracking-[0.16em] text-ellipsis whitespace-nowrap text-ink-2 uppercase">
          {now ? now.name : "Plan wyjazdu"}
        </span>
      </span>
      <span className="dots flex flex-none gap-[9px]">
        {Object.entries(trip.cities).map(([key, city]) => (
          <button
            key={key}
            type="button"
            aria-label={`Przejdź do: ${city.name}`}
            aria-current={activeCity === key}
            style={{ "--dot": cssVar(city.v) } as React.CSSProperties}
            onClick={() => jumpTo(key)}
          >
            <i></i>
          </button>
        ))}
      </span>
    </nav>
  );
}
