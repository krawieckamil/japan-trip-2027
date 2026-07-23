import { useEffect, useRef, useState } from "react";
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
        <ZoomImage src={img.large} alt={img.credit} canSwipe={many} onSwipe={go} />
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

type Pt = { x: number; y: number };
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

const MAX_SCALE = 4;
const TAP_MAX = 8; // px ruchu, poniżej którego traktujemy gest jako tap
const DBL_TAP_MS = 300;
const SWIPE_MIN = 60; // px, próg nawigacji swipem

/* Obraz w lightboxie z gestami dotykowymi: pinch-to-zoom, pan po powiększeniu,
   swipe lewo/prawo do nawigacji (gdy niepowiększony), double-tap = zoom in/out. */
function ZoomImage({
  src,
  alt,
  canSwipe,
  onSwipe,
}: {
  src: string;
  alt: string;
  canSwipe: boolean;
  onSwipe: (d: 1 | -1) => void;
}) {
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, Pt>());
  const g = useRef({
    mode: "none" as "none" | "pan" | "pinch" | "swipe",
    startDist: 1,
    startScale: 1,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    dx: 0,
    lastTap: 0,
  });

  useEffect(() => {
    setAnimate(true);
    setT({ scale: 1, x: 0, y: 0 });
  }, [src]);

  const clampT = (nt: { scale: number; x: number; y: number }) => {
    const el = imgRef.current;
    const maxX = el ? ((nt.scale - 1) * el.offsetWidth) / 2 : 0;
    const maxY = el ? ((nt.scale - 1) * el.offsetHeight) / 2 : 0;
    return { scale: nt.scale, x: clamp(nt.x, -maxX, maxX), y: clamp(nt.y, -maxY, maxY) };
  };

  const begin = (cur: { scale: number; x: number; y: number }) => {
    const pts = [...pointers.current.values()];
    if (pts.length >= 2) {
      g.current.mode = "pinch";
      g.current.startDist = dist(pts[0], pts[1]) || 1;
      g.current.startScale = cur.scale;
    } else if (pts.length === 1) {
      g.current.mode = cur.scale > 1 ? "pan" : "swipe";
      g.current.startX = pts[0].x;
      g.current.startY = pts[0].y;
      g.current.baseX = cur.x;
      g.current.baseY = cur.y;
      g.current.dx = 0;
    } else {
      g.current.mode = "none";
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setAnimate(false);
    begin(t);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setAnimate(false);
    const pts = [...pointers.current.values()];
    if (g.current.mode === "pinch" && pts.length >= 2) {
      const scale = clamp(g.current.startScale * (dist(pts[0], pts[1]) / g.current.startDist), 1, MAX_SCALE);
      setT((p) => clampT({ scale, x: p.x, y: p.y }));
    } else if (g.current.mode === "pan") {
      setT((p) =>
        clampT({ scale: p.scale, x: g.current.baseX + (e.clientX - g.current.startX), y: g.current.baseY + (e.clientY - g.current.startY) }),
      );
    } else if (g.current.mode === "swipe") {
      g.current.dx = e.clientX - g.current.startX;
      setT({ scale: 1, x: g.current.dx, y: 0 });
    }
  };

  const settle = () => setT((p) => (p.scale <= 1.02 ? { scale: 1, x: 0, y: 0 } : clampT(p)));

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const { mode, dx, startX, startY } = g.current;
    setAnimate(true);
    if (mode === "swipe" || mode === "pan") {
      const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (moved < TAP_MAX) {
        const now = Date.now();
        if (now - g.current.lastTap < DBL_TAP_MS) {
          g.current.lastTap = 0;
          setT(t.scale > 1 ? { scale: 1, x: 0, y: 0 } : { scale: 2.5, x: 0, y: 0 });
        } else {
          g.current.lastTap = now;
          settle();
        }
      } else if (mode === "swipe" && canSwipe && Math.abs(dx) > SWIPE_MIN) {
        onSwipe(dx < 0 ? 1 : -1);
        setT({ scale: 1, x: 0, y: 0 });
      } else {
        settle();
      }
    } else if (mode === "pinch") {
      settle();
    }
    begin(t);
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      draggable={false}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform: `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale})`,
        transition: animate ? "transform 0.28s cubic-bezier(0.2,0.8,0.2,1)" : "none",
        touchAction: "none",
        willChange: "transform",
        cursor: t.scale > 1 ? "grab" : "auto",
      }}
      className="max-h-[82svh] max-w-[92vw] touch-none object-contain shadow-grand select-none"
    />
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
