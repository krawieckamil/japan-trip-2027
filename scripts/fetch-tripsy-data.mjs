#!/usr/bin/env node
// Pulls exactly the Tripsy data needed to (re)generate the trip page: the trip
// itself plus its hostings, activities, transportations and expenses.
// Docs: https://docs.api.tripsy.app/ · Auth: https://docs.api.tripsy.app/authentication
//
// Usage:
//   TRIPSY_API_TOKEN=xxxxx node scripts/fetch-tripsy-data.mjs --trip 1153192 --out tripsy-export.json
//
// Token: obtained via POST https://api.tripsy.app/auth (email + password), see docs.

const API_BASE = "https://api.tripsy.app";

const FIELDS = {
  trip: ["id", "name", "starts_at", "ends_at", "timezone", "has_dates"],
  hostings: [
    "id",
    "name",
    "starts_at",
    "ends_at",
    "timezone",
    "address",
    "description",
    "room_type",
    "price",
    "currency",
    "website",
    "notes",
    "provider_reservation_code",
  ],
  activities: [
    "id",
    "name",
    "activity_type",
    "starts_at",
    "ends_at",
    "timezone",
    "address",
    "price",
    "currency",
    "description",
    "notes",
    "website",
    "provider_reservation_code",
  ],
  transportations: [
    "id",
    "name",
    "transportation_type",
    "company",
    "transport_number",
    "seat_class",
    "departure_at",
    "departure_timezone",
    "departure_address",
    "arrival_at",
    "arrival_timezone",
    "arrival_address",
    "price",
    "currency",
    "notes",
    "provider_reservation_code",
  ],
  expenses: ["id", "title", "date", "price", "currency"],
};

function parseArgs(argv) {
  const args = { trip: process.env.TRIPSY_TRIP_ID, out: null, token: process.env.TRIPSY_API_TOKEN };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--trip") args.trip = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--token") args.token = argv[++i];
  }
  return args;
}

async function tripsyFetch(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!res.ok) {
    throw new Error(`${path} -> HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function fetchPaginated(path, fields, token) {
  const results = [];
  let url = `${path}?fields=${fields.join(",")}`;
  while (url) {
    const page = await tripsyFetch(url, token);
    results.push(...(page.results ?? []));
    url = page.next ? page.next.replace(API_BASE, "") : null;
  }
  return results;
}

function toJst(iso) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Asia/Tokyo",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function withJst(record, ...dateFields) {
  const out = { ...record };
  for (const field of dateFields) {
    if (field in record) out[`${field}_jst`] = toJst(record[field]);
  }
  return out;
}

async function main() {
  const { trip: tripId, out, token } = parseArgs(process.argv.slice(2));
  if (!token) {
    console.error("Missing Tripsy API token. Set TRIPSY_API_TOKEN or pass --token.");
    process.exit(1);
  }
  if (!tripId) {
    console.error("Missing trip id. Set TRIPSY_TRIP_ID or pass --trip.");
    process.exit(1);
  }

  const trip = await tripsyFetch(`/v1/trips/${tripId}?fields=${FIELDS.trip.join(",")}`, token);

  const [hostings, activities, transportations, expenses] = await Promise.all([
    fetchPaginated(`/v1/trip/${tripId}/hostings`, FIELDS.hostings, token),
    fetchPaginated(`/v1/trip/${tripId}/activities`, FIELDS.activities, token),
    fetchPaginated(`/v1/trip/${tripId}/transportations`, FIELDS.transportations, token),
    fetchPaginated(`/v1/trip/${tripId}/expenses`, FIELDS.expenses, token),
  ]);

  const totalsByCurrency = {};
  for (const item of [...hostings, ...activities, ...transportations, ...expenses]) {
    if (item.price == null || !item.currency) continue;
    totalsByCurrency[item.currency] = (totalsByCurrency[item.currency] ?? 0) + Number(item.price);
  }

  const payload = {
    fetched_at: new Date().toISOString(),
    trip,
    hostings: hostings.map((h) => withJst(h, "starts_at", "ends_at")),
    activities: activities.map((a) => withJst(a, "starts_at", "ends_at")),
    transportations: transportations.map((t) => withJst(t, "departure_at", "arrival_at")),
    expenses,
    totals_by_currency: totalsByCurrency,
  };

  const json = JSON.stringify(payload, null, 2);
  if (out) {
    const fs = await import("node:fs/promises");
    await fs.writeFile(out, json);
    console.error(`Written to ${out}`);
  } else {
    console.log(json);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
