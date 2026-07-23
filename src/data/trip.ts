import rawExport from "./tripsy-export.json";

export interface City {
  name: string;
  jp: string;
  v: string;
}

export interface Leg {
  mode: string;
  what: string;
  when: string;
  price: number;
  note: string;
}

export interface Stay {
  name: string;
  room: string;
  price: number;
  from: string;
  to: string;
  url: string;
  description: string;
}

export interface ItineraryItem {
  time: string;
  kind: string;
  title: string;
  desc: string;
  tip?: string;
  price?: number;
  url?: string;
}

export interface Day {
  date: string;
  wd: string;
  items: ItineraryItem[];
}

export interface Stint {
  city: string;
  dates: string;
  nights: number;
  coda?: boolean;
  legIn: Leg;
  stay: Stay;
  days: Day[];
}

export interface CostRow {
  name: string;
  price: number;
}

export interface CostGroup {
  label: string;
  color: string;
  rows: CostRow[];
}

export interface Trip {
  people: number;
  cities: Record<string, City>;
  stints: Stint[];
  legOut: Leg;
  costGroups: CostGroup[];
}

/* Dane wyjazdu ładowane z eksportu Tripsy (scripts/fetch-tripsy-data.mjs → src/data/tripsy-export.json).
   Odświeżenie: `npm run generate`, plik JSON się zmienia, transform poniżej przelicza go na Trip. */

interface TripsyHosting {
  name: string;
  starts_at: string;
  ends_at: string;
  description: string | null;
  room_type: string;
  price: number | null;
  website: string | null;
  notes: string | null;
  starts_at_jst: string;
  ends_at_jst: string;
}

interface TripsyActivity {
  name: string;
  activity_type: string;
  starts_at: string;
  price: number | null;
  description: string | null;
  notes: string | null;
  website: string | null;
  starts_at_jst: string;
}

interface TripsyTransportation {
  name: string;
  transportation_type: string;
  company: string | null;
  transport_number: string | null;
  departure_at: string;
  departure_timezone: string;
  arrival_at: string;
  arrival_timezone: string;
  price: number | null;
  notes: string | null;
}

interface TripsyExport {
  hostings: TripsyHosting[];
  activities: TripsyActivity[];
  transportations: TripsyTransportation[];
}

const TRIP_PEOPLE = 4;

/* Miasta, japońskie zapisy i kolory CSS nie są częścią eksportu Tripsy — trzymane tu ręcznie. */
const CITY_META: Record<string, City> = {
  tokyo: { name: "Tokio", jp: "東京", v: "--c-tokyo" },
  kyoto: { name: "Kioto", jp: "京都", v: "--c-kyoto" },
  osaka: { name: "Osaka", jp: "大阪", v: "--c-osaka" },
  fukuoka: { name: "Fukuoka", jp: "福岡", v: "--c-fukuoka" },
  beppu: { name: "Beppu", jp: "別府", v: "--c-beppu" },
};

const COLOR_FLIGHTS = "--c-tokyo";
const COLOR_STAYS = "--c-kyoto";
const COLOR_TRAINS = "--c-hiroshima";
const COLOR_ATTRACTIONS = "--c-beppu";

const TEMPLE_KEYWORDS = ["swiatyni", "chram", "jing", "taisha", "inari", "dera", "kinkaku"];

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function splitJst(s: string): { date: string; time: string } {
  const idx = s.lastIndexOf(" ");
  return { date: s.slice(0, idx), time: s.slice(idx + 1) };
}

function withComma(s: string): string {
  return s.replace(/^(\d{1,2}\s+\S+)\s+(\d{2}:\d{2})$/, "$1, $2");
}

function formatLocal(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone,
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function weekday(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", timeZone: "Asia/Tokyo" }).format(
    new Date(iso),
  );
}

function splitParagraphs(notes: string | null | undefined): string[] {
  if (!notes) return [];
  return notes
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
}

function paragraphsExcludingPricing(notes: string | null | undefined): string[] {
  return splitParagraphs(notes).filter((p) => !/^KONWENCJA/i.test(p));
}

function detectCity(name: string): string {
  const n = normalize(name);
  if (/tokyo|tokio/.test(n)) return "tokyo";
  if (/kyoto|kioto/.test(n)) return "kyoto";
  if (/osaka/.test(n)) return "osaka";
  if (/fukuoka/.test(n)) return "fukuoka";
  if (/beppu/.test(n)) return "beppu";
  throw new Error(`Nie rozpoznano miasta w nazwie noclegu: ${name}`);
}

