import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { NZ, LIFE, NZ_LE, REGIONS } from "@/lib/places";
import { fmt, isRegion, money, oneIn, pct } from "@/lib/format";
import { chgRel, pcRel, soWhatLine } from "@/lib/insights";
import { SRC } from "@/lib/sources";
import { useExplorer } from "@/lib/store";
import type { Place, Source, ThemeId } from "@/lib/types";
import { Beeswarm } from "./beeswarm";
import { VsNz } from "./econ-charts";
import { unempFor, NZ_UNEMP } from "@/lib/economy";
import { cn } from "@/lib/utils";

const THEMES: { id: ThemeId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "people", label: "People" },
  { id: "maori", label: "Māori" },
  { id: "economy", label: "Economy" },
  { id: "housing", label: "Housing" },
  { id: "education", label: "Education" },
  { id: "health", label: "Health" },
];

function Card({
  label,
  hero,
  unit,
  cmp,
  fr,
  src,
  href,
}: {
  label: string;
  hero: string;
  unit?: string;
  cmp?: string;
  fr?: string;
  src: Source;
  href?: string;
}) {
  const inner = (
    <>
      <div className="text-xs font-bold tracking-wider text-muted uppercase">{label}</div>
      <div className="font-mono text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {hero}{" "}
        {unit ? <small className="text-sm font-medium text-muted">{unit}</small> : null}
      </div>
      {cmp ? (
        <div className="w-fit rounded-md bg-kowhai-bg px-2 py-0.5 text-xs font-bold text-kowhai">{cmp}</div>
      ) : null}
      {fr ? <p className="text-sm leading-snug text-muted">{fr}</p> : null}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-hair pt-2 text-xs">
        <span className="font-bold text-ok">Verified</span>
        <span className="truncate font-semibold text-lagoon">{src.label}</span>
      </div>
    </>
  );
  const cls =
    "card-enter flex flex-col gap-1.5 rounded-2xl border border-hair bg-panel p-4 shadow-[var(--shadow-sm)] transition duration-300 hover:-translate-y-1 hover:border-lagoon hover:shadow-[var(--shadow-md)]";
  if (href) {
    return (
      <a className={cls} href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <article className={cls}>{inner}</article>;
}

function Vs({
  lbl,
  a,
  b,
  stamp,
}: {
  lbl: string;
  a: string;
  b: string;
  stamp?: string;
}) {
  return (
    <div className="rounded-xl border border-hair p-3">
      <div className="text-[0.68rem] font-bold tracking-wider text-muted uppercase">{lbl}</div>
      <div className="mt-1.5 grid grid-cols-2 gap-2">
        <div>
          <span className="block text-[0.66rem] font-bold tracking-wide text-muted uppercase">This place</span>
          <b className="font-mono text-base tabular-nums">{a}</b>
        </div>
        <div>
          <span className="block text-[0.66rem] font-bold tracking-wide text-muted uppercase">Aotearoa</span>
          <b className="font-mono text-base tabular-nums">{b}</b>
        </div>
      </div>
      {stamp ? <div className="mt-1 text-xs text-muted">{stamp}</div> : null}
    </div>
  );
}

export function PlaceBrief({ place }: { place: Place }) {
  const theme = useExplorer((s) => s.theme);
  const setTheme = useExplorer((s) => s.setTheme);
  const select = useExplorer((s) => s.select);
  const setLevel = useExplorer((s) => s.setLevel);
  const region = isRegion(place);
  const le = region ? LIFE[place.name] : undefined;
  const show = (t: ThemeId) => theme === "all" || theme === t;
  const maoriOne = oneIn(place.maoriEth);

  return (
    <div>
      <div className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
        <button
          type="button"
          className="text-lagoon"
          onClick={() => {
            setLevel("regions");
            select(null);
          }}
        >
          Aotearoa New Zealand
        </button>
        {!region ? (
          <>
            {" · "}
            <button
              type="button"
              className="text-lagoon"
              onClick={() => {
                const r = REGIONS.find((x) => x.name === place.region);
                if (r) select(r, { postcard: false });
              }}
            >
              {place.region}
            </button>
          </>
        ) : null}
      </div>
      <h2 className="mt-1 font-display text-[clamp(1.8rem,4vw,2.5rem)] leading-tight font-medium tracking-tight">
        {place.name}
      </h2>
      <p className="mt-1 text-sm text-muted">
        <span className="mr-2 inline-block rounded-full bg-lagoon-soft px-2.5 py-0.5 text-xs font-bold text-lagoon">
          {region ? place.island : place.region}
        </span>
        {region ? "Region" : "District"} · {fmt(place.pop23)} people at the 2023 Census
      </p>

      <Link
        to="/profile/$slug"
        params={{ slug: place.slug }}
        className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-lagoon/25 bg-lagoon-soft/80 p-4 transition hover:border-lagoon hover:shadow-[var(--shadow-sm)]"
      >
        <div>
          <div className="text-[0.7rem] font-extrabold tracking-[0.1em] text-lagoon uppercase">
            Regional economic profile
          </div>
          <p className="mt-1 text-sm leading-snug text-ink">
            GDP, industry mix, labour, people and housing — an Infometrics-style dashboard for{" "}
            {place.name}.
          </p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-lagoon" />
      </Link>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={theme === t.id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              theme === t.id ? "border-lagoon bg-lagoon text-panel" : "border-hair bg-panel text-muted",
            )}
            onClick={() => setTheme(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-hair bg-lagoon-soft/70 p-4">
        <div className="text-[0.7rem] font-extrabold tracking-[0.1em] text-lagoon uppercase">Decision brief</div>
        <ul className="mt-2 ml-4 list-disc text-[0.92rem] leading-relaxed">
          <li>
            Population {place.popChg < 0 ? "fell" : "grew"} {place.popChg >= 0 ? "↑" : "↓"}
            {Math.abs(place.popChg).toFixed(1)}% from 2018–23 — {chgRel(place.popChg, NZ.chg)}.
          </li>
          {place.gdpPC != null ? (
            <li>
              GDP per person is {money(place.gdpPC)} — {pcRel(place.gdpPC)}.
            </li>
          ) : null}
          {place.maoriEth != null ? (
            <li>
              Māori make up {place.maoriEth.toFixed(1)}% of people here (NZ {NZ.maoriEth}%)
              {maoriOne ? ` — about 1 in ${maoriOne}` : ""}.
            </li>
          ) : null}
          {place.medAge != null ? (
            <li>
              Median age {place.medAge.toFixed(1)} years
              {place.p65 != null ? ` · ${place.p65.toFixed(1)}% are 65+ (NZ ${NZ.p65}%).` : "."}
            </li>
          ) : null}
        </ul>
        <p className="mt-3 rounded-lg bg-panel px-3 py-2 text-sm leading-snug font-semibold">
          <span className="mr-2 inline-block rounded-md bg-kowhai-bg px-2 py-0.5 text-[0.66rem] font-extrabold tracking-wide text-kowhai uppercase">
            Reading of the numbers
          </span>
          {soWhatLine(place)}
        </p>
      </section>

      <div className="mt-4 rounded-2xl border border-hair bg-panel p-4">
        <Beeswarm place={place} />
      </div>

      <div className="mt-4">
        <VsNz
          compact
          rows={[
            { label: "Population growth 2018–23", local: place.popChg, nz: NZ.chg, format: (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%` },
            ...(place.gdpPC != null
              ? [{ label: "GDP per person", local: place.gdpPC, nz: NZ.gdpPC, format: money }]
              : []),
            ...(place.maoriEth != null
              ? [{ label: "Māori ethnicity", local: place.maoriEth, nz: NZ.maoriEth, format: pct }]
              : []),
            ...(place.p65 != null ? [{ label: "Aged 65+", local: place.p65, nz: NZ.p65, format: pct }] : []),
            ...(place.depHighPct != null
              ? [{ label: "Most deprived SA1s", local: place.depHighPct, nz: NZ.depHighPct, format: pct }]
              : []),
            { label: "Unemployment", local: unempFor(place).v, nz: NZ_UNEMP.v, format: (n) => n.toFixed(1) + "%" },
          ]}
        />
      </div>

      {show("people") || show("maori") ? (
        <Compare
          kicker="People"
          title="Who lives here"
          why="Age and ethnicity shape demand for kura, health and housing — these are census counts, not estimates."
        >
          <Vs
            lbl="Population growth 2018–23"
            a={(place.popChg >= 0 ? "↑" : "↓") + Math.abs(place.popChg).toFixed(1) + "%"}
            b={"↑" + NZ.chg.toFixed(1) + "%"}
          />
          {place.maoriEth != null ? (
            <Vs lbl="Māori ethnicity" a={pct(place.maoriEth)} b={pct(NZ.maoriEth)} />
          ) : null}
          {place.medAge != null ? (
            <Vs lbl="Median age" a={place.medAge.toFixed(1) + " yrs"} b={NZ.medAge.toFixed(1) + " yrs"} />
          ) : null}
          {place.p65 != null ? <Vs lbl="Aged 65+" a={pct(place.p65)} b={pct(NZ.p65)} /> : null}
        </Compare>
      ) : null}

      {show("housing") && place.dw23 != null ? (
        <Compare
          kicker="Housing"
          title="Dwellings"
          why="Occupied and unoccupied private dwellings, 2023 Census. Counts are randomly rounded to base 3."
          src={SRC.census}
        >
          <Vs
            lbl="Dwellings 2023"
            a={fmt(place.dw23)}
            b={fmt(NZ.dw23)}
            stamp={
              place.dwChg != null
                ? `${place.dwChg >= 0 ? "+" : ""}${place.dwChg.toFixed(1)}% since 2018 · NZ ${NZ.dwChg >= 0 ? "+" : ""}${NZ.dwChg.toFixed(1)}%`
                : undefined
            }
          />
        </Compare>
      ) : null}

      {(show("health") || show("housing")) && place.depHighPct != null ? (
        <Compare
          kicker="Oranga · health"
          title="Deprivation — NZDep2023"
          why="NZDep2023 is an area index from the University of Otago (Oct 2024). Decile 1 is least deprived; 10 is most. It is not a measure of individual people."
          src={SRC.nzdep}
        >
          <Vs
            lbl="People in deciles 8–10"
            a={pct(place.depHighPct)}
            b={pct(NZ.depHighPct)}
            stamp="Share of people in the most deprived small areas"
          />
          {place.depMean != null ? (
            <Vs
              lbl="Mean NZDep2023 decile"
              a={place.depMean.toFixed(1)}
              b={NZ.depMean.toFixed(1)}
              stamp="1 least · 10 most · population-weighted"
            />
          ) : null}
        </Compare>
      ) : null}

      {show("economy") ? (
        <Compare
          kicker="Whairawa"
          title="Production"
          why={
            region
              ? "Regional GDP is Stats NZ, year ended March 2024 (nominal)."
              : "District GDP is MBIE's experimental modelled estimate — not a Stats NZ official TA account."
          }
        >
          {place.gdpPC != null ? (
            <Vs
              lbl="GDP per person"
              a={money(place.gdpPC)}
              b={money(NZ.gdpPC)}
              stamp={region ? "Stats NZ YE Mar 2024, revised" : "MBIE modelled · experimental"}
            />
          ) : (
            <p className="text-sm text-muted">GDP is not modelled for this place.</p>
          )}
          {unempFor(place).official ? (
            <Vs
              lbl="Unemployment"
              a={unempFor(place).v.toFixed(1) + "%"}
              b={NZ_UNEMP.v.toFixed(1) + "% NZ"}
              stamp={unempFor(place).note}
            />
          ) : null}
        </Compare>
      ) : null}

      {show("education") ? (
        <Compare
          kicker="Education"
          title="School rolls and NCEA"
          why="Indicative ENROL rolls (1 July 2026) and NZQA enrolment-based 2025 attainment."
        >
          {place.schoolRoll != null ? (
            <Vs lbl="School roll" a={fmt(place.schoolRoll)} b={fmt(NZ.schoolRoll)} />
          ) : null}
          {place.nceaL2pct != null ? (
            <Vs lbl="Year 12 NCEA L2" a={pct(place.nceaL2pct)} b={pct(NZ.nceaL2pct)} />
          ) : place.parentNceaL2pct != null ? (
            <Vs
              lbl={`NCEA L2 — ${place.parentNceaName}`}
              a={pct(place.parentNceaL2pct)}
              b={pct(NZ.nceaL2pct)}
              stamp="NZQA does not publish NCEA by territorial authority"
            />
          ) : null}
        </Compare>
      ) : null}

      {show("health") && le ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card
            label="Life expectancy — women"
            hero={le[1].toFixed(1)}
            unit="years"
            cmp={`${le[1] - NZ_LE.fT >= 0 ? "+" : ""}${(le[1] - NZ_LE.fT).toFixed(1)} vs NZ`}
            src={SRC.life}
          />
          <Card
            label="Life expectancy — men"
            hero={le[0].toFixed(1)}
            unit="years"
            cmp={`${le[0] - NZ_LE.mT >= 0 ? "+" : ""}${(le[0] - NZ_LE.mT).toFixed(1)} vs NZ`}
            src={SRC.life}
          />
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card
          label="Population (2023 Census)"
          hero={fmt(place.pop23)}
          cmp={`${place.popChg >= 0 ? "↑" : "↓"}${Math.abs(place.popChg).toFixed(1)}% since 2018`}
          fr={`NZ grew ${NZ.chg.toFixed(1)}% over the same five years.`}
          src={SRC.census}
        />
        {place.gdpPC != null ? (
          <Card
            label="GDP per person"
            hero={money(place.gdpPC)}
            cmp={pcRel(place.gdpPC)}
            src={region ? SRC.rgdp : SRC.tagdp}
          />
        ) : null}
        <Card
          label="Place summary"
          hero="Full census profile"
          fr="Income, qualifications, housing, ethnicity and more on Stats NZ."
          src={SRC.place(place.slug)}
          href={SRC.place(place.slug).url}
        />
        {place.kyrUrl ? (
          <Card
            label="Know Your Region"
            hero="Education Counts"
            fr="NCEA and school data for this place."
            src={SRC.edu}
            href={place.kyrUrl}
          />
        ) : null}
      </div>
    </div>
  );
}

function Compare({
  kicker,
  title,
  why,
  children,
  src,
}: {
  kicker: string;
  title: string;
  why: string;
  children: ReactNode;
  src?: { label: string; url: string };
}) {
  return (
    <section className="mt-5 rounded-2xl border border-hair bg-panel p-4">
      <div className="text-[0.7rem] font-extrabold tracking-[0.1em] text-lagoon uppercase">{kicker}</div>
      <h3 className="mt-1 font-display text-xl font-medium">{title}</h3>
      <p className="mt-1 mb-3 text-sm leading-snug text-muted">{why}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>
      {src ? (
        <p className="mt-3 text-xs text-muted">
          <a href={src.url} className="font-bold text-lagoon" target="_blank" rel="noopener noreferrer">
            {src.label}
          </a>
        </p>
      ) : null}
    </section>
  );
}
