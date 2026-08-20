import rgdpOfficial from "@/data/official-rgdp.json";
import hlfsOfficial from "@/data/official-hlfs.json";
import { DISTRICTS, NZ, REGIONS } from "./places";
import { isRegion, shortPlace } from "./format";
import { pcRel, placeKind, rankOf } from "./insights";
import type { Place } from "./types";

export type IndustryId =
  | "primary"
  | "manufacturing"
  | "utilities"
  | "construction"
  | "trade"
  | "hospitality"
  | "transport"
  | "info"
  | "finance"
  | "property"
  | "professional"
  | "public"
  | "education"
  | "health"
  | "other";

export type Mix = Record<IndustryId, number>;

export type ProfileTab = "overview" | "economy" | "labour" | "people" | "housing" | "compare";

export const TABS: { id: ProfileTab; label: string; reo: string }[] = [
  { id: "overview", label: "Overview", reo: "Tirohanga" },
  { id: "economy", label: "Economy", reo: "Ōhanga" },
  { id: "labour", label: "Labour", reo: "Mahi" },
  { id: "people", label: "People", reo: "Tangata" },
  { id: "housing", label: "Housing", reo: "Kāinga" },
  { id: "compare", label: "Compare", reo: "Whakatairite" },
];

export const INDUSTRIES: { id: IndustryId; short: string; label: string; intensity: number }[] = [
  { id: "primary", short: "Primary", label: "Agriculture, forestry, fishing & mining", intensity: 1.35 },
  { id: "manufacturing", short: "Manufacturing", label: "Manufacturing", intensity: 1.05 },
  { id: "utilities", short: "Utilities", label: "Electricity, gas, water & waste", intensity: 0.45 },
  { id: "construction", short: "Construction", label: "Construction", intensity: 1.2 },
  { id: "trade", short: "Trade", label: "Wholesale & retail trade", intensity: 1.25 },
  { id: "hospitality", short: "Hospitality", label: "Accommodation & food services", intensity: 1.7 },
  { id: "transport", short: "Transport", label: "Transport, postal & warehousing", intensity: 0.9 },
  { id: "info", short: "Info & other", label: "Information media, telecommunications & other services", intensity: 0.55 },
  { id: "finance", short: "Finance", label: "Financial & insurance services", intensity: 0.5 },
  { id: "property", short: "Property", label: "Rental, hiring, real estate & owner-occupied dwellings", intensity: 0.4 },
  { id: "professional", short: "Professional", label: "Professional, scientific, technical & admin support", intensity: 0.7 },
  { id: "public", short: "Public admin", label: "Public administration & safety", intensity: 0.85 },
  { id: "education", short: "Education", label: "Education & training", intensity: 1.25 },
  { id: "health", short: "Health", label: "Health care & social assistance", intensity: 1.3 },
  { id: "other", short: "Other services", label: "Arts, recreation & other services", intensity: 1.15 },
];

export const INDUSTRY_LIST = INDUSTRIES;

const EMPTY_MIX: Mix = {
  primary: 0,
  manufacturing: 0,
  utilities: 0,
  construction: 0,
  trade: 0,
  hospitality: 0,
  transport: 0,
  info: 0,
  finance: 0,
  property: 0,
  professional: 0,
  public: 0,
  education: 0,
  health: 0,
  other: 0,
};

function mixFrom(raw: Record<string, number> | undefined): Mix {
  const out: Mix = { ...EMPTY_MIX };
  if (!raw) return out;
  for (const i of INDUSTRY_LIST) out[i.id] = raw[i.id] ?? 0;
  return out;
}

type RgdpRow = {
  gdp24: number;
  gdp25: number;
  pc24: number;
  pc25: number;
  growth25: number;
  mix24: Record<string, number>;
  mixConfidential: string[];
  mixPartial: string[];
  path2018to2025: number[];
};

const RGDP_BY_NAME: Record<string, RgdpRow> = {
  ...(rgdpOfficial.regions as unknown as Record<string, RgdpRow>),
  "Tasman/Nelson": rgdpOfficial.regions["Tasman/Nelson"] as unknown as RgdpRow,
  Tasman: rgdpOfficial.regions["Tasman/Nelson"] as unknown as RgdpRow,
  Nelson: rgdpOfficial.regions["Tasman/Nelson"] as unknown as RgdpRow,
  "Manawatū-Whanganui": rgdpOfficial.regions["Manawatu-Whanganui"] as unknown as RgdpRow,
  "Manawatu-Whanganui": rgdpOfficial.regions["Manawatu-Whanganui"] as unknown as RgdpRow,
};

