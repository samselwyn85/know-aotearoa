import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight, MapPinned, Search } from "lucide-react";
import { AuthSlot } from "./auth-slot";
import {
  AgeBands,
  DepScale,
  Dumbbell,
  GdpLine,
  IndustryLollipop,
  LqPills,
  MixDonut,
  MixSlope,
  RankBars,
  Sparkline,
  VsNz,
  Waffle,
  EthnicBars,
} from "./econ-charts";
import {
  AgeCity,
  CountUp,
  GdpTower,
  HouseStreet,
  IslandMark,
  PeopleField,
  SceneStage,
  SplitNames,
  TabRail,
  TugBar,
} from "./scenes";
import {
  allPlaces,
  gdp2025Estimate,
  gdpPath,
  gdpRank,
  growthRank,
  industryRows,
  jobsFmt,
  labour,
  mixIsOfficial,
  mixSource,
  moneyB,
  profileStory,
  specialisations,
  unempFor,
  SNAPSHOT,
  NZ_UNEMP,
  NZ_GDP_2025,
  TABS,
  type ProfileTab,
} from "@/lib/economy";
import { NZ, REGIONS, findBySlug } from "@/lib/places";
import { fmt, isRegion, money, ordinal, pct, shortPlace } from "@/lib/format";
import { placeKind, soWhatLine } from "@/lib/insights";
import { SRC } from "@/lib/sources";
import type { Place } from "@/lib/types";

function Kpi({
  label,
  hero,
  unit,
  cmp,
  note,
  spark,
}: {
  label: string;
  hero: string;
  unit?: string;
  cmp?: string;
  note?: string;
  spark?: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-1 rounded-2xl border border-hair bg-panel p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-bold tracking-wider text-muted uppercase">{label}</div>
        {spark}
      </div>
      <div className="font-mono text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {hero} {unit ? <small className="text-sm font-medium text-muted">{unit}</small> : null}
      </div>
      {cmp ? (
        <div className="w-fit rounded-md bg-kowhai-bg px-2 py-0.5 text-xs font-bold text-kowhai">{cmp}</div>
      ) : null}
      {note ? <p className="text-xs leading-snug text-muted">{note}</p> : null}
    </article>
  );
}

function Read({ children }: { children: ReactNode }) {
  return (
    <div className="room-read mx-auto max-w-[1200px] space-y-6 px-4 py-8 sm:px-6 sm:py-10">{children}</div>
  );
}

