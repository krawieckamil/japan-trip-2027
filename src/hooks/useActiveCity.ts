import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { City } from "../data/trip";

import { cssVar } from "../lib/format";

/* który rozdział jest teraz — steruje kolorem --now i etykietą w nawigacji */
export function useActiveCity(cities: Record<string, City>) {
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const activeCityRef = useRef<string | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const root = document.documentElement;

    const applyCity = (key: string | null) => {
      activeCityRef.current = key;
      root.style.setProperty("--now", key ? cssVar(cities[key].v) : "var(--color-seal)");
      setActiveCity(key);
    };

    const update = () => {
      const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-city]"));
      const mid = window.innerHeight * 0.42;
      let found: HTMLElement | null = null;
      for (const ch of chapters) {
        const r = ch.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) {
          found = ch;
          break;
        }
        if (r.top > mid) break;
        found = ch;
      }
      const key =
        found && window.scrollY > window.innerHeight * 0.5 ? (found.dataset.city ?? null) : null;
      if (key === activeCityRef.current) return;

      const run = () => applyCity(key);
      if (!reduceMotion && document.startViewTransition) {
        document.startViewTransition(() => flushSync(run));
      } else {
        run();
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => window.removeEventListener("scroll", onScroll);
  }, [cities]);

  return activeCity;
}
