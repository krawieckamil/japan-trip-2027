import { Sakura } from "./Sakura";

export function Hero() {
  return (
    <header className="hero relative mx-auto flex min-h-[96svh] max-w-[44rem] flex-col justify-center px-[22px] py-[12vh] min-[720px]:px-10">
      <div
        className="hero-art pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 overflow-hidden"
        aria-hidden="true"
      >
        <span className="hero-sun absolute top-[3%] right-[9%] aspect-square w-[clamp(110px,24vw,250px)] rounded-full opacity-50"></span>
        <span className="hero-ridge hero-ridge-far"></span>
        <span className="hero-ridge hero-ridge-near"></span>
        <span className="hero-mist"></span>
        <Sakura />
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
      </span>
      <h1 className="hero-h1 mb-[0.5em] pb-[0.32em] font-title text-[clamp(2.2rem,7.6vw,3.4rem)] font-extrabold tracking-[0.06em] uppercase">
        Japonia
      </h1>
      <div className="hero-when mb-[26px] font-jp text-[1.2rem] tracking-[0.04em] text-ink-2">
        10 – 26 maja 2027
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
