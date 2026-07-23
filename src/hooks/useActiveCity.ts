import { useEffect, useState } from "react";

import type { City } from "../data/trip";

/* który rozdział jest teraz — steruje etykietą i akcentem w nawigacji (Nav ustawia data-accent).
   IntersectionObserver z „linią" na 42% viewportu: brak odczytów layoutu przy scrollu. */
export function useActiveCity(cities: Record<string, City>) {
  const [activeCity, setActiveCity] = useState<string | null>(null);

  useEffect(() => {
    const chapters = Array.from(document.querySelectorAll<HTMLElement>("[data-city]"));
    if (!chapters.length) return;

    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) visible.add(el);
          else visible.delete(el);
        }
        const active = chapters.find((ch) => visible.has(ch));
        setActiveCity(active?.dataset.city ?? null);
      },
      { rootMargin: "-42% 0px -58% 0px" },
    );

    chapters.forEach((ch) => io.observe(ch));
    return () => io.disconnect();
  }, [cities]);

  return activeCity;
}
