import type { Trip } from "../data/trip";

import { cssVar, zl } from "../lib/format";
import { Chapter } from "./Chapter";

export function Journey({ trip, mult }: { trip: Trip; mult: number }) {
  const leg = trip.legOut;
  const tokyo = cssVar(trip.cities.tokyo.v);

  return (
    <>
      {trip.stints.map((s, i) => (
        <Chapter stint={s} index={i} city={trip.cities[s.city]} mult={mult} key={i} />
      ))}

      <section className="mx-auto max-w-[44rem] px-[22px] pt-[68px] min-[720px]:px-10 min-[720px]:pt-24">
        <div className="block-head mb-1 flex items-baseline gap-[14px] pb-[12px]">
          <span className="label inline-block font-jp text-base font-medium tracking-[0.05em]">
            Powrót
          </span>
          <span
            className="ml-auto font-jp text-[1.35rem] leading-none text-[var(--tint)]"
            style={{ "--tint": "var(--seal)" } as React.CSSProperties}
          >
            帰
          </span>
        </div>
        <div
          className="grid grid-cols-[30px_1fr] items-start gap-[14px] pt-[6px] pb-[30px]"
          style={{ "--from": tokyo, "--to": tokyo } as React.CSSProperties}
        >
          <span className="leg-rail flex flex-col items-center gap-[7px] pt-[4px]">
            <i></i>
            <span className="font-jp text-[0.9rem] text-ink-3">{leg.mode}</span>
            <i></i>
          </span>
          <span className="text-[0.88rem] text-ink-2">
            <span className="block font-bold tracking-[-0.01em] text-ink">{leg.what}</span>
            <span className="tabular-nums">
              {leg.when} · {zl(leg.price * mult)} zł
            </span>
            <p className="mt-[6px] text-[0.82rem] leading-[1.5] text-ink-3">{leg.note}</p>
          </span>
        </div>
      </section>
    </>
  );
}
