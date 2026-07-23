let numberFormat = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const formatCurrency = (n: number) => numberFormat.format(n);

export const nightsLabel = (n: number) => (n === 1 ? "1 noc" : `${n} noce`);

export const cssVar = (v: string) => `var(${v})`;

/* kwota per-osoba/łącznie — sufiks „/os." tylko w trybie na osobę */
export const money = (n: number, mult: number) =>
  `${formatCurrency(n * mult)} ${mult === 1 ? "/os." : ""}`;
