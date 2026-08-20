import census from "@/data/census.json";
import type { MetricDef, MetricId, Place, NzTotals, Level } from "./types";
import { fmt, money, pct } from "./format";

const data = census as {
  nz: NzTotals;
  regions: Place[];
  tas: Place[];
};

export const NZ: NzTotals = data.nz;
export const REGIONS: Place[] = data.regions;
export const DISTRICTS: Place[] = data.tas;

export function rowsFor(level: Level): Place[] {
  return level === "regions" ? REGIONS : DISTRICTS;
}

export function findBySlug(slug: string): Place | undefined {
  return REGIONS.find((r) => r.slug === slug) ?? DISTRICTS.find((t) => t.slug === slug);
}

export function findByName(name: string): Place | undefined {
  const n = name.toLowerCase();
  return (
    REGIONS.find((r) => r.name.toLowerCase() === n) ??
    DISTRICTS.find((t) => t.name.toLowerCase() === n)
  );
}

const shared: MetricDef[] = [
  {
    id: "popChg",
    label: "Population growth 2018–23",
    short: "Growth",
    get: (r) => r.popChg,
    format: (v) => pct(v),
  },
  {
    id: "gdpPC",
    label: "GDP per person",
    short: "GDP / person",
    get: (r) => r.gdpPC ?? null,
    format: (v) => money(v),
  },
  {
    id: "maoriEth",
    label: "Māori share of population",
    short: "Māori share",
    get: (r) => r.maoriEth,
    format: (v) => pct(v),
  },
  {
    id: "medAge",
    label: "Median age",
    short: "Median age",
    get: (r) => r.medAge,
    format: (v) => v.toFixed(1) + " yrs",
  },
  {
    id: "p65",
    label: "Aged 65+",
    short: "Aged 65+",
    get: (r) => r.p65,
    format: (v) => pct(v),
  },
  {
    id: "pop23",
    label: "Population (2023 Census)",
    short: "Population",
    get: (r) => r.pop23,
    format: (v) => fmt(v),
  },
  {
    id: "schoolRoll",
    label: "School roll (indicative, Jul 2026)",
    short: "School roll",
    get: (r) => r.schoolRoll,
    format: (v) => fmt(v),
  },
  {
    id: "depHigh",
    label: "People in NZDep2023 deciles 8–10",
    short: "Most deprived SA1s",
    get: (r) => r.depHighPct,
    format: (v) => pct(v),
    dep: true,
  },
  {
    id: "depMean",
    label: "NZDep2023 mean decile",
    short: "Mean NZDep",
    get: (r) => r.depMean,
    format: (v) => v.toFixed(1),
    dep: true,
  },
];

const ncea: MetricDef = {
  id: "nceaL2",
  label: "NCEA Level 2 (Year 12, 2025)",
  short: "NCEA L2",
  get: (r) => r.nceaL2pct,
  format: (v) => pct(v),
};

export const METRICS: Record<Level, MetricDef[]> = {
  regions: [...shared.slice(0, 6), ncea, shared[6], shared[7], shared[8]],
  districts: shared,
};

export function metricById(level: Level, id: MetricId): MetricDef {
  return METRICS[level].find((m) => m.id === id) ?? METRICS[level][0];
}

export const LIFE: Record<string, [number, number, number, number]> = {
  Tasman: [82.8, 85.7, 80.5, 84.0],
  Auckland: [81.1, 84.3, 74.0, 78.0],
  Wellington: [80.7, 83.8, 75.3, 79.1],
  Otago: [80.5, 83.7, 79.4, 83.0],
  Marlborough: [80.5, 83.6, 76.3, 80.0],
  Canterbury: [80.4, 83.6, 78.1, 81.8],
  Nelson: [80.4, 83.6, 75.3, 79.2],
  Taranaki: [79.6, 83.2, 75.2, 79.0],
  "Bay of Plenty": [79.4, 83.1, 73.0, 77.1],
  Waikato: [79.2, 82.7, 72.5, 76.5],
  Southland: [79.0, 82.5, 76.1, 79.8],
  "West Coast": [78.8, 82.4, 76.8, 80.5],
  "Hawke's Bay": [78.8, 82.5, 72.7, 76.8],
  Northland: [78.6, 82.2, 72.4, 76.5],
  "Manawatū-Whanganui": [78.6, 82.0, 73.9, 77.9],
  Gisborne: [77.9, 81.5, 72.9, 76.9],
};

export const NZ_LE = { mT: 80.1, fT: 83.5, mM: 73.7, fM: 78.0 };