function rgdpRow(region: string): RgdpRow | undefined {
  return RGDP_BY_NAME[region];
}

export const NZ_MIX: Mix = mixFrom(rgdpOfficial.nz.mix24);

const SAME_BOUNDARY = new Set([
  "Auckland",
  "Gisborne District",
  "Tasman District",
  "Nelson City",
  "Marlborough District",
]);

type Tilt = Partial<Record<IndustryId, number>>;

const CITY_TILT: Tilt = {
  primary: 0.35, professional: 1.25, finance: 1.2, public: 1.15,
  health: 1.1, education: 1.1, manufacturing: 0.85, info: 1.15,
};
const RURAL_TILT: Tilt = {
  primary: 1.8, professional: 0.65, finance: 0.55, info: 0.6,
  public: 0.9, hospitality: 0.9, manufacturing: 1.15,
};

const TA_TILT: Record<string, Tilt> = {
  "Wellington City": {
    primary: 0.12, public: 2.35, professional: 1.45, finance: 1.55,
    info: 1.4, manufacturing: 0.4, construction: 0.7, hospitality: 1.1, education: 1.2,
  },
  "Lower Hutt City": {
    primary: 0.25, manufacturing: 1.6, professional: 1.15, public: 1.05, health: 1.15,
  },
  "Porirua City": { public: 1.4, health: 1.2, education: 1.15, primary: 0.3, finance: 0.7 },
  "Upper Hutt City": { public: 1.25, education: 1.2, primary: 0.4, professional: 1.05 },
  "Kapiti Coast District": {
    primary: 0.6, health: 1.35, trade: 1.2, public: 0.7, professional: 0.85, property: 1.2,
  },
  "Masterton District": { primary: 1.4, health: 1.2, trade: 1.15, professional: 0.8 },
  "South Wairarapa District": { primary: 1.8, hospitality: 1.3, professional: 0.7 },
  "Christchurch City": {
    primary: 0.3, professional: 1.3, health: 1.2, manufacturing: 1.1, construction: 1.05, public: 1.1,
  },
  "Selwyn District": { primary: 1.6, construction: 1.7, professional: 0.75, public: 0.7, property: 1.2 },
  "Waimakariri District": { construction: 1.5, primary: 1.2, professional: 0.8, health: 1.1 },
  "Ashburton District": { primary: 2.1, manufacturing: 1.5, professional: 0.6 },
  "Timaru District": { manufacturing: 1.4, primary: 1.3, health: 1.15 },
  "Queenstown-Lakes District": {
    hospitality: 3.2, construction: 1.6, property: 1.7, primary: 0.4, public: 0.55, manufacturing: 0.4,
  },
  "Dunedin City": {
    education: 2.1, health: 1.35, public: 1.15, professional: 1.1, primary: 0.4, hospitality: 1.1,
  },
  "Central Otago District": { primary: 1.6, hospitality: 1.4, construction: 1.3, professional: 0.75 },
  "Hamilton City": { education: 1.4, health: 1.3, professional: 1.2, public: 1.15, primary: 0.25 },
  "Tauranga City": { health: 1.25, construction: 1.2, trade: 1.2, primary: 0.4, professional: 1.1 },
  "Rotorua District": { hospitality: 1.8, health: 1.2, public: 1.15, primary: 0.9 },
  "Kawerau District": { manufacturing: 2.8, primary: 1.2, professional: 0.4, finance: 0.4 },
  "New Plymouth District": { utilities: 1.4, professional: 1.15, health: 1.15, primary: 0.7 },
  "South Taranaki District": { primary: 1.8, manufacturing: 1.9, utilities: 1.5, professional: 0.55 },
  "Invercargill City": { manufacturing: 1.3, health: 1.2, trade: 1.15, primary: 0.5 },
  "Southland District": { primary: 2.2, manufacturing: 1.4, professional: 0.55 },
  "Palmerston North City": { public: 1.5, education: 1.8, health: 1.25, primary: 0.3 },
  "Nelson City": { trade: 1.2, health: 1.15, professional: 1.1, primary: 0.5 },
  "Grey District": { primary: 1.5, utilities: 1.4, health: 1.15 },
  "Buller District": { primary: 2.0, utilities: 1.6, professional: 0.5 },
  "Far North District": { primary: 1.5, public: 1.2, health: 1.2, hospitality: 1.2 },
  "Thames-Coromandel District": { hospitality: 1.8, property: 1.4, construction: 1.2, primary: 0.9 },
  "Mackenzie District": { hospitality: 2.2, primary: 1.4, construction: 1.2 },
  "Kaikoura District": { hospitality: 2.4, primary: 1.3, transport: 1.2 },
  "Chatham Islands Territory": { primary: 3.2, public: 1.8, professional: 0.3, finance: 0.2 },
};