function mealKind(startsAtJst: string): string {
  const hour = parseInt(splitJst(startsAtJst).time, 10);
  if (hour < 11) return "Śniadanie";
  if (hour < 17) return "Lunch";
  return "Kolacja";
}

function inferKind(a: TripsyActivity): string {
  if (a.activity_type === "note") return "O mieście";

  const text = normalize(`${a.name} ${a.description ?? ""} ${a.notes ?? ""}`);

  switch (a.activity_type) {
    case "restaurant":
    case "foodMarket":
      return mealKind(a.starts_at_jst);
    case "shopping":
      return "Zakupy";
    case "museum":
      return "Muzeum";
    case "relax":
      return "Onsen";
    case "tour":
      if (text.includes("ryoan")) return "Ogród";
      if (TEMPLE_KEYWORDS.some((k) => text.includes(k))) return "Świątynia";
      return "Wycieczka";
    case "park":
      if (text.includes("daytrip")) return "Wycieczka";
      return "Ogród";
    case "general":
      if (text.includes("widok") || text.includes("crossing") || text.includes("sky"))
        return "Widok";
      if (text.includes("spacer")) return "Spacer";
      return "Dzielnica";
    default:
      return "Zwiedzanie";
  }
}

function nightsWord(n: number): string {
  if (n === 1) return "noc";
  if (n >= 2 && n <= 4) return "noce";
  return "nocy";
}

function buildDescAndTip(a: TripsyActivity): { desc: string; tip?: string } {
  if (a.description && a.description.trim()) {
    const tipParas = paragraphsExcludingPricing(a.notes);
    return tipParas.length
      ? { desc: a.description.trim(), tip: tipParas.join(" ") }
      : { desc: a.description.trim() };
  }
  const [desc, ...rest] = paragraphsExcludingPricing(a.notes);
  return rest.length ? { desc: desc ?? a.name, tip: rest.join(" ") } : { desc: desc ?? a.name };
}

function buildItem(a: TripsyActivity): ItineraryItem {
  const isNote = a.activity_type === "note";
  const { desc, tip } = buildDescAndTip(a);

  const item: ItineraryItem = {
    time: isNote ? "" : splitJst(a.starts_at_jst).time,
    kind: inferKind(a),
    title: isNote ? a.name.replace(/^📍\s*/, "").trim() : a.name,
    desc,
  };
  if (tip) item.tip = tip;
  if (a.price != null) item.price = a.price;
  if (a.website) item.url = a.website;
  return item;
}

function groupIntoDays(activities: TripsyActivity[]): Day[] {
  const days: Day[] = [];
  for (const a of activities) {
    const { date } = splitJst(a.starts_at_jst);
    const last = days[days.length - 1];
    const day = last && last.date === date ? last : undefined;
    if (day) {
      day.items.push(buildItem(a));
    } else {
      days.push({ date, wd: weekday(a.starts_at), items: [buildItem(a)] });
    }
  }
  return days;
}

function dateRangeLabel(h: TripsyHosting): { label: string; nights: number } {
  const { date: startDate } = splitJst(h.starts_at_jst);
  const { date: endDate } = splitJst(h.ends_at_jst);
  const [startDayStr, startMonth] = startDate.split(" ");
  const [endDayStr, endMonth] = endDate.split(" ");

  if (startMonth === endMonth) {
    const startDay = parseInt(startDayStr, 10);
    const endDay = parseInt(endDayStr, 10);
    return { label: `${startDay}–${endDay} ${endMonth}`, nights: endDay - startDay };
  }
  const nights = Math.round((Date.parse(h.ends_at) - Date.parse(h.starts_at)) / 86400000);
  return { label: `${startDate} – ${endDate}`, nights };
}

function legWhat(t: TripsyTransportation, fallbackFrom: string, fallbackTo: string): string {
  const name = (t.name ?? "").trim();
  const m = name.match(/^(.*?)\s*\(([^→]+)→(.+)\)\s*$/);
  if (m) return `${m[1].trim()} · ${m[2].trim()} → ${m[3].trim()}`;

  const prefixParts = [t.company, t.transport_number].filter(Boolean);
  const prefix = prefixParts.length
    ? prefixParts.join(" ")
    : t.transportation_type === "airplane"
      ? "Lot"
      : "Pociąg";
  return `${prefix} · ${fallbackFrom} → ${fallbackTo}`;
}

