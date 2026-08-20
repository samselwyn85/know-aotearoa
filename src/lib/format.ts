export function fmt(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-NZ");
}

export function money(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return "$" + Math.round(n).toLocaleString("en-NZ");
}

export function pct(n: number | null | undefined, digits = 1) {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toFixed(digits) + "%";
}

export function oneIn(p: number | null | undefined) {
  if (!p || p <= 0) return null;
  return Math.round(100 / p);
}

export function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function shortPlace(name: string) {
  return name.replace(/ (District|Region|City|Territory)$/, "");
}

export function ordinal(n: number) {
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + "th";
  return n + ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th");
}

export function isRegion(p: { region?: string }) {
  return p.region === undefined;
}
