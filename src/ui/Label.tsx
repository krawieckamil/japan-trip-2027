import { cn } from "./cn";

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("label inline-block font-jp text-base font-medium tracking-[0.05em]", className)}>
      {children}
    </span>
  );
}
