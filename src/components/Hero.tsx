const FACTS = [
  { v: "15", l: "dni w Japonii" },
  { v: "6", l: "miast" },
  { v: "14", l: "nocy" },
  { v: "4", l: "osoby" },
];

export function Hero() {
  return (
    <header className="hero relative mx-auto flex min-h-[96svh] max-w-[44rem] flex-col justify-center overflow-hidden px-[22px] py-[12vh] min-[720px]:px-10">
      <div
        className="hero-art pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <span className="hero-sun absolute top-[3%] right-[9%] aspect-square w-[clamp(110px,24vw,250px)] rounded-full bg-seal opacity-50"></span>
        <span className="hero-ridge hero-ridge--far"></span>
        <span className="hero-ridge hero-ridge--near"></span>
        <span className="hero-mist"></span>
      </div>
      <span
        className="hero-colophon absolute top-[46%] right-[clamp(6px,2.4vw,20px)] font-jp text-[0.86rem] tracking-[0.34em] text-ink-3 opacity-80 [writing-mode:vertical-rl]"
        aria-hidden="true"
      >
        皐月の旅路
      </span>
      <span className="hero-mark relative inline-block self-start">
        <span className="hero-jp m-0 mb-[0.1em] ml-[-0.04em] block font-jp text-[clamp(5rem,34vw,12rem)] leading-[0.82] font-medium tracking-[0.03em]">
          日本
        </span>
        <span
          className="seal absolute top-[-0.16em] right-[-0.66em] grid aspect-[3/3.4] w-[clamp(58px,15vw,104px)] rotate-3 place-items-center rounded-[8%_12%_9%_13%/11%_8%_12%_9%] bg-seal text-plate-fg"
          aria-hidden="true"
        >
          <span className="font-jp text-[clamp(1.9rem,6.5vw,3.4rem)] leading-none">旅</span>
        </span>
      </span>
      <h1 className="mb-[0.5em] pb-[0.32em] text-[clamp(2rem,7vw,3.1rem)] font-extrabold tracking-[0.02em] uppercase">
        Japonia
      </h1>
      <div className="hero-when mb-[26px] font-jp text-[1.2rem] tracking-[0.04em] text-ink-2">
        10 – 26 maja 2027
      </div>
      <div className="hero-facts mb-[6px] flex flex-wrap gap-0">
        {FACTS.map((f) => (
          <span
            className="fact border-l border-l-hair px-4 text-[0.82rem] font-semibold text-ink-2"
            key={f.l}
          >
            <b className="font-extrabold text-ink tabular-nums">{f.v}</b> {f.l}
          </span>
        ))}
      </div>
      <p className="hero-note mt-[30px] max-w-[30rem] border-l-[3px] border-l-seal pl-[15px] text-[0.86rem] leading-[1.6] text-ink-2">
        Plan wciąż się układa. Noclegi to wybrane propozycje do rezerwacji, ceny — szacunki po
        kursie <span className="tabular-nums">100&nbsp;JPY = 2,328&nbsp;PLN</span>.
      </p>
      <a
        className="hero-cue absolute bottom-[5vh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-[9px] text-[0.66rem] font-bold tracking-[0.22em] text-ink-3 uppercase no-underline"
        href="#trasa"
        aria-label="Przewiń do trasy"
      >
        <i></i>Trasa
      </a>
    </header>
  );
}
