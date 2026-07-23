import type { Trip } from "../data/trip";

import { nightsLabel } from "../lib/format";
import { Section, SectionHead } from "../ui";

export function RouteIndex({ trip }: { trip: Trip }) {
  return (
    <Section id="trasa">
      <SectionHead label="Trasa" title="Pięć miast, czternaście nocy">
        Pięć przystanków, każdy odbity w swoim kolorze — jak plansze jednej serii drzeworytów.
        Dotknij, żeby przeskoczyć do miasta.
      </SectionHead>
      <ol className="brush-b-top m-0 list-none pt-1.5">
        {trip.stints.map((s, i) => {
          const c = trip.cities[s.city];
          const no = String(i + 1).padStart(2, "0");
          return (
            <li className="idx" data-accent={s.city} key={i}>
              <a
                href={`#ch-${i}`}
                className="grid grid-cols-[3ch_2.4rem_auto_minmax(14px,1fr)_auto] items-center gap-4 px-1 py-4 no-underline"
              >
                <span className="font-jp text-[1rem] text-ink-3 tabular-nums">{no}</span>
                <span className="font-jp text-[1.7rem] leading-none text-accent">
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
    </Section>
  );
}
