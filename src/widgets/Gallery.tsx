import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import type { GalleryImage } from "../data/trip";
import { Label } from "../ui";

/* Galeria zdjęć (Wikimedia Commons) — miniatury jako oprawione odbitki, klik otwiera lightbox.
   variant „city" = siatka pod planszą; „spot" = kompaktowy pasek przy pozycji planu dnia. */
export function Gallery({ images, variant }: { images: GalleryImage[]; variant: "city" | "spot" }) {
  const [open, setOpen] = useState<number | null>(null);

  if (!images.length) return null;

  const isCity = variant === "city";

  return (
    <>
      {isCity ? (
        <div className="grid grid-cols-2 gap-[10px] min-[560px]:grid-cols-3 min-[900px]:grid-cols-4">
          {images.map((img, i) => (
            <Thumb key={img.thumb} img={img} className="aspect-[4/3]" onOpen={() => setOpen(i)} />
          ))}
        </div>
      ) : (
        <div className="-mx-[2px] flex snap-x gap-[8px] overflow-x-auto px-[2px] pb-[6px]">
          {images.map((img, i) => (
            <Thumb
              key={img.thumb}
              img={img}
              className="h-[78px] shrink-0 snap-start min-[720px]:h-[92px]"
              style={{ aspectRatio: `${img.w} / ${img.h}` }}
              onOpen={() => setOpen(i)}
            />
          ))}
        </div>
      )}

      {open !== null && (
        <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function Thumb({
  img,
  className,
  style,
  onOpen,
}: {
  img: GalleryImage;
  className?: string;
  style?: React.CSSProperties;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={style}
      className={`group relative block overflow-hidden rounded-[2px] bg-paper-2 shadow-card ${className ?? ""}`}
    >
      <img
        src={img.thumb}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-[1.05]"
      />
      <span
        className="pointer-events-none absolute inset-0 rounded-[2px] ring-1 ring-inset ring-[rgba(33,26,17,0.18)] transition-[box-shadow] group-hover:shadow-[inset_0_0_0_2px_var(--accent,var(--color-seal))]"
        aria-hidden="true"
      />
    </button>
  );
}

function Lightbox({
  images,
  index,
  onIndex,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const many = images.length > 1;
  const go = (d: number) => onIndex((index + d + images.length) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  });

  const img = images[index];

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[rgba(21,16,9,0.94)] p-[4vw] backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Podgląd zdjęcia"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Zamknij"
        className="absolute top-[18px] right-[20px] font-jp text-[1.5rem] leading-none text-plate-fg/70 transition-colors hover:text-plate-fg"
      >
        ×
      </button>

      {many && (
        <>
          <LightboxNav dir={-1} onClick={() => go(-1)} />
          <LightboxNav dir={1} onClick={() => go(1)} />
        </>
      )}

      <figure className="m-0 flex max-h-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          src={img.large}
          alt={img.credit}
          className="max-h-[82svh] max-w-[92vw] object-contain shadow-grand"
        />
        <figcaption className="mt-[14px] flex max-w-[92vw] flex-wrap items-baseline justify-center gap-x-[12px] gap-y-[3px] text-center text-[0.78rem] text-plate-fg/70">
          <span>
            © {img.credit}
            {img.license && ` · ${img.license}`}
          </span>
          <a
            href={img.page}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-b-plate-fg/40 text-plate-fg/85 no-underline hover:border-b-plate-fg"
          >
            Wikimedia Commons ↗
          </a>
          {many && <span className="tabular-nums text-plate-fg/55">{index + 1} / {images.length}</span>}
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}

function LightboxNav({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={dir === 1 ? "Następne" : "Poprzednie"}
      className={`absolute top-1/2 -translate-y-1/2 font-jp text-[2rem] leading-none text-plate-fg/60 transition-colors hover:text-plate-fg ${
        dir === 1 ? "right-[3vw]" : "left-[3vw]"
      }`}
    >
      {dir === 1 ? "›" : "‹"}
    </button>
  );
}

/* eksportowana etykieta sekcji galerii — używana przy pasku miasta */
export function GalleryLabel({ jp }: { jp: string }) {
  return (
    <div className="mb-[14px] flex items-baseline gap-[10px]">
      <Label className="text-accent">Galeria</Label>
      <span className="font-jp text-[1.05rem] leading-none text-accent opacity-80">{jp}</span>
    </div>
  );
}
