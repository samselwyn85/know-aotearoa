export type Level = "regions" | "districts";

export type MetricId =
  | "popChg"
  | "gdpPC"
  | "maoriEth"
  | "medAge"
  | "p65"
  | "pop23"
  | "nceaL2"
  | "schoolRoll"
  | "depHigh"
  | "depMean";

export type ThemeId =
  | "all"
  | "people"
  | "maori"
  | "economy"
  | "housing"
  | "education"
  | "health";

export type Place = {
  name: string;
  slug: string;
  pop18: number;
  pop23: number;
  popChg: number;
  dw23?: number;
  dwChg?: number;
  medAge?: number;
  p65?: number;
  p0_14?: number;
  maoriEth?: number;
  maoriDesc?: number;
  euro?: number;
  pac?: number;
  asian?: number;
  gdpB?: number | null;
  gdpPC?: number | null;
  gdpCombinedTN?: boolean;
  gdpShare?: number;
  island?: string;
  region?: string;
  schoolRoll?: number;
  schoolCount?: number;
  schoolRollYear?: number;
  nceaL2pct?: number;
  nceaL3pct?: number;
  nceaUEpct?: number;
  nceaYear?: number;
  nceaNote?: string;
  nceaGeo?: string;
  parentNceaL2pct?: number;
  parentNceaL3pct?: number;
  parentNceaName?: string;
  parentNceaYear?: number;
  kyrUrl?: string;
  depHighPct?: number;
  depMean?: number;
  depP50?: number;
  depPop?: number;
  depSa1n?: number;
  depWeighted?: boolean;
  asRecip?: number;
  socHouse?: number;
  taCode?: number;
  regCode?: number;
};

export type NzTotals = {
  pop18: number;
  pop23: number;
  chg: number;
  dw23: number;
  dwChg: number;
  medAge: number;
  p0_14: number;
  p65: number;
  maoriEth: number;
  maoriDesc: number;
  euro: number;
  pac: number;
  asian: number;
  gdpB: number;
  gdpPC: number;
  schoolRoll: number;
  schoolCount: number;
  nceaL2pct: number;
  nceaL3pct: number;
  nceaUEpct: number;
  depHighPct: number;
  depMean: number;
};

export type MetricDef = {
  id: MetricId;
  label: string;
  short: string;
  get: (p: Place) => number | null | undefined;
  format: (v: number) => string;
  dep?: boolean;
};

export type Source = { label: string; url: string };
