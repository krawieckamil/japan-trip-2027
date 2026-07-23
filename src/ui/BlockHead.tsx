import { Label } from "./Label";

export function BlockHead({ label, jp, accent }: { label: string; jp: string; accent?: string }) {
  return (
    <div
      className="brush-b-foot mb-1 flex items-baseline gap-[14px] pb-[12px]"
      data-accent={accent}
    >
      <Label>{label}</Label>
      <span className="ml-auto font-jp text-[1.35rem] leading-none text-accent">{jp}</span>
    </div>
  );
}
