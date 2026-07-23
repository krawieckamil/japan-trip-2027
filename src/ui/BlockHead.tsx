import { Label } from "./Label";

export function BlockHead({
  label,
  jp,
  style,
}: {
  label: string;
  jp: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="block-head mb-1 flex items-baseline gap-[14px] pb-[12px]">
      <Label>{label}</Label>
      <span className="ml-auto font-jp text-[1.35rem] leading-none text-[var(--tint)]" style={style}>
        {jp}
      </span>
    </div>
  );
}