function buildLeg(t: TripsyTransportation, fromLabel: string, toLabel: string): Leg {
  const mode =
    t.transportation_type === "airplane" ? "空" : t.transportation_type === "train" ? "鉄" : "🚌";
  return {
    mode,
    what: legWhat(t, fromLabel, toLabel),
    when: `${withComma(formatLocal(t.departure_at, t.departure_timezone))} → ${withComma(
      formatLocal(t.arrival_at, t.arrival_timezone),
    )}`,
    price: t.price ?? 0,
    note: paragraphsExcludingPricing(t.notes).join(" "),
  };
}

function buildStay(h: TripsyHosting): Stay {
  return {
    name: h.name.replace(/\s*\(propozycja\)\s*$/i, "").trim(),
    room: h.room_type,
    price: h.price ?? 0,
    from: withComma(h.starts_at_jst),
    to: withComma(h.ends_at_jst),
    url: h.website ?? "",
    description: h.description || '',
  };
}

function buildCostGroups(stints: Stint[], legOut: Leg, activities: TripsyActivity[]): CostGroup[] {
  const allLegs = [...stints.map((s) => s.legIn), legOut];

  const flightRows: CostRow[] = allLegs
    .filter((l) => l.mode === "空")
    .map((l) => ({ name: l.what, price: l.price }));

  const trainRows: CostRow[] = allLegs
    .filter((l) => l.mode === "鉄")
    .map((l) => ({ name: l.what, price: l.price }));

  const stayRows: CostRow[] = stints.map((s) => ({
    name: `${s.stay.name} · ${s.nights} ${nightsWord(s.nights)}`,
    price: s.stay.price,
  }));

  const priced = activities
    .filter(
      (a): a is TripsyActivity & { price: number } => typeof a.price === "number" && a.price > 0,
    )
    .sort((a, b) => b.price - a.price)
    .map((a): CostRow => ({ name: a.name, price: a.price }));

  const free = activities.filter((a) => a.price === 0).map((a) => a.name);
  const attractionRows = free.length ? [...priced, { name: free.join(", "), price: 0 }] : priced;

  return [
    { label: "Przeloty", color: COLOR_FLIGHTS, rows: flightRows },
    { label: "Noclegi", color: COLOR_STAYS, rows: stayRows },
    { label: "Pociągi", color: COLOR_TRAINS, rows: trainRows },
    { label: "Atrakcje i bilety", color: COLOR_ATTRACTIONS, rows: attractionRows },
  ];
}

function buildTrip(raw: TripsyExport): Trip {
  const hostings = [...raw.hostings].sort(
    (a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at),
  );
  const transports = [...raw.transportations].sort(
    (a, b) => Date.parse(a.departure_at) - Date.parse(b.departure_at),
  );

  const stintCities = hostings.map((h) => detectCity(h.name));
  const seenCities = new Set<string>();
  const codas = stintCities.map((city) => {
    const isCoda = seenCities.has(city);
    seenCities.add(city);
    return isCoda;
  });

  /* Granica między pobytami to moment lądowania/przyjazdu (transport.arrival_at), nie
     zameldowania — bo część planu dnia (lunch, zwiedzanie) dzieje się przed check-inem. */
  const boundaries = transports.slice(0, hostings.length).map((t) => Date.parse(t.arrival_at));
  const buckets: TripsyActivity[][] = hostings.map(() => []);
  for (const a of raw.activities) {
    const ms = Date.parse(a.starts_at);
    let idx = 0;
    for (let i = 0; i < boundaries.length; i++) {
      if (boundaries[i] <= ms) idx = i;
    }
    buckets[idx].push(a);
  }

  const stints: Stint[] = hostings.map((h, i) => {
    const citySlug = stintCities[i];
    const coda = codas[i];
    const fromLabel = i === 0 ? "Warszawa" : CITY_META[stintCities[i - 1]].name;
    const { label: dates, nights } = dateRangeLabel(h);

    const stint: Stint = {
      city: citySlug,
      dates,
      nights,
      legIn: buildLeg(transports[i], fromLabel, CITY_META[citySlug].name),
      stay: buildStay(h),
      days: groupIntoDays(buckets[i]),
    };
    if (coda) stint.coda = true;
    return stint;
  });

  const legOut = buildLeg(
    transports[hostings.length],
    CITY_META[stintCities[stintCities.length - 1]].name,
    "Warszawa",
  );

  return {
    people: TRIP_PEOPLE,
    cities: CITY_META,
    stints,
    legOut,
    costGroups: buildCostGroups(stints, legOut, raw.activities),
  };
}

export const TRIP: Trip = buildTrip(rawExport as unknown as TripsyExport);
