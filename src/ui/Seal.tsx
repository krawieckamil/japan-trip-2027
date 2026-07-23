import { cn } from "./cn";

/* pieczęć — czerwony stempel z glifem; kształt/animacja żyją w .seal (index.css) */
export function Seal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid aspect-[3/3.4] place-items-center rounded-[9%_12%_9%_13%/11%_8%_12%_9%] bg-seal font-jp text-plate-fg",
        className,
      )}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
