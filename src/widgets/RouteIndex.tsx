import type { Trip } from "../data/trip";

import { cssVar, nightsLabel } from "../lib/format";

export function RouteIndex({ trip }: { trip: Trip }) {
  return (
    <section
      className="mx-auto max-w-[44rem] px-[22px] pt-[68px] min-[720px]:px-10 min-[720px]:pt-24"
      id="trasa"
    >
      <div className="sec-head mb-[26px]">
        <span className="label inline-block font-jp text-base font-medium tracking-[0.05em]">
          Trasa
        </span>
        <h2 className="mt-2 text-[clamp(2rem,8vw,3rem)]">Pięć miast, czternaście nocy</h2>
        <p className="mt-3 mb-0 max-w-[32rem] text-[0.94rem] text-ink-2">
          Pięć przystanków, każdy odbity w swoim kolorze — jak plansze jednej serii drzeworytów.
          Dotknij, żeby przeskoczyć do miasta.
        </p>
      </div>
      <ol className="index m-0 list-none pt-1.5">
        {trip.stints.map((s, i) => {
          const c = trip.cities[s.city];
          const no = String(i + 1).padStart(2, "0");
          return (
            <li className="idx" style={{ "--tint": cssVar(c.v) } as React.CSSProperties} key={i}>
              <a
                href={`#ch-${i}`}
                className="grid grid-cols-[3ch_2.4rem_auto_minmax(14px,1fr)_auto] items-center gap-4 px-1 py-4 no-underline"
              >
                <span className="font-jp text-[1rem] text-ink-3 tabular-nums">{no}</span>
                <span className="font-jp text-[1.7rem] leading-none text-[var(--tint)]">
                  {c.jp}
                </span>
                <span className="idx-main">
                  <span className="block text-[1.06rem] font-bold tracking-[-0.01em] whitespace-nowrap">
                    {c.name}
                  </span>
                  <span className="mt-0.5 block text-[0.8rem] text-ink-3 tabular-nums">
                    {s.dates}
                  </span>
                </span>
                <span
                  className="h-0 self-center border-b border-dotted border-b-hair"
                  aria-hidden="true"
                ></span>
                <span className="text-[0.8rem] whitespace-nowrap text-ink-3 tabular-nums">
                  {nightsLabel(s.nights)}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