/** Stats NZ regional GDP YE Mar 2025 (provisional, 23 Mar 2026 release). Tasman/Nelson combined. */
export const GDP_2025: Record<string, { b: number; pc: number; growth: number; share: number }> = Object.fromEntries(
  Object.entries(RGDP_BY_NAME).map(([name, row]) => {
    const nz = rgdpOfficial.nz.gdp25 || 1;
    return [
      name,
      {
        b: row.gdp25 / 1000,
        pc: row.pc25,
        growth: row.growth25,
        share: Math.round((row.gdp25 / nz) * 1000) / 10,
      },
    ];
  }),
);

export const NZ_GDP_2025 = {
  b: rgdpOfficial.nz.gdp25 / 1000,
  pc: rgdpOfficial.nz.pc25,
  growth: rgdpOfficial.nz.growth25,
};

type HlfsGroup = (typeof hlfsOfficial)["nz"] & { group?: string };

const HLFS_GROUP = hlfsOfficial.groups as Record<string, HlfsGroup>;
const HLFS_MAP = hlfsOfficial.regionToGroup as Record<string, string>;

export const NZ_UNEMP = {
  v: hlfsOfficial.nz.unemployment,
  note: "HLFS Jun 2026, seasonally adjusted",
  official: true,
  sa: true,
};

export type Unemp = {
  v: number;
  note: string;
  official: boolean;
  sa: boolean;
  group?: string;
};

const PATH_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;

export const SNAPSHOT = {
  asAt: "21 Aug 2026",
  asAtIso: rgdpOfficial.meta.asAt as string,
  census: "Stats NZ 2023 Census (usually resident, randomly rounded to base 3)",
  rgdp: "Stats NZ Regional GDP YE Mar 2025 release (2024 revised, 2025 provisional)",
  hlfs: "Stats NZ HLFS June 2026 quarter",
  tagdp: "MBIE modelled territorial authority GDP 2025 (experimental)",
  nzdep: "University of Otago NZDep2023",
};

export const NZ_GDP_PATH = PATH_YEARS.map((year, i) => ({
  year,
  b: rgdpOfficial.nz.path2018to2025[i] / 1000,
}));

function normalize(mix: Mix): Mix {
  const total = INDUSTRY_LIST.reduce((s, i) => s + (mix[i.id] || 0), 0) || 1;
  const out = { ...mix };
  for (const i of INDUSTRY_LIST) out[i.id] = ((mix[i.id] || 0) / total) * 100;
  return out;
}

function applyTilt(base: Mix, tilt: Tilt): Mix {
  const next = { ...base };
  for (const i of INDUSTRY_LIST) next[i.id] = (base[i.id] || 0) * (tilt[i.id] ?? 1);
  return normalize(next);
}

function regionNameOf(place: Place) {
  return isRegion(place) ? place.name : (place.region ?? "");
}

function isCityPlace(place: Place) {
  return place.name.includes("City") || place.name === "Auckland";
}

function parentRegion(place: Place): Place | undefined {
  if (isRegion(place)) return place;
  return REGIONS.find((r) => r.name === place.region);
}

export function mixIsOfficial(place: Place) {
  return isRegion(place) || SAME_BOUNDARY.has(place.name);
}

export function mixSource(place: Place) {
  const region = regionNameOf(place);
  const rec = rgdpRow(region);
  if (mixIsOfficial(place)) {
    const bits = [
      "Stats NZ Regional GDP by industry, YE Mar 2024 (revised in the 23 Mar 2026 release). Shares are percent of Total All Industries, excluding GST.",
    ];
    if (region === "Tasman" || region === "Nelson" || place.gdpCombinedTN) {
      bits.push("Tasman and Nelson are published as one combined region.");
    }
    if (rec?.mixConfidential?.length) {
      bits.push(`Confidential (suppressed): ${rec.mixConfidential.join(", ")}.`);
    }
    if (rec?.mixPartial?.length) {
      bits.push(
        `Partial (some ANZSIC components suppressed): ${rec.mixPartial.join(", ")} — published remainder only.`,
      );
    }
    return { official: true, note: bits.join(" ") };
  }
  return {
    official: false,
    note: "Industry mix for this district starts from the parent region’s official Stats NZ shares, then applies a local tilt. It illustrates structure — Stats NZ does not publish territorial-authority industry GDP.",
  };
}

