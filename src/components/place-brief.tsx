import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { NZ, LIFE, NZ_LE, REGIONS } from "@/lib/places";
import { fmt, isRegion, money, pct } from "@/lib/format";
import { pcRel, soWhatLine } from "@/lib/insights";
import { SRC } from "@/lib/sources";
import { useExplorer } from "@/lib/store";
import type { Place } from "@/lib/types";
import { Beeswarm } from "./beeswarm";
import { VsNz } from "./econ-charts";
import { unempFor, NZ_UNEMP } from "@/lib/economy";
import { cn, placeShareUrl } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "people", label: "People" },
  { id: "economy", label: "Economy" },
  { id: "housing", label: "Housing" },
  { id: "education", label: "School" },
  { id: "health", label: "Health" },
] as const;

type BriefTab = (typeof TABS)[number]["id"];

export function PlaceBrief({ place }: { place: Place }) {
  const select = useExplorer((s) => s.select);
  const setLevel = useExplorer((s) => s.setLevel);
  const [tab, setTab] = useState<BriefTab>("overview");
  const region = isRegion(place);
  const le = region ? LIFE[place.name] : undefined;
  const unemp = unempFor(place);

  useEffect(() => {
    setTab("overview");
  }, [place.slug]);

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
      <div className="mt-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[clamp(1.7rem,3.6vw,2.3rem)] leading-tight font-medium tracking-tight">
            {place.name}
          </h2>
          <p className="mt-1 text-sm text-muted">
            <span className="mr-2 inline-block rounded-full bg-lagoon-soft px-2.5 py-0.5 text-xs font-bold text-lagoon">
              {region ? place.island : place.region}
            </span>
            {region ? "Region" : "District"} · {fmt(place.pop23)} people
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Link
            to="/profile/$slug"
            params={{ slug: place.slug }}
            className="inline-flex min-h-11 items-center gap-1 rounded-full bg-lagoon px-3.5 text-sm font-semibold text-panel hover:bg-lagoon-deep"
          >
            Six rooms
            <ChevronRight className="size-4" />
          </Link>
          <button
            type="button"
            className="min-h-11 px-2 text-xs font-semibold text-muted hover:text-lagoon"
            onClick={() => {
              const url = placeShareUrl(place.slug);
              void navigator.clipboard?.writeText(url).then(
                () => toast("Link copied"),
                () => toast("Couldn’t copy — copy from the address bar"),
              );
            }}
          >
            Copy link
          </button>
        </div>
      </div>

      <div
        className="mt-3 flex gap-1 overflow-x-auto border-b border-hair"
        role="tablist"
        aria-label="Place sections"
      >
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={cn(
                "min-h-11 shrink-0 border-b-2 px-3 text-sm font-semibold transition-colors",
                on ? "border-lagoon text-ink" : "border-transparent text-muted hover:text-ink",
              )}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div key={tab} className="scene-enter mt-4">
        {tab === "overview" ? (
          <div>
            <p className="text-sm leading-snug font-semibold">{soWhatLine(place)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi label="People" value={fmt(place.pop23)} note="2023 Census" />
              <Kpi
                label="Growth"
                value={`${place.popChg >= 0 ? "+" : ""}${place.popChg.toFixed(1)}%`}
                note="2018–23"
              />
              <Kpi
                label="GDP / person"
                value={place.gdpPC != null ? money(place.gdpPC) : "—"}
                note={place.gdpPC != null ? pcRel(place.gdpPC) : "Not modelled"}
              />
              <Kpi
                label="Unemployment"
                value={unemp.v.toFixed(1) + "%"}
                note={unemp.official ? "HLFS" : "Regional group"}
              />
            </div>
            <div className="mt-4">
              <VsNz
                compact
                rows={[
                  {
                    label: "Population growth",
                    local: place.popChg,
                    nz: NZ.chg,
                    format: (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`,
                  },
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
                  { label: "Unemployment", local: unemp.v, nz: NZ_UNEMP.v, format: (n) => n.toFixed(1) + "%" },
                ]}
              />
            </div>
            <Sources place={place} />
          </div>
        ) : null}

        {tab === "people" ? (
          <div>
            <Beeswarm place={place} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Pair
                label="Growth 2018–23"
                a={(place.popChg >= 0 ? "+" : "") + place.popChg.toFixed(1) + "%"}
                b={"+" + NZ.chg.toFixed(1) + "%"}
              />
              {place.maoriEth != null ? (
                <Pair label="Māori ethnicity" a={pct(place.maoriEth)} b={pct(NZ.maoriEth)} />
              ) : null}
              {place.medAge != null ? (
                <Pair label="Median age" a={place.medAge.toFixed(1) + " yrs"} b={NZ.medAge.toFixed(1) + " yrs"} />
              ) : null}
              {place.p65 != null ? <Pair label="Aged 65+" a={pct(place.p65)} b={pct(NZ.p65)} /> : null}
            </div>
            <p className="mt-3 text-xs text-muted">Census counts, not estimates. {SRC.census.label}.</p>
          </div>
        ) : null}

        {tab === "economy" ? (
          <div>
            <p className="text-sm leading-relaxed text-muted">
              {region
                ? "Regional GDP is Stats NZ, year ended March 2024 (nominal)."
                : "District GDP is MBIE’s experimental modelled estimate — not a Stats NZ official TA account."}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {place.gdpPC != null ? (
                <Pair label="GDP per person" a={money(place.gdpPC)} b={money(NZ.gdpPC)} />
              ) : (
                <p className="col-span-2 text-sm text-muted">GDP is not modelled for this place.</p>
              )}
              {unemp.official ? (
                <Pair
                  label="Unemployment"
                  a={unemp.v.toFixed(1) + "%"}
                  b={NZ_UNEMP.v.toFixed(1) + "%"}
                />
              ) : (
                <Pair
                  label="Unemployment (group)"
                  a={unemp.v.toFixed(1) + "%"}
                  b={NZ_UNEMP.v.toFixed(1) + "%"}
                />
              )}
            </div>
            <p className="mt-3 text-xs text-muted">{unemp.note}</p>
          </div>
        ) : null}

        {tab === "housing" ? (
          <div>
            {place.dw23 != null ? (
              <>
                <p className="text-sm leading-relaxed text-muted">
                  Occupied and unoccupied private dwellings, 2023 Census. Randomly rounded to base 3.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Pair
                    label="Dwellings 2023"
                    a={fmt(place.dw23)}
                    b={fmt(NZ.dw23)}
                  />
                  {place.dwChg != null ? (
                    <Pair
                      label="Dwelling change"
                      a={`${place.dwChg >= 0 ? "+" : ""}${place.dwChg.toFixed(1)}%`}
                      b={`${NZ.dwChg >= 0 ? "+" : ""}${NZ.dwChg.toFixed(1)}%`}
                    />
                  ) : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">Dwelling counts are not in this snapshot for this place.</p>
            )}
          </div>
        ) : null}

        {tab === "education" ? (
          <div>
            <p className="text-sm leading-relaxed text-muted">
              Indicative ENROL rolls (1 July 2026) and NZQA enrolment-based 2025 attainment.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {place.schoolRoll != null ? (
                <Pair label="School roll" a={fmt(place.schoolRoll)} b={fmt(NZ.schoolRoll)} />
              ) : null}
              {place.nceaL2pct != null ? (
                <Pair label="Year 12 NCEA L2" a={pct(place.nceaL2pct)} b={pct(NZ.nceaL2pct)} />
              ) : place.parentNceaL2pct != null ? (
                <Pair
                  label={`NCEA L2 — ${place.parentNceaName}`}
                  a={pct(place.parentNceaL2pct)}
                  b={pct(NZ.nceaL2pct)}
                />
              ) : null}
            </div>
            {place.nceaL2pct == null && place.parentNceaL2pct != null ? (
              <p className="mt-2 text-xs text-muted">NZQA does not publish NCEA by territorial authority.</p>
            ) : null}
            {place.kyrUrl ? (
              <a
                href={place.kyrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-lagoon"
              >
                Education Counts
                <ArrowUpRight className="size-3.5" />
              </a>
            ) : null}
          </div>
        ) : null}

        {tab === "health" ? (
          <div>
            <p className="text-sm leading-relaxed text-muted">
              NZDep2023 is an area index (University of Otago, Oct 2024). Decile 1 is least deprived; 10
              is most. It is not a measure of individual people.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {place.depHighPct != null ? (
                <Pair label="Deciles 8–10" a={pct(place.depHighPct)} b={pct(NZ.depHighPct)} />
              ) : null}
              {place.depMean != null ? (
                <Pair label="Mean NZDep decile" a={place.depMean.toFixed(1)} b={NZ.depMean.toFixed(1)} />
              ) : null}
              {le ? (
                <>
                  <Pair
                    label="Life expectancy — women"
                    a={le[1].toFixed(1) + " yrs"}
                    b={NZ_LE.fT.toFixed(1) + " yrs"}
                  />
                  <Pair
                    label="Life expectancy — men"
                    a={le[0].toFixed(1) + " yrs"}
                    b={NZ_LE.mT.toFixed(1) + " yrs"}
                  />
                </>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-muted">
              {SRC.nzdep.label}
              {le ? ` · ${SRC.life.label}` : ""}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl bg-lagoon-soft/60 px-3 py-2.5">
      <p className="kicker text-lagoon">{label}</p>
      <p className="mt-1 font-display text-lg leading-none font-medium tracking-tight tabular-nums sm:text-xl">
        {value}
      </p>
      {note ? <p className="mt-1 text-xs text-muted">{note}</p> : null}
    </div>
  );
}

function Pair({ label, a, b }: { label: string; a: string; b: string }) {
  return (
    <div className="rounded-xl border border-hair px-3 py-2.5">
      <p className="text-[0.68rem] font-bold tracking-wider text-muted uppercase">{label}</p>
      <p className="mt-1 font-mono text-base font-semibold tabular-nums">{a}</p>
      <p className="text-xs text-muted">
        NZ <span className="font-mono tabular-nums">{b}</span>
      </p>
    </div>
  );
}

function Sources({ place }: { place: Place }) {
  const placeSrc = SRC.place(place.slug);
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <a href={placeSrc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-lagoon">
        Stats NZ profile
        <ArrowUpRight className="size-3" />
      </a>
      {place.kyrUrl ? (
        <a href={place.kyrUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-lagoon">
          Education Counts
          <ArrowUpRight className="size-3" />
        </a>
      ) : null}
      <span>Census randomly rounded to base 3</span>
    </p>
  );
}