function PlaceSearch({ current }: { current: Place }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => {
    const s = q
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    if (!s) return [];
    const fold = (t: string) =>
      t
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return allPlaces()
      .filter((p) => fold(p.name).includes(s) && p.slug !== current.slug)
      .slice(0, 8);
  }, [q, current.slug]);

  return (
    <div className="relative w-full min-w-[200px] max-w-none flex-1 sm:max-w-sm">
      <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted" />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="Switch place…"
        className="min-h-11 w-full rounded-xl border border-hair bg-panel py-2 pr-3 pl-9 text-sm"
        aria-label="Switch place"
        autoComplete="off"
      />
      {open && q.trim() ? (
        <div className="absolute top-full z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-hair bg-panel shadow-[var(--shadow-md)]">
          {hits.length ? (
            hits.map((h) => (
              <button
                key={h.slug}
                type="button"
                className="block w-full px-3 py-2.5 text-left text-sm hover:bg-lagoon-soft"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  void nav({ to: "/profile/$slug", params: { slug: h.slug } });
                  setQ("");
                  setOpen(false);
                }}
              >
                {h.name}
                <span className="ml-2 text-xs text-muted">{isRegion(h) ? "Region" : h.region}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted">No matches</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function EconProfile({ slug, initialTab }: { slug: string; initialTab?: ProfileTab }) {
  const place = findBySlug(slug);
  const [tab, setTab] = useState<ProfileTab>(initialTab && TABS.some((t) => t.id === initialTab) ? initialTab : "overview");
  const [cmpSlug, setCmpSlug] = useState("auckland-region");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const i = TABS.findIndex((t) => t.id === tab);
      if (i < 0) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setTab(TABS[(i + 1) % TABS.length].id);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setTab(TABS[(i - 1 + TABS.length) % TABS.length].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tab]);

  if (!place) {
    return (
      <main className="min-h-dvh bg-paper px-6 py-16 text-ink">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="font-display text-3xl font-medium">Place not found</h1>
          <p className="mt-2 text-sm text-muted">That profile slug isn’t in the 2023 Census snapshot.</p>
          <Link to="/profile" className="mt-6 inline-block font-semibold text-lagoon">
            Browse profiles
          </Link>
        </div>
      </main>
    );
  }

  const region = isRegion(place);
  const path = gdpPath(place);
  const industries = industryRows(place);
  const spec = specialisations(place);
  const lab = labour(place);
  const unemp = unempFor(place);
  const g25 = gdp2025Estimate(place);
  const gdpR = gdpRank(place);
  const growR = growthRank(place);
  const parentRegion = region ? place : REGIONS.find((r) => r.name === place.region);
  const cmp =
    findBySlug(cmpSlug) && findBySlug(cmpSlug)?.slug !== place.slug
      ? findBySlug(cmpSlug)!
      : REGIONS.find((r) => r.slug !== (region ? place.slug : parentRegion?.slug)) ?? REGIONS[1];

  const young = place.p0_14;
  const older = place.p65 ?? NZ.p65;
  const working = young != null ? 100 - young - older : undefined;

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-hair bg-panel/90 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3">
          <Link to="/profile" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-lagoon">
            <ArrowLeft className="size-4" />
            All profiles
          </Link>
          <PlaceSearch current={place} />
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Link
              to="/place/$slug"
              params={{ slug: place.slug }}
              className="hidden min-h-11 items-center gap-1.5 rounded-full border border-hair px-3 py-2 text-sm font-semibold text-ink hover:border-lagoon hover:text-lagoon sm:inline-flex"
            >
              <MapPinned className="size-4" />
              Map
            </Link>
            <AuthSlot />
          </div>
        </div>
      </header>

      <section className="paper-grain relative overflow-hidden bg-ink text-panel">
        <div className="pointer-events-none absolute -right-12 -bottom-20 h-[130%] w-[48%] text-lagoon opacity-45 sm:w-[32%]">
          <IslandMark ink />
        </div>
        <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="kicker text-lagoon-mid">
              <Link to="/" className="hover:text-panel">
                Aotearoa
              </Link>
              {!region && parentRegion ? (
                <>
                  {" · "}
                  <Link to="/profile/$slug" params={{ slug: parentRegion.slug }} className="hover:text-panel">
                    {parentRegion.name}
                  </Link>
                </>
              ) : null}
            </p>
            <h1 className="display-mega mt-2 max-w-[16ch]">{place.name}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-lagoon-mid sm:text-base">{soWhatLine(place)}</p>
          </div>
          <div className="flex flex-wrap gap-6 sm:gap-8">
            {place.gdpPC != null ? (
              <div>
                <div className="font-display text-3xl leading-none tracking-tight tabular-nums sm:text-4xl">
                  <CountUp value={place.gdpPC} format={(n) => money(Math.round(n))} />
                </div>
                <p className="mt-1 text-xs text-lagoon-mid sm:text-sm">GDP per person</p>
              </div>
            ) : null}
            <div>
              <div className="font-display text-3xl leading-none tracking-tight tabular-nums sm:text-4xl">
                <CountUp value={place.pop23} format={(n) => fmt(Math.round(n))} />
              </div>
              <p className="mt-1 text-xs text-lagoon-mid sm:text-sm">people · 2023 Census</p>
            </div>
            <div>
              <div className="font-display text-3xl leading-none tracking-tight tabular-nums sm:text-4xl">
                <CountUp value={unemp.v} format={(n) => n.toFixed(1) + "%"} />
              </div>
              <p className="mt-1 text-xs text-lagoon-mid sm:text-sm">unemployment</p>
            </div>
          </div>
        </div>
      </section>

      <TabRail tab={tab} onTab={setTab} />

      <main key={tab} className="scene-enter">
        {tab === "overview" ? (
          <Overview
            place={place}
            lab={lab}
            unemp={unemp}
            g25={g25}
            gdpR={gdpR}
            growR={growR}
            path={path}
            industries={industries}
            spec={spec}
            onOpen={(id) => setTab(id)}
          />
        ) : null}
        {tab === "economy" ? (
          <Economy place={place} path={path} industries={industries} spec={spec} g25={g25} />
        ) : null}
        {tab === "labour" ? <Labour place={place} lab={lab} unemp={unemp} industries={industries} /> : null}
        {tab === "people" ? <People place={place} young={young} working={working} older={older} /> : null}
        {tab === "housing" ? <Housing place={place} /> : null}
        {tab === "compare" ? <Compare place={place} cmp={cmp} onCmp={setCmpSlug} /> : null}
      </main>

      <footer className="mt-4 border-t border-hair bg-panel px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[1200px] text-sm leading-relaxed text-muted">
          <h3 className="mb-2 font-sans text-base font-semibold text-ink">Notes & sources</h3>
          <p>
            This profile is Know Aotearoa’s public-access dashboard — inspired by Infometrics’ Regional Economic
            Profile layout, not a copy of their licensed model. Population, age, ethnicity and dwellings are Stats NZ
            2023 Census (usually resident; randomly rounded to base 3). Regional GDP is Stats NZ’s YE Mar 2025
            release: 2024 is revised, 2025 is provisional. District GDP is MBIE modelled (experimental) — not a Stats
            NZ territorial-authority account. Regional industry shares are official Stats NZ GDP by industry. District
            industry shares tilt the parent-region official mix and are labelled as illustrative. Unemployment is HLFS
            June 2026: the NZ rate is seasonally adjusted; regional rates are Table 6 and are not seasonally adjusted.
            Some regions are published only as combined groups.
          </p>
          <p className="mt-2 font-mono text-xs">
            Snapshot {SNAPSHOT.asAt} · census is not a live feed · this page stores nothing and tracks nothing.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Overview({
  place,
  lab,
  unemp,
  g25,
  gdpR,
  growR,
  path,
  industries,
  spec,
  onOpen,
}: {
  place: Place;
  lab: ReturnType<typeof labour>;
  unemp: { v: number; note: string };
  g25: ReturnType<typeof gdp2025Estimate>;
  gdpR: ReturnType<typeof gdpRank>;
  growR: ReturnType<typeof growthRank>;
  path: ReturnType<typeof gdpPath>;
  industries: ReturnType<typeof industryRows>;
  spec: ReturnType<typeof specialisations>;
  onOpen: (t: ProfileTab) => void;
}) {
  const k = placeKind(place);
  const muralCands = [
    place.depHighPct != null
      ? { value: place.depHighPct, nz: NZ.depHighPct, label: "live in the most deprived neighbourhoods", tone: "dep" as const }
      : null,
    place.maoriEth != null
      ? { value: place.maoriEth, nz: NZ.maoriEth, label: "are Māori (ethnicity)", tone: "lagoon" as const }
      : null,
    place.p0_14 != null
      ? { value: place.p0_14, nz: NZ.p0_14, label: "are aged 0–14", tone: "lagoon" as const }
      : null,
    place.p65 != null
      ? { value: place.p65, nz: NZ.p65, label: "are aged 65+", tone: "kowhai" as const }
      : null,
  ].filter((x): x is { value: number; nz: number; label: string; tone: "lagoon" | "dep" | "kowhai" } => x != null);
  const mural = [...muralCands].sort((a, b) => Math.abs(b.value - b.nz) - Math.abs(a.value - a.nz))[0];
  return (
    <>
      {mural ? (
        <SceneStage
          index={1}
          reo="Tirohanga · of 100 people"
          title={<h2 className="display-scene">A room of a hundred people here.</h2>}
          lede={`Of 100 people in ${shortPlace(place.name)}, about ${Math.round(mural.value)} ${mural.label}. The filled figures are them. The faint ones are everyone else.`}
          tone="lagoon"
        >
          <PeopleField value={mural.value} label={mural.label} compare={mural.nz} tone={mural.tone} />
        </SceneStage>
      ) : (
        <SceneStage index={1} reo="Tirohanga" title={<h2 className="display-scene">{shortPlace(place.name)}</h2>} lede={profileStory(place)} />
      )}
      <Read>
        <div className="stagger-in grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Kpi
            label="GDP YE Mar 2024"
            hero={moneyB(place.gdpB)}
            cmp={place.gdpShare != null ? place.gdpShare.toFixed(1) + "% of NZ" : undefined}
            note={isRegion(place) ? SRC.rgdp.label : SRC.tagdp.label}
            spark={path.length ? <Sparkline values={path.map((d) => d.local)} /> : undefined}
          />
          <Kpi
            label="GDP per person"
            hero={money(place.gdpPC)}
            cmp={gdpR ? ordinal(gdpR.rank) + " of " + gdpR.n + " " + k.words : undefined}
          />
          <Kpi
            label="Population"
            hero={fmt(place.pop23)}
            cmp={`${place.popChg >= 0 ? "↑" : "↓"}${Math.abs(place.popChg).toFixed(1)}% since 2018`}
            note={growR ? ordinal(growR.rank) + " fastest-growing " + k.word : undefined}
          />
          <Kpi
            label={lab.official ? "Employed (HLFS)" : "Filled jobs"}
            hero={jobsFmt(lab.employed)}
            cmp={pct(lab.participation) + " participation"}
            note={lab.official ? "HLFS Jun 2026, not seasonally adjusted" : "Census age structure × regional unemployment"}
          />
          <Kpi
            label="Unemployment"
            hero={unemp.v.toFixed(1) + "%"}
            cmp={"NZ " + NZ_UNEMP.v.toFixed(1) + "%"}
            note={unemp.note}
          />
          <Kpi
            label={isRegion(place) ? "GDP YE Mar 2025" : "2025, scaled"}
            hero={g25 ? moneyB(g25.b) : "—"}
            cmp={g25 ? `${g25.growth >= 0 ? "+" : ""}${g25.growth.toFixed(1)}%` : undefined}
            note={
              isRegion(place) ? "Stats NZ regional GDP, March 2026 release" : "2024 TA GDP × parent-region growth"
            }
          />
        </div>

        {path.length ? <GdpLine data={path} localName={shortPlace(place.name)} /> : null}

        <VsNz
          rows={[
            ...(place.gdpPC != null ? [{ label: "GDP per person", local: place.gdpPC, nz: NZ.gdpPC, format: money }] : []),
            {
              label: "Population growth 2018–23",
              local: place.popChg,
              nz: NZ.chg,
              format: (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`,
            },
            ...(place.maoriEth != null
              ? [{ label: "Māori ethnicity", local: place.maoriEth, nz: NZ.maoriEth, format: pct }]
              : []),
            ...(place.p65 != null ? [{ label: "Aged 65+", local: place.p65, nz: NZ.p65, format: pct }] : []),
            ...(place.depHighPct != null
              ? [{ label: "Most deprived SA1s", local: place.depHighPct, nz: NZ.depHighPct, format: pct }]
              : []),
            { label: "Unemployment", local: unemp.v, nz: NZ_UNEMP.v, format: (n) => n.toFixed(1) + "%" },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <IndustryLollipop rows={industries} limit={8} />
          <MixDonut rows={industries} name={place.name} />
        </div>

        <MixSlope rows={industries} name={place.name} />
        <p className="text-sm leading-relaxed text-muted">{mixSource(place).note}</p>

        <section className="rounded-2xl border border-hair bg-panel p-4 shadow-[var(--shadow-sm)]">
          <h3 className="font-display text-lg font-medium">Where this place is distinctive</h3>
          <p className="mt-1 mb-3 text-sm text-muted">
            Location quotient above 1.25 — more concentrated here than nationally.
          </p>
          {spec.length ? (
            <LqPills rows={spec} />
          ) : (
            <p className="text-sm text-muted">Close to the national mix on these industries.</p>
          )}
          <button
            type="button"
            className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-lagoon"
            onClick={() => onOpen("economy")}
          >
            Full industry table <ChevronRight className="size-4" />
          </button>
        </section>
      </Read>
    </>
  );
}

function Economy({
  place,
  path,
  industries,
  spec,
  g25,
}: {
  place: Place;
  path: ReturnType<typeof gdpPath>;
  industries: ReturnType<typeof industryRows>;
  spec: ReturnType<typeof specialisations>;
  g25: ReturnType<typeof gdp2025Estimate>;
}) {
  const k = placeKind(place);
  const peers = [...k.peers]
    .filter((p) => p.gdpPC != null)
    .sort((a, b) => (b.gdpPC ?? 0) - (a.gdpPC ?? 0))
    .slice(0, 8);
  return (
    <>
      <SceneStage
        index={2}
        reo="Ōhanga · production"
        title={
          <h2 className="display-bleed tabular-nums">
            {place.gdpB != null ? <CountUp value={place.gdpB} format={(n) => moneyB(n)} /> : "—"}
          </h2>
        }
        lede={
          isRegion(place)
            ? `Stats NZ regional GDP, year ended March 2024 (revised). ${g25 ? `2025 ${g25.growth >= 0 ? "up" : "down"} ${Math.abs(g25.growth).toFixed(1)}% versus NZ +${NZ_GDP_2025.growth.toFixed(1)}%.` : ""}`
            : "District GDP is MBIE’s experimental modelled estimate. 2025 is that figure grown at the parent region’s official rate."
        }
        tone="ink"
      >
        <GdpTower rows={industries} formatB={moneyB} />
      </SceneStage>
      <Read>
        {path.length ? <GdpLine data={path} localName={shortPlace(place.name)} /> : null}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <IndustryLollipop rows={industries} limit={15} />
          <MixDonut rows={industries} name={place.name} />
        </div>
        <MixSlope rows={industries} name={place.name} />
        <p className="text-sm leading-relaxed text-muted">{mixSource(place).note}</p>
        <section className="rounded-2xl border border-hair bg-panel p-4">
          <h3 className="font-display text-lg font-medium">GDP per person among {k.words}</h3>
          <p className="mt-1 mb-3 text-sm text-muted">Highest eight, YE Mar 2024 (revised).</p>
          <RankBars rows={peers.map((p) => ({ name: p.name, value: p.gdpPC ?? 0 }))} format={money} highlight={place.name} />
        </section>
        {spec.length ? (
          <section>
            <h3 className="mb-3 font-display text-lg font-medium">Specialisations</h3>
            <LqPills rows={spec} />
          </section>
        ) : null}
        <div className="overflow-x-auto rounded-2xl border border-hair">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-lagoon-soft text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-semibold">Industry</th>
                <th className="px-3 py-2 font-semibold">Share</th>
                <th className="px-3 py-2 font-semibold">NZ share</th>
                <th className="px-3 py-2 font-semibold">LQ</th>
                <th className="px-3 py-2 font-semibold">GDP</th>
                <th className="px-3 py-2 font-semibold">{mixIsOfficial(place) ? "Jobs (scaled)" : "Jobs (ind.)"}</th>
              </tr>
            </thead>
            <tbody>
              {industries.map((r) => (
                <tr key={r.id} className="border-t border-hair">
                  <td className="px-3 py-2">{r.label}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{r.share.toFixed(1)}%</td>
                  <td className="px-3 py-2 font-mono tabular-nums text-muted">{r.nzShare.toFixed(1)}%</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{r.lq.toFixed(2)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{moneyB(r.gdpB)}</td>
                  <td className="px-3 py-2 font-mono tabular-nums">{jobsFmt(r.jobs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Read>
    </>
  );
}

function Labour({
  place,
  lab,
  unemp,
  industries,
}: {
  place: Place;
  lab: ReturnType<typeof labour>;
  unemp: { v: number; note: string };
  industries: ReturnType<typeof industryRows>;
}) {
  const jobRows = [...industries].sort((a, b) => b.jobs - a.jobs).slice(0, 8);
  return (
    <>
      <SceneStage
        index={3}
        reo="Mahi · labour force"
        title={<h2 className="display-scene">Of 100 people in the labour force.</h2>}
        lede={unemp.note}
        tone="kowhai"
      >
        <PeopleField value={unemp.v} label="unemployed" compare={NZ_UNEMP.v} tone="kowhai" />
      </SceneStage>
      <Read>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi
            label={lab.ageBasis === "15+" ? "Working age (15+)" : "Working age (15–64)"}
            hero={fmt(Math.round(lab.workingAge))}
            note={lab.official ? "HLFS working-age population" : undefined}
          />
          <Kpi
            label="Participation"
            hero={pct(lab.participation)}
            note={lab.official ? "HLFS Table 6" : "Indicative, age-adjusted"}
          />
          <Kpi
            label={lab.official ? "Employed" : "Filled jobs"}
            hero={jobsFmt(lab.employed)}
            note={lab.official ? "HLFS Table 6" : "Indicative"}
          />
          <Kpi label="Unemployment" hero={unemp.v.toFixed(1) + "%"} note={unemp.note} />
        </div>
        <p className="text-sm leading-relaxed text-muted">
          {lab.official
            ? "These labour figures are Stats NZ’s Household Labour Force Survey Table 6 for this regional council area, June 2026 quarter, not seasonally adjusted. The national 5.6% rate is seasonally adjusted — they are not the same series."
            : "Stats NZ’s Household Labour Force Survey publishes unemployment for regional council areas — not for every territorial authority. This district uses the parent region’s official HLFS unemployment. Working-age is the 2023 Census 15–64 count. Participation is age-adjusted and indicative."}{" "}
          {lab.productivity ? `Implied GDP per filled job: ${money(lab.productivity)}.` : null}
        </p>
        <section className="rounded-2xl border border-hair bg-panel p-4">
          <h3 className="font-display text-lg font-medium">Jobs by industry</h3>
          <p className="mt-1 mb-3 text-sm text-muted">Largest eight, indicative filled jobs.</p>
          <RankBars
            rows={jobRows.map((r) => ({ name: r.short, value: r.jobs }))}
            format={(v) => jobsFmt(v)}
            highlight=""
          />
        </section>
        {place.nceaL2pct != null || place.parentNceaL2pct != null ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Kpi
              label="Year 12 NCEA Level 2"
              hero={pct(place.nceaL2pct ?? place.parentNceaL2pct)}
              cmp={"NZ " + pct(NZ.nceaL2pct)}
              note={
                place.nceaL2pct != null
                  ? "NZQA 2025, enrolment-based"
                  : `NZQA publishes this for ${place.parentNceaName}, not this TA`
              }
            />
            {place.schoolRoll != null ? (
              <Kpi
                label="School roll"
                hero={fmt(place.schoolRoll)}
                note={`MoE directory · 1 July ${place.schoolRollYear ?? 2026}`}
              />
            ) : null}
          </div>
        ) : null}
      </Read>
    </>
  );
}

function People({
  place,
  young,
  working,
  older,
}: {
  place: Place;
  young?: number;
  working?: number;
  older: number;
}) {
  const ethnic = [
    { label: "Māori", local: place.maoriEth ?? 0, nz: NZ.maoriEth },
    { label: "European", local: place.euro ?? 0, nz: NZ.euro },
    { label: "Pacific", local: place.pac ?? 0, nz: NZ.pac },
    { label: "Asian", local: place.asian ?? 0, nz: NZ.asian },
  ].filter((r) => r.local > 0);
  return (
    <>
      <SceneStage
        index={4}
        reo="Tangata · who lives here"
        title={<h2 className="display-scene">Age, written as a city.</h2>}
        lede={`${shortPlace(place.name)} · 2023 Census usually resident. Median age ${place.medAge != null ? place.medAge.toFixed(1) : "—"} (NZ ${NZ.medAge.toFixed(1)}). Each building is an age band. The windows light as the room opens.`}
        tone="lagoon"
      >
        <AgeCity young={young} working={working} older={older} />
      </SceneStage>
      <Read>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi
            label="Population 2023"
            hero={fmt(place.pop23)}
            cmp={`${place.popChg >= 0 ? "+" : ""}${place.popChg.toFixed(1)}% vs 2018`}
          />
          <Kpi
            label="Median age"
            hero={place.medAge != null ? place.medAge.toFixed(1) : "—"}
            unit="years"
            cmp={"NZ " + NZ.medAge.toFixed(1)}
          />
          {young != null ? <Kpi label="Aged 0–14" hero={pct(young)} cmp={"NZ " + pct(NZ.p0_14)} /> : null}
          <Kpi label="Aged 65+" hero={pct(older)} cmp={"NZ " + pct(NZ.p65)} />
        </div>
        <AgeBands
          name={shortPlace(place.name)}
          local={{ young, working, older }}
          nz={{ young: NZ.p0_14, working: 100 - NZ.p0_14 - NZ.p65, older: NZ.p65 }}
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {place.maoriEth != null ? (
            <Waffle value={place.maoriEth} label="Māori ethnicity" compare={NZ.maoriEth} />
          ) : null}
          {place.p65 != null ? <Waffle value={place.p65} label="Aged 65+" compare={NZ.p65} /> : null}
        </div>
        {ethnic.length > 1 ? <EthnicBars rows={ethnic} /> : null}
        {place.maoriEth != null ? (
          <p className="text-sm text-muted">
            Māori (ethnicity) are {pct(place.maoriEth)} of people here, versus {pct(NZ.maoriEth)} nationally.
            {place.maoriDesc != null ? ` Māori descent: ${pct(place.maoriDesc)}.` : null}
          </p>
        ) : null}
      </Read>
    </>
  );
}

function Housing({ place }: { place: Place }) {
  const peoplePerDwelling = place.dw23 && place.dw23 > 0 ? place.pop23 / place.dw23 : null;
  const nzPpd = NZ.dw23 ? NZ.pop23 / NZ.dw23 : null;
  return (
    <>
      <SceneStage
        index={5}
        reo="Kāinga · housing & deprivation"
        title={<h2 className="display-scene">A street of ten houses.</h2>}
        lede="Each house is ten of a hundred people. The darker houses live in the most deprived neighbourhoods on NZDep2023 — an area index, not a judgement of any one person."
        tone="dep"
      >
        {place.depHighPct != null ? (
          <HouseStreet
            value={place.depHighPct}
            label="in the most deprived areas"
            compare={NZ.depHighPct}
          />
        ) : (
          <PeopleField value={0} label="NZDep is not published for this geography" />
        )}
      </SceneStage>
      <Read>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Kpi
            label="Private dwellings"
            hero={fmt(place.dw23)}
            cmp={
              place.dwChg != null
                ? `${place.dwChg >= 0 ? "+" : ""}${place.dwChg.toFixed(1)}% since 2018`
                : undefined
            }
          />
          <Kpi
            label="People per dwelling"
            hero={peoplePerDwelling ? peoplePerDwelling.toFixed(2) : "—"}
            cmp={nzPpd ? "NZ " + nzPpd.toFixed(2) : undefined}
          />
          <Kpi
            label="Most deprived SA1s"
            hero={pct(place.depHighPct)}
            cmp={"NZ " + pct(NZ.depHighPct)}
            note="Share of people in NZDep2023 deciles 8–10"
          />
        </div>
        {place.depMean != null ? (
          <DepScale local={place.depMean} nz={NZ.depMean} name={shortPlace(place.name)} />
        ) : null}
        {place.depHighPct != null ? (
          <VsNz
            rows={[
              { label: "Most deprived SA1s", local: place.depHighPct, nz: NZ.depHighPct, format: pct },
              ...(place.depMean != null
                ? [{ label: "Mean NZDep decile", local: place.depMean, nz: NZ.depMean, format: (n: number) => n.toFixed(1) }]
                : []),
            ]}
          />
        ) : null}
        <p className="text-sm leading-relaxed text-muted">
          Occupied and unoccupied private dwellings, 2023 Census. NZDep2023 is an area index from the University of
          Otago (October 2024). House values are not in this public snapshot.
        </p>
      </Read>
    </>
  );
}

function Compare({
  place,
  cmp,
  onCmp,
}: {
  place: Place;
  cmp: Place;
  onCmp: (slug: string) => void;
}) {
  const a = labour(place);
  const b = labour(cmp);
  const ia = industryRows(place);
  const ib = industryRows(cmp);
  const combined = ia.slice(0, 8).map((row) => ({
    label: row.short,
    a: row.share,
    b: ib.find((x) => x.id === row.id)?.share ?? 0,
    format: (n: number) => n.toFixed(1) + "%",
  }));
  const peers = allPlaces().filter((p) => p.slug !== place.slug);
  const headline = [
    ...(place.gdpPC != null && cmp.gdpPC != null
      ? [{ label: "GDP per person", a: place.gdpPC, b: cmp.gdpPC, format: money }]
      : []),
    { label: "Population", a: place.pop23, b: cmp.pop23, format: fmt },
    { label: "Growth 2018–23", a: place.popChg, b: cmp.popChg, format: (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%` },
  ];
  return (
    <>
      <SceneStage
        index={6}
        reo="Whakatairite · side by side"
        title={<h2 className="sr-only">Compare {place.name} with {cmp.name}</h2>}
        tone="paper"
      >
        <SplitNames
          a={place.name}
          b={cmp.name}
          aSub={place.gdpPC != null ? money(place.gdpPC) + " / person" : fmt(place.pop23) + " people"}
          bSub={cmp.gdpPC != null ? money(cmp.gdpPC) + " / person" : fmt(cmp.pop23) + " people"}
        />
        {place.gdpPC != null && cmp.gdpPC != null ? (
          <TugBar aLabel={shortPlace(place.name)} bLabel={shortPlace(cmp.name)} a={place.gdpPC} b={cmp.gdpPC} format={money} />
        ) : (
          <TugBar aLabel={shortPlace(place.name)} bLabel={shortPlace(cmp.name)} a={place.pop23} b={cmp.pop23} format={fmt} />
        )}
      </SceneStage>
      <Read>
        <label className="block text-sm font-semibold">
          Compare with
          <select
            className="mt-1 min-h-11 w-full max-w-md rounded-xl border border-hair bg-panel px-3 py-2 text-sm font-medium"
            value={cmp.slug}
            onChange={(e) => onCmp(e.target.value)}
          >
            {peers.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {headline.length ? <Dumbbell aName={place.name} bName={cmp.name} rows={headline} /> : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <VsBlock
            title={place.name}
            rows={[
              ["Population", fmt(place.pop23)],
              ["Growth 2018–23", `${place.popChg >= 0 ? "+" : ""}${place.popChg.toFixed(1)}%`],
              ["GDP", moneyB(place.gdpB)],
              ["GDP / person", money(place.gdpPC)],
              ["Unemployment", unempFor(place).v.toFixed(1) + "%"],
              ["Jobs", jobsFmt(a.employed)],
              ["Median age", place.medAge != null ? place.medAge.toFixed(1) : "—"],
              ["Māori ethnicity", pct(place.maoriEth)],
            ]}
          />
          <VsBlock
            title={cmp.name}
            rows={[
              ["Population", fmt(cmp.pop23)],
              ["Growth 2018–23", `${cmp.popChg >= 0 ? "+" : ""}${cmp.popChg.toFixed(1)}%`],
              ["GDP", moneyB(cmp.gdpB)],
              ["GDP / person", money(cmp.gdpPC)],
              ["Unemployment", unempFor(cmp).v.toFixed(1) + "%"],
              ["Jobs", jobsFmt(b.employed)],
              ["Median age", cmp.medAge != null ? cmp.medAge.toFixed(1) : "—"],
              ["Māori ethnicity", pct(cmp.maoriEth)],
            ]}
          />
        </div>
        <Dumbbell aName={place.name} bName={cmp.name} rows={combined} />
        <p className="text-sm text-muted">
          Industry rows use this place’s top eight industries, with the comparison place’s share of the same industries
          beside them.
        </p>
      </Read>
    </>
  );
}

function VsBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <section className="rounded-2xl border border-hair bg-panel p-4">
      <h3 className="font-display text-lg font-medium">{title}</h3>
      <dl className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-3 border-b border-dashed border-hair pb-2 text-sm last:border-0"
          >
            <dt className="text-muted">{k}</dt>
            <dd className="font-mono font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function EconPicker() {
  const featured = [
    {
      slug: "wellington-city",
      kicker: "The Infometrics example",
      line: "Highest GDP per person among the metros — public administration and professional services.",
    },
    {
      slug: "auckland",
      kicker: "The scale play",
      line: "About 38% of national GDP. Diverse, young, and Asia-Pacific facing.",
    },
    {
      slug: "christchurch-city",
      kicker: "South Island production",
      line: "Rebuild-era construction still shows. Health and professional services around it.",
    },
    {
      slug: "queenstown-lakes-district",
      kicker: "Visitor economy",
      line: "Hospitality, construction and property — and the fastest population boom of the big districts.",
    },
    {
      slug: "gisborne-district",
      kicker: "Young and Māori",
      line: "Primary industries, a young age structure, and high deprivation on NZDep2023.",
    },
    {
      slug: "selwyn-district",
      kicker: "Fastest-growing district",
      line: "+29% people from 2018–23. Construction and primary, on Christchurch’s southern edge.",
    },
    {
      slug: "taranaki-region",
      kicker: "Energy and dairy",
      line: "Utilities and manufacturing punch above the region’s population.",
    },
    {
      slug: "southland-region",
      kicker: "Highest regional GDP per person, 2025",
      line: "Primary and manufacturing. +9.8% regional GDP in the year to March 2025.",
    },
  ];
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const s = q
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    if (!s) return [];
    const fold = (t: string) =>
      t
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return allPlaces()
      .filter((p) => fold(p.name).includes(s))
      .slice(0, 12);
  }, [q]);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-hair bg-panel/90 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-[1200px] items-center gap-3">
          <div className="min-w-0">
            <p className="kicker text-lagoon">Regional Economic Profile</p>
            <h1 className="font-display text-xl font-medium tracking-tight sm:text-2xl">Know Aotearoa</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-hair px-3 py-2 text-sm font-semibold hover:border-lagoon hover:text-lagoon"
            >
              <MapPinned className="size-4" />
              Map
            </Link>
            <AuthSlot />
          </div>
        </div>
      </header>
      <section className="paper-grain relative overflow-hidden bg-ink text-panel">
        <div className="pointer-events-none absolute inset-y-0 right-[-8%] hidden w-[46%] text-lagoon opacity-50 sm:block">
          <IslandMark ink />
        </div>
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20">
          <p className="kicker text-lagoon-mid">Tirohanga whānui · six rooms</p>
          <h2 className="display-bleed mt-4 max-w-[12ch]">Walk a local economy.</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-lagoon-mid">
            GDP, industry mix, labour, people and housing — every region and district. Official Stats NZ and MBIE
            numbers, drawn as rooms you can walk through.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {TABS.map((t, i) => (
              <div key={t.id}>
                <p className="font-mono text-[0.65rem] tabular-nums text-lagoon-mid">0{i + 1}</p>
                <p className="font-display text-xl font-medium">{t.reo}</p>
                <p className="text-xs font-semibold tracking-wider text-lagoon-mid uppercase">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Wellington City, Selwyn, Gisborne…"
            className="min-h-11 w-full rounded-xl border border-hair bg-panel py-2.5 pr-3 pl-9 text-sm"
            aria-label="Search places"
          />
          {q.trim() && hits.length ? (
            <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-hair bg-panel shadow-[var(--shadow-md)]">
              {hits.map((h) => (
                <Link
                  key={h.slug}
                  to="/profile/$slug"
                  params={{ slug: h.slug }}
                  className="block px-3 py-2.5 text-sm hover:bg-lagoon-soft"
                >
                  {h.name}
                  <span className="ml-2 text-xs text-muted">{isRegion(h) ? "Region" : h.region}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((f) => {
            const p = findBySlug(f.slug);
            if (!p) return null;
            return (
              <Link
                key={f.slug}
                to="/profile/$slug"
                params={{ slug: f.slug }}
                className="group flex min-h-11 flex-col rounded-sheet border border-hair bg-panel p-5 shadow-[var(--shadow-sm)] transition hover:-translate-y-0.5 hover:border-lagoon hover:shadow-[var(--shadow-md)]"
              >
                <div className="kicker text-lagoon">{f.kicker}</div>
                <h3 className="mt-2 font-display text-xl font-medium">{p.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-snug text-muted">{f.line}</p>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <div className="font-mono text-sm font-semibold tabular-nums">
                    {money(p.gdpPC)}{" "}
                    <span className="font-sans text-xs font-medium text-muted">GDP / person</span>
                  </div>
                  {gdpPath(p).length ? <Sparkline values={gdpPath(p).map((d) => d.local)} /> : null}
                </div>
              </Link>
            );
          })}
        </div>
        <p className="mt-8 text-sm text-muted">
          Or open any place from the{" "}
          <Link to="/" className="font-semibold text-lagoon">
            map explorer
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