export function industryMix(place: Place): Mix {
  const region = regionNameOf(place);
  const rec = rgdpRow(region);
  const base = mixFrom(rec?.mix24 ?? rgdpOfficial.nz.mix24);
  if (mixIsOfficial(place)) return base;
  const named = TA_TILT[place.name];
  if (named) return applyTilt(base, named);
  if (isCityPlace(place)) return applyTilt(base, CITY_TILT);
  const rural =
    (place.pop23 ?? 0) < 25000 || (place.gdpPC != null && place.gdpPC < 48000);
  if (rural) return applyTilt(base, RURAL_TILT);
  return normalize(base);
}

export type IndustryRow = {
  id: IndustryId;
  short: string;
  label: string;
  share: number;
  nzShare: number;
  lq: number;
  gdpB: number;
  jobs: number;
};

export function industryRows(place: Place): IndustryRow[] {
  const mix = industryMix(place);
  const gdp = place.gdpB ?? 0;
  const jobsTotal = labour(place).employed;
  const weighted = INDUSTRY_LIST.reduce((s, i) => s + mix[i.id] * i.intensity, 0) || 1;
  return INDUSTRY_LIST.map((i) => {
    const share = mix[i.id];
    const nzShare = NZ_MIX[i.id];
    const jobs = jobsTotal * ((share * i.intensity) / weighted);
    return {
      id: i.id,
      short: i.short,
      label: i.label,
      share,
      nzShare,
      lq: nzShare ? share / nzShare : 0,
      gdpB: gdp * (share / 100),
      jobs,
    };
  })
    .filter((r) => r.share >= 0.05)
    .sort((a, b) => b.share - a.share);
}

export function regionGrowth2025(place: Place) {
  const region = regionNameOf(place);
  return GDP_2025[region]?.growth ?? NZ_GDP_2025.growth;
}

function officialPathBillions(region: string): number[] | null {
  const rec = rgdpRow(region);
  const path = rec?.path2018to2025;
  if (!path || path.some((v) => v == null)) return null;
  return path.map((v) => v / 1000);
}

export function gdpPath(place: Place): { year: number; local: number; nz: number }[] {
  const g24 = place.gdpB;
  if (g24 == null) return [];
  const region = regionNameOf(place);
  const official = officialPathBillions(region);
  if (official) {
    const y24 = official[PATH_YEARS.indexOf(2024)] || g24;
    const scale = mixIsOfficial(place) ? 1 : y24 ? g24 / y24 : 1;
    return PATH_YEARS.map((year, i) => ({
      year,
      local: official[i] * scale,
      nz: NZ_GDP_PATH[i].b,
    }));
  }
  return NZ_GDP_PATH.map((row) => ({
    year: row.year,
    local: row.year === 2024 ? g24 : (g24 * row.b) / NZ.gdpB,
    nz: row.b,
  }));
}

function hlfsGroupFor(place: Place): HlfsGroup | undefined {
  const region = regionNameOf(place);
  const key = HLFS_MAP[region];
  if (!key) return undefined;
  return HLFS_GROUP[key];
}

export function unempFor(place: Place): Unemp {
  const g = hlfsGroupFor(place);
  if (!g) return NZ_UNEMP;
  const combined = g.group && g.group.includes("/");
  return {
    v: g.unemployment,
    note: combined
      ? `HLFS Jun 2026 · not seasonally adjusted · ${g.group} combined`
      : "HLFS Jun 2026 · not seasonally adjusted",
    official: true,
    sa: false,
    group: g.group,
  };
}

