import type { Stint, City } from "../data/trip";

import { cssVar, money, nightsLabel, formatCurrency } from "../lib/format";
import { BlockHead } from "../ui";
import { DayView } from "./DayView";

function PlateAbout({
  items,
  cityName,
}: {
  items: { title: string; desc: string }[];
  cityName: string;
}) {
  if (!items.length) return null;
  return (
    <div className="plate-about relative z-[2] col-start-1 row-start-3 mt-1 max-w-[40rem]">
      {items.map((it, i) => (
        <div key={i}>
          {i > 0 && <div className="plate-about-div my-2 h-px" aria-hidden="true"></div>}
          <div className={`plate-about-i${i === 0 ? " lead" : ""} text-[0.82rem] leading-[1.5]`}>
            {it.title && it.title !== cityName && (
              <h3 className="mb-[3px] font-jp text-[0.84rem] font-semibold tracking-[0.02em] opacity-[0.82]">
                {it.title}
              </h3>
            )}
            <p className="m-0">{it.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Setup({ stint, mult }: { stint: Stint; mult: number }) {
  const { legIn: leg, stay: st } = stint;
  return (
    <article className="setup rounded-[6px] bg-paper-2 px-[clamp(20px,5vw,28px)] py-6">
      <div className="setup-leg grid grid-cols-[38px_1fr] items-start gap-[15px]">
        <span
          className="mode grid h-[38px] w-[38px] place-items-center rounded-full bg-[var(--tint)] font-jp text-[1.1rem] text-plate-fg"
          aria-hidden="true"
        >
          {leg.mode}
        </span>
        <span className="setup-leg-b">
          <span className="label text-[var(--tint)]">Dojazd</span>
          <span className="mt-[3px] block font-bold tracking-[-0.01em] text-ink">{leg.what}</span>
          <span className="mt-[2px] block text-[0.88rem] text-ink-2 tabular-nums">
            {leg.when} · {formatCurrency(leg.price * mult)}
          </span>
          <p className="mt-2 text-[0.82rem] leading-[1.5] text-ink-3 whitespace-pre-wrap">{leg.note}</p>
        </span>
      </div>
      <div className="setup-div my-[22px] h-[10px]" aria-hidden="true"></div>
      <div className="stay">
        <span className="label text-[var(--tint)]">Nocleg</span>
        <h3 className="mt-2 text-[1.35rem]">{st.name}</h3>
        <div className="stay-when mt-[5px] text-[0.82rem] text-ink-3 tabular-nums">
          {st.from} → {st.to}
        </div>
        <p className="mt-[13px] text-[0.94rem] leading-[1.6] text-ink-2 whitespace-pre-wrap">{st.description}</p>
        <div className="stay-foot mt-[18px] flex flex-wrap items-center justify-between gap-x-[16px] gap-y-2 pt-[17px]">
          <span className="cost flex items-baseline gap-2 font-extrabold tabular-nums">
            {money(st.price, mult)}
            <span className="per-night text-[0.76rem] font-normal text-ink-3">
              {formatCurrency(Math.round(st.price / stint.nights))} /os./noc
            </span>
          </span>
          <a
            href={st.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b-[1.5px] border-b-[var(--tint)] text-[0.86rem] font-bold text-[var(--tint)] no-underline"
          >
            strona hotelu →
          </a>
          <span className="yen grow basis-full text-[0.74rem] text-ink-3 tabular-nums">
            {st.room} · {st.price}
          </span>
        </div>
      </div>
    </article>
  );
}

export function Chapter({
  stint,
  index,
  city,
  mult,
}: {
  stint: Stint;
  index: number;
  city: City;
  mult: number;
}) {
  const no = String(index + 1).padStart(2, "0");
  const about = stint.days.flatMap((d) => d.items).filter((it) => it.kind === "O mieście");

  return (
    <section
      className="pt-[26px] min-[720px]:pt-14"
      id={`ch-${index}`}
      data-city={stint.city}
      style={{ "--tint": cssVar(city.v) } as React.CSSProperties}
    >
      <header className="plate relative mx-[clamp(2px,3vw,16px)] mt-[6px] mb-0 grid min-h-[44svh] grid-cols-[1fr_auto] grid-rows-[1fr_auto_auto] gap-[10px] overflow-hidden rounded-[3px] px-[clamp(26px,6vw,52px)] py-[clamp(40px,9vw,68px)] text-plate-fg min-[720px]:min-h-[40svh] min-[720px]:px-[clamp(48px,6vw,76px)] min-[720px]:py-[clamp(56px,7vw,84px)]">
        <span className="plate-no relative z-[2] col-start-1 row-start-1 self-start justify-self-start font-jp text-[1rem] tracking-[0.28em] tabular-nums opacity-90">
          {no}
        </span>
        <span className="plate-k relative z-[2] col-start-2 row-start-1 self-start justify-self-end font-jp text-[1.5rem] font-medium tracking-[0.14em] opacity-[0.72]">
          {city.jp}
        </span>
        <span className="plate-cap relative z-[2] col-span-2 row-start-2 self-end">
          <span className="block text-[clamp(1.8rem,8vw,2.8rem)] font-extrabold tracking-[0.01em] uppercase">
            {city.name}
          </span>
          <span className="mt-[6px] block text-[0.9rem] font-semibold tabular-nums opacity-[0.94]">
            {stint.dates} · {nightsLabel(stint.nights)}
          </span>
        </span>
        <PlateAbout items={about} cityName={city.name} />
      </header>

      <div className="mx-auto max-w-[44rem] px-[22px] pt-[34px] min-[720px]:px-10">
        <Setup stint={stint} mult={mult} />

        <section className="pt-11">
          <BlockHead label="Plan dnia" jp="日程" />
          <div className="mt-[20px] flex flex-col">
            {stint.days.map((d, i) => (
              <DayView day={d} mult={mult} key={i} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
