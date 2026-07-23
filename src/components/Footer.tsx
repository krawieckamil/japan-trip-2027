export function Footer() {
  return (
    <footer className="relative mx-auto max-w-[44rem] px-[22px] pt-10 pb-16 text-center min-[720px]:px-10">
      <span
        className="mb-[22px] inline-grid aspect-[3/3.4] w-[66px] rotate-[-3deg] place-items-center rounded-[9%_12%_9%_13%/11%_8%_12%_9%] bg-seal font-jp text-[1rem] text-plate-fg"
        aria-hidden="true"
      >
        終
      </span>
      <span className="mb-[16px] block font-jp text-[1.6rem] font-normal text-ink">また明日</span>
      <p className="mx-auto max-w-[26rem] text-[0.84rem] leading-[1.6] text-ink-3">
        Plan wyjazdu 10–26 maja 2027. Dane pochodzą z Tripsy i są odświeżane przy każdej zmianie —
        ten link zawsze pokazuje aktualną wersję.
      </p>
      <p className="mx-auto mt-[14px] max-w-[26rem] text-[0.84rem] leading-[1.6] text-ink-3">
        Przy każdej pozycji planu link „zdjęcia ↗” otwiera Grafikę Google w nowej karcie.
      </p>
    </footer>
  );
}
