import { Seal } from "../ui";

export function Footer() {
  return (
    <footer className="relative mx-auto max-w-[44rem] px-[22px] pt-10 pb-16 text-center min-[720px]:px-10">
      <Seal className="mb-[22px] w-[66px] rotate-[-3deg] text-[1rem]">終</Seal>
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
