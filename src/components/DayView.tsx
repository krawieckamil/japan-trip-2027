import type { Day } from "../data/trip";

import { zl } from "../lib/format";

export function DayView({ day, mult }: { day: Day; mult: number }) {
  const items = day.items.filter((it) => it.kind !== "O mieście");

  return (
    <div className="day">
      <div className="flex items-baseline gap-[12px] px-[2px] pt-[22px] pb-[6px]">
        <span className="flex-none font-jp text-[1.1rem] font-semibold">{day.date}</span>
        <span className="flex-1 font-jp text-[0.75rem] tracking-[0.1em] text-ink-3 uppercase">
          {day.wd}
        </span>
      </div>
      <div className="px-[2px] pt-[8px] pb-[20px]">
        {items.map((it, i) => {
          const q = encodeURIComponent(`${it.title} Japonia`);
          return (
            <div className="it relative grid grid-cols-[3.4rem_1fr] gap-x-[26px] pb-[30px]" key={i}>
              <span className="col-start-1 pt-[3px] text-right text-[0.82rem] leading-[1.25] font-extrabold text-[var(--tint)] tabular-nums">
                {it.time}
              </span>
              <div className="col-start-2 min-w-0">
                <span className="block font-jp text-[0.825rem] font-medium text-[var(--tint)]">
                  {it.kind}
                </span>
                <h4 className="mt-[3px] text-[1.14rem] font-[750] tracking-[-0.01em]">
                  {it.url ? (
                    <a
                      href={it.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border-b-2 border-b-[var(--tint)] no-underline"
                    >
                      {it.title}
                    </a>
                  ) : (
                    it.title
                  )}
                </h4>
                <p className="mt-2 text-[0.94rem] leading-[1.58] text-ink-2">{it.desc}</p>
                {it.tip && (
                  <p className="tip mt-[10px] text-[0.82rem] leading-[1.5] text-ink-3">{it.tip}</p>
                )}
                <div className="mt-[13px] flex flex-wrap items-center gap-[10px]">
                  {it.price === 0 && (
                    <span className="price inline-block rounded-full bg-transparent px-[13px] py-[4px] text-[0.8rem] font-semibold text-ink-3 tabular-nums">
                      wstęp wolny
                    </span>
                  )}
                  {!!it.price && (
                    <span className="price inline-block rounded-full bg-paper-2 px-[13px] py-[4px] text-[0.8rem] font-bold tabular-nums">
                      {zl(it.price * mult)} zł{mult === 1 ? "/os." : ""}
                    </span>
                  )}
                  <a
                    className="it-ph inline-flex items-center gap-[5px] rounded-full bg-transparent px-[13px] py-[4px] text-[0.74rem] font-semibold whitespace-nowrap text-ink-3 no-underline"
                    href={`https://www.google.com/search?tbm=isch&q=${q}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    zdjęcia&nbsp;↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
