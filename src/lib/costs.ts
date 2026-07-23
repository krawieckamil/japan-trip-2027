import type { Trip } from "../data/trip";

export const groupTotals = (trip: Trip) =>
  trip.costGroups.map((g) => g.rows.reduce((sum, r) => sum + r.price, 0));

export const grandTotal = (trip: Trip) => groupTotals(trip).reduce((a, b) => a + b, 0);
