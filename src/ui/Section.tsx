import { cn } from "./cn";

export function Section({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto max-w-[44rem] px-[22px] pt-[68px] min-[720px]:px-10 min-[720px]:pt-24",
        className,
      )}
    >
      {children}
    </section>
  );
}
