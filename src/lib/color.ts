import type { MetricDef } from "./types";

const LAGOON = [
  [226, 244, 233],
  [170, 238, 196],
  [62, 160, 148],
  [34, 34, 34],
] as const;

/** Official-spirit NZDep sequential: pale cream (least) → burnt orange (most). */
const NZDEP = [
  [255, 247, 237],
  [255, 237, 213],
  [254, 215, 170],
  [253, 186, 116],
  [251, 146, 60],
  [249, 115, 22],
  [234, 88, 12],
  [194, 65, 12],
  [154, 52, 18],
  [124, 45, 18],
] as const;

export const NZDEP_CSS = [
  "#FFF7ED",
  "#FFEDD5",
  "#FED7AA",
  "#FDBA74",
  "#FB923C",
  "#F97316",
  "#EA580C",
  "#C2410C",
  "#9A3412",
  "#7C2D12",
];

export const LAGOON_CSS = ["#E2F4E9", "#AAEEC4", "#3EA094", "#222222"];

function lerpStops(stops: readonly (readonly [number, number, number])[], t: number) {
  const x = Math.max(0, Math.min(1, t));
  const s = x * (stops.length - 1);
  const i = Math.min(Math.floor(s), stops.length - 2);
  const f = s - i;
  const a = stops[i];
  const b = stops[i + 1];
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export function scaleColor(
  vals: number[],
  metric: MetricDef,
): { lo: number; hi: number; color: (v: number) => string; dep: boolean } {
  const dep = !!metric.dep;
  if (!vals.length) {
    return { lo: 0, hi: 1, dep, color: () => "#F8F8F8" };
  }

  if (dep && metric.id === "depMean") {
    return {
      lo: 1,
      hi: 10,
      dep: true,
      color: (v) => lerpStops(NZDEP, (v - 1) / 9),
    };
  }
  if (dep && metric.id === "depHigh") {
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    return {
      lo,
      hi,
      dep: true,
      color: (v) => lerpStops(NZDEP, hi === lo ? 0.5 : (v - lo) / (hi - lo)),
    };
  }

  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return {
    lo,
    hi,
    dep: false,
    color: (v) => lerpStops(LAGOON, hi === lo ? 0.5 : (v - lo) / (hi - lo)),
  };
}
