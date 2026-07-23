import { useEffect, useRef } from "react";

import type { Trip } from "../data/trip";

import { grandTotal, groupTotals } from "../lib/costs";
import { formatCurrency } from "../lib/format";
import { Section, SectionHead } from "../ui";

function playBars(container: HTMLElement, reduceMotion: boolean) {
  const fills = Array.from(container.querySelectorAll<HTMLElement>(".bar-fill"));
  fills.forEach((f) => f.getAnimations().forEach((a) => a.cancel()));
  if (reduceMotion) return;
  fills.forEach((f, i) => {
    f.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
      duration: 900,
      delay: i * 110,
      easing: "cubic-bezier(0.3, 1.4, 0.4, 1)",
      fill: "both",
    });
  });
}

export function CostOverview({
  trip,
  mult,
  onMultChange,
}: {
  trip: Trip;
  mult: number;
  onMultChange: (m: number) => void;
}) {
  const barsRef = useRef<HTMLDivElement>(null);
  const isFirstMult = useRef(true);

  const totals = groupTotals(trip);
  const total = grandTotal(trip);
  const money = (per: number) => formatCurrency(per * mult);

  /* paski kosztów odpalają się, gdy same wjeżdżają w widok — nie cały rozdział "koszt" */
  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && playBars(el, reduceMotion)),
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (isFirstMult.current) {
      isFirstMult.current = false;
      return;
    }
    const el = barsRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    playBars(el, reduceMotion);
  }, [mult]);

  return (
    <Section id="koszt">
      <SectionHead label="Koszt" title="Ile to kosztuje" />

      <div
        className="toggle mb-[26px] inline-flex gap-[3px] rounded-full bg-paper-2 p-[3px]"
        role="group"
        aria-label="Sposób pokazywania kwot"
      >
        <button
          type="button"
          className="min-h-10 cursor-pointer appearance-none rounded-full border-0 bg-transparent px-[18px] py-[9px] [font-family:inherit] text-[0.76rem] font-bold tracking-[0.06em] text-ink-2 uppercase aria-pressed:bg-ink aria-pressed:text-ground"
          aria-pressed={mult === 1}
          onClick={() => onMultChange(1)}
        >
          na osobę
        </button>
        <button
          type="button"
          className="min-h-10 cursor-pointer appearance-none rounded-full border-0 bg-transparent px-[18px] py-[9px] [font-family:inherit] text-[0.76rem] font-bold tracking-[0.06em] text-ink-2 uppercase aria-pressed:bg-ink aria-pressed:text-ground"
          aria-pressed={mult !== 1}
          onClick={() => onMultChange(trip.people)}
        >
          za {trip.people} osoby
        </button>
      </div>

      <div className="font-jp text-[clamp(3.4rem,18vw,6rem)] leading-[0.9] tracking-[-0.03em] tabular-nums">
        <span>{money(total)}</span>
      </div>
      <div className="mt-3 text-[0.9rem] text-ink-2 tabular-nums">
        {mult === 1
          ? `na osobę · ${formatCurrency(total * trip.people)} za całą czwórkę`
          : `za czwórkę · ${formatCurrency(total)} na osobę`}
      </div>

      <div className="mt-[34px] flex flex-col gap-[18px]" ref={barsRef}>
        {trip.costGroups.map((g, i) => {
          const t = totals[i];
          const pct = (t / total) * 100;
          return (
            <div
              className="bar-row grid grid-cols-[1fr_auto] items-baseline gap-x-[12px] gap-y-[6px] py-[3px]"
              style={{ "--bar-c": `var(${g.color})` } as React.CSSProperties}
              key={g.label}
            >
              <span className="flex items-center text-[0.94rem] font-semibold">
                <i
                  className="mr-[9px] inline-block h-2 w-2 flex-none rotate-45 bg-[var(--bar-c,var(--ink))]"
                  aria-hidden="true"
                ></i>
                {g.label}
              </span>
              <span className="text-[0.94rem] font-bold text-[var(--bar-c,var(--ink))] tabular-nums">
                {money(t)}
              </span>
              <span className="col-span-full h-[6px] overflow-hidden rounded-[3px] bg-hair">
                <span
                  className="bar-fill block h-full origin-left scale-x-100 rounded-[3px]"
                  style={{ width: `${pct.toFixed(1)}%` }}
                ></span>
              </span>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
