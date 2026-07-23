import type { Trip } from "../data/trip";

import { groupTotals, grandTotal } from "../lib/costs";
import { zl } from "../lib/format";

export function CostBreakdown({ trip }: { trip: Trip }) {
  const totals = groupTotals(trip);
  const total = grandTotal(trip);

  return (
    <section
      className="mx-auto max-w-[44rem] px-[22px] pt-[68px] min-[720px]:px-10 min-[720px]:pt-24"
      id="rozbicie"
    >
      <div className="sec-head mb-[26px]">
        <span className="label inline-block font-jp text-base font-medium tracking-[0.05em]">
          Rozbicie
        </span>
        <h2 className="mt-2 text-[clamp(2rem,8vw,3rem)]">Pozycja po pozycji</h2>
        <p className="mt-3 mb-0 max-w-[32rem] text-[0.94rem] text-ink-2">
          Wszystko, co da się dziś wycenić. Druga kwota to koszt całej czwórki.
        </p>
      </div>

      {trip.costGroups.map((g, i) => (
        <div className="mt-[30px]" key={g.label}>
          <div className="cost-h flex items-baseline justify-between gap-[12px] pb-[12px]">
            <span className="text-[1.06rem] font-extrabold">{g.label}</span>
            <span className="font-extrabold tabular-nums">
              {zl(totals[i])} zł
              <s className="ml-[9px] text-[0.875em] font-normal text-ink-3 no-underline">
                {zl(totals[i] * trip.people)} zł
              </s>
            </span>
          </div>
          {g.rows.map((r) => (
            <div
              className="cost-r flex items-baseline justify-between gap-[12px] py-[11px] text-[0.94rem]"
              key={r.name}
            >
              <span className="text-ink-2">{r.name}</span>
              <span className="font-semibold whitespace-nowrap tabular-nums">
                {r.price === 0 ? (
                  "wstęp wolny"
                ) : (
                  <>
                    {zl(r.price)} zł
                    <s className="ml-[9px] text-[0.875em] font-normal text-ink-3 no-underline">
                      {zl(r.price * trip.people)} zł
                    </s>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      ))}

      <div className="grand mt-[34px] flex items-center justify-between gap-2 rounded-[7px] bg-ink p-5 text-ground">
        <span className="max-w-[30%] text-[0.825rem] font-extrabold tracking-[0.02em] text-balance uppercase">
          Razem na osobę
        </span>
        <span className="font-jp text-[1.5rem] font-bold tabular-nums">
          {zl(total)} zł
          <s className="ml-[10px] text-[0.8em] font-normal text-ink-3 no-underline">
            {zl(total * trip.people)} zł
          </s>
        </span>
      </div>

      <div className="excl mt-[30px] rounded-[6px] bg-paper-2 p-6">
        <h3 className="text-[1.06rem]">Czego ta kwota nie obejmuje</h3>
        <ul className="m-0 mt-[14px] flex list-none flex-col gap-[11px] p-0">
          <li className="relative pl-[18px] text-[0.92rem] leading-[1.55] text-ink-2">
            Jedzenia i picia — restauracje w planie są rekomendacjami, nie mają jeszcze wycen.
          </li>
          <li className="relative pl-[18px] text-[0.92rem] leading-[1.55] text-ink-2">
            Lokalnego transportu: metro i autobusy w miastach, JR Kioto–Nara (~¥720/os. w jedną
            stronę), pociąg i prom na Miyajimę (~¥600/os. w obie), dojazd do Itoshimy (~¥400/os. w
            jedną stronę), autobus Beppu–lotnisko Oita.
          </li>
          <li className="relative pl-[18px] text-[0.92rem] leading-[1.55] text-ink-2">
            Zakupów — w Akihabarze warto ustalić limit z góry.
          </li>
          <li className="relative pl-[18px] text-[0.92rem] leading-[1.55] text-ink-2">
            Ubezpieczenia, wejść opcjonalnych (rejs po Dōtonbori, pokazy w Gion) i pieniędzy na
            drobne.
          </li>
        </ul>
      </div>
    </section>
  );
}
