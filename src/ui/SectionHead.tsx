import { Label } from "./Label";

export function SectionHead({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="sec-head mb-[26px]">
      <Label>{label}</Label>
      <h2 className="mt-2 text-[clamp(2rem,8vw,3rem)]">{title}</h2>
      {children && <p className="mt-3 mb-0 max-w-[32rem] text-[0.94rem] text-ink-2">{children}</p>}
    </div>
  );
}
