import type { Place } from "./types";
import { NZ, REGIONS, DISTRICTS } from "./places";
import { cap, money, ordinal, shortPlace } from "./format";

export function pcRel(pc: number | null | undefined) {
  if (pc == null) return "";
  const d = Math.round((pc / NZ.gdpPC - 1) * 100);
  if (d === 0) return "matches NZ";
  return d > 0 ? d + "% above NZ" : Math.abs(d) + "% below NZ";
}

export function chgRel(local: number, national: number) {
  const d = local - national;
  if (Math.abs(d) < 0.3) return "about the same as NZ";
  return d > 0 ? "faster than NZ" : "slower than NZ";
}

export function rankOf(
  row: Place,
  peers: Place[],
  get: (p: Place) => number | null | undefined,
  desc: boolean,
) {
  const val = get(row);
  if (val == null) return null;
  const vals = peers.map(get).filter((v): v is number => v != null);
  if (vals.length < 2) return null;
  const better = vals.filter((v) => (desc ? v > val : v < val)).length;
  return { rank: better + 1, n: vals.length, val };
}

export function soWhatLine(g: Place) {
  const growFast = g.popChg > NZ.chg + 0.3;
  const growSlow = g.popChg < NZ.chg - 0.3;
  const shrink = g.popChg < 0;
  let grow: string | null = null;
  if (shrink) grow = "shrinking";
  else if (growFast) grow = "growing faster than NZ";
  else if (growSlow) grow = "slower-growing than NZ";

  let gdp: string | null = null;
  if (g.gdpPC != null) {
    const d = Math.round((g.gdpPC / NZ.gdpPC - 1) * 100);
    if (d > 0) gdp = "higher GDP per person";
    else if (d < 0) gdp = "lower GDP per person";
  }

  let age: string | null = null;
  if (g.medAge != null && NZ.medAge != null) {
    if (g.medAge - NZ.medAge > 1) age = "older";
    else if (NZ.medAge - g.medAge > 1) age = "younger";
  }

  if (age && grow && gdp) return cap(age) + " and " + grow + ", with " + gdp + ".";
  if (age && grow) return cap(age) + " and " + grow + ".";
  if (grow && gdp) return cap(grow) + ", with " + gdp + ".";
  if (age && gdp) return cap(age) + ", with " + gdp + ".";
  if (grow) return cap(grow) + ".";
  if (gdp) return "GDP per person is " + pcRel(g.gdpPC) + ".";
  if (age) return cap(age) + " than the national median.";
  return "Close to the national picture on the measures shown here.";
}

export function placeKind(g: Place) {
  const region = g.region === undefined;
  return {
    isRegion: region,
    word: region ? "region" : "district",
    words: region ? "regions" : "districts",
    line: region ? `${g.island ?? "Region"} · region` : `District · ${g.region}`,
    peers: region ? REGIONS : DISTRICTS,
  };
}

export function postcardChips(g: Place) {
  const k = placeKind(g);
  const chips: string[] = [];
  const grow = rankOf(g, k.peers, (r) => r.popChg, true);
  if (grow) {
    chips.push(
      grow.rank === 1
        ? "Fastest-growing " + k.word
        : ordinal(grow.rank) + " fastest-growing " + k.word,
    );
  }
  const maori = rankOf(g, k.peers, (r) => r.maoriEth, true);
  if (maori) chips.push("Māori share " + ordinal(maori.rank) + " of " + maori.n);
  if (g.medAge != null && NZ.medAge != null) {
    if (g.medAge >= NZ.medAge) {
      const age = rankOf(g, k.peers, (r) => r.medAge, true);
      if (age) chips.push(ordinal(age.rank) + " oldest " + k.word);
    } else {
      const young = rankOf(g, k.peers, (r) => r.medAge, false);
      if (young) chips.push(ordinal(young.rank) + " youngest " + k.word);
    }
  }
  if (g.gdpPC != null && NZ.gdpPC != null) {
    if (g.gdpPC >= NZ.gdpPC) {
      const gdp = rankOf(g, k.peers, (r) => r.gdpPC, true);
      if (gdp) chips.push(ordinal(gdp.rank) + " highest GDP per person");
    } else {
      const low = rankOf(g, k.peers, (r) => r.gdpPC, false);
      if (low) chips.push(ordinal(low.rank) + " lowest GDP per person");
    }
  }
  return chips;
}

export function swarmCaption(name: string, v: number, med: number, label: string, words: string) {
  const who = shortPlace(name);
  if (v > med) return `${who}'s ${label} is higher than most ${words}.`;
  if (v < med) return `${who}'s ${label} is lower than most ${words}.`;
  return `${who}'s ${label} is around the middle.`;
}

export { money };
