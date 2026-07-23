import type { Trip } from "../data/trip";

import { formatCurrency } from "../lib/format";
import { BlockHead, Section } from "../ui";
import { Chapter } from "./Chapter";

export function Journey({ trip, mult }: { trip: Trip; mult: number }) {
  const leg = trip.legOut;

  return (
    <>
      {trip.stints.map((s, i) => (
        <Chapter stint={s} index={i} city={trip.cities[s.city]} mult={mult} key={i} />
      ))}

      <Section>
        <BlockHead label="Powrót" jp="帰" accent="seal" />
        <div className="grid grid-cols-[30px_1fr] items-start gap-[14px] pt-[6px] pb-[30px]">
          <span
            className="leg-rail flex flex-col items-center gap-[7px] pt-[4px]"
            data-accent="tokyo"
          >
            <i></i>
            <span className="font-jp text-[0.9rem] text-ink-3">{leg.mode}</span>
            <i></i>
          </span>
          <span className="text-[0.88rem] text-ink-2">
            <span className="block font-bold tracking-[-0.01em] text-ink">{leg.what}</span>
            <span className="tabular-nums">
              {leg.when} · {formatCurrency(leg.price * mult)}
            </span>
            <p className="mt-[6px] text-[0.82rem] leading-[1.5] text-ink-3">{leg.note}</p>
          </span>
        </div>
      </Section>
    </>
  );
}