export function labour(place: Place) {
  const g = hlfsGroupFor(place);
  if (isRegion(place) && g) {
    const employed = (g.employed000 ?? 0) * 1000;
    const unemployed = (g.unemployed000 ?? 0) * 1000;
    const labourForce = (g.labourForce000 ?? 0) * 1000;
    const workingAge = (g.workingAge000 ?? 0) * 1000;
    return {
      workingAge,
      participation: g.participation,
      labourForce,
      employed,
      unemployed,
      unemp: g.unemployment,
      productivity: place.gdpB != null && employed > 0 ? (place.gdpB * 1_000_000_000) / employed : null,
      official: true,
      ageBasis: "15+" as const,
    };
  }
  const parent = parentRegion(place);
  const p014 = place.p0_14 ?? parent?.p0_14;
  const p65 = place.p65 ?? parent?.p65 ?? NZ.p65;
  const workingAge =
    p014 != null ? place.pop23 * (1 - p014 / 100 - p65 / 100) : place.pop23 * ((100 - p65) / 100);
  const age = place.medAge ?? NZ.medAge;
  const participation = Math.max(0.52, Math.min(0.78, 0.705 - (age - 38.1) * 0.0045));
  const unemp = unempFor(place).v;
  const labourForce = workingAge * participation;
  const employed = labourForce * (1 - unemp / 100);
  const unemployed = labourForce - employed;
  const productivity = place.gdpB != null && employed > 0 ? (place.gdpB * 1_000_000_000) / employed : null;
  return {
    workingAge,
    participation: participation * 100,
    labourForce,
    employed,
    unemployed,
    unemp,
    productivity,
    official: false,
    ageBasis: p014 != null ? ("15-64" as const) : ("under-65" as const),
  };
}

export function gdp2025Estimate(place: Place) {
  if (place.gdpB == null) return null;
  if (isRegion(place) && GDP_2025[place.name]) return GDP_2025[place.name];
  const growth = regionGrowth2025(place);
  const b = place.gdpB * (1 + growth / 100);
  const pc = place.pop23 ? (b * 1_000_000_000) / place.pop23 : null;
  return { b, pc, growth, share: place.gdpShare };
}

export function topIndustries(place: Place, n = 3) {
  return industryRows(place).slice(0, n);
}

export function specialisations(place: Place) {
  return industryRows(place)
    .filter((r) => r.lq >= 1.25 && r.share >= 4)
    .sort((a, b) => b.lq - a.lq)
    .slice(0, 4);
}

export function profileStory(place: Place) {
  const k = placeKind(place);
  const mix = topIndustries(place, 3);
  const who = shortPlace(place.name);
  const bits: string[] = [];
  bits.push(
    `${who} is a ${k.word} of ${place.pop23.toLocaleString("en-NZ")} people (2023 Census).`,
  );
  if (place.gdpB != null) {
    bits.push(
      `Production is about $${place.gdpB.toFixed(place.gdpB >= 10 ? 1 : 2)} billion (YE Mar 2024)${
        place.gdpPC != null ? `, or ${pcRel(place.gdpPC)}` : ""
      }.`,
    );
  }
  if (mix.length) {
    bits.push(
      `The largest industries by GDP are ${mix.map((m) => m.short.toLowerCase()).join(", ")}.`,
    );
  }
  const spec = specialisations(place);
  if (spec[0]) {
    bits.push(
      `${spec[0].label} is about ${spec[0].lq.toFixed(1)}× more concentrated here than nationally.`,
    );
  }
  const g25 = regionGrowth2025(place);
  const region = regionNameOf(place);
  bits.push(
    `${region} GDP ${g25 >= 0 ? "grew" : "fell"} ${Math.abs(g25).toFixed(1)}% in the year to March 2025 (NZ ${NZ_GDP_2025.growth > 0 ? "+" : ""}${NZ_GDP_2025.growth}%).`,
  );
  return bits.join(" ");
}

export function featuredProfiles(): Place[] {
  const slugs = [
    "wellington-city",
    "auckland",
    "christchurch-city",
    "queenstown-lakes-district",
    "gisborne-district",
    "selwyn-district",
    "taranaki-region",
    "southland-region",
  ];
  return slugs
    .map((s) => REGIONS.find((r) => r.slug === s) ?? DISTRICTS.find((t) => t.slug === s))
    .filter((p): p is Place => !!p);
}

export function allPlaces(): Place[] {
  return [...REGIONS, ...DISTRICTS];
}

export function moneyB(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 100) return "$" + Math.round(n).toLocaleString("en-NZ") + "b";
  if (n >= 10) return "$" + n.toFixed(1) + "b";
  return "$" + n.toFixed(2) + "b";
}

export function jobsFmt(n: number) {
  if (n >= 1000) return Math.round(n).toLocaleString("en-NZ");
  return Math.round(n).toString();
}

export function gdpRank(place: Place) {
  return rankOf(place, placeKind(place).peers, (p) => p.gdpPC ?? null, true);
}

export function growthRank(place: Place) {
  return rankOf(place, placeKind(place).peers, (p) => p.popChg, true);
}
