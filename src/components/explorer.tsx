import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { LocateFixed, Search, X } from "lucide-react";
import { AuthSlot } from "./auth-slot";
import { NzMap } from "./nz-map";
import { NzOverview } from "./nz-overview";
import { PlaceBrief } from "./place-brief";
import { Postcard } from "./postcard";
import { Welcome } from "./welcome";
import { Button } from "@/components/ui/button";
import { METRICS, REGIONS, DISTRICTS, findByName, metricById } from "@/lib/places";
import { locatePlace } from "@/lib/locate";
import { useExplorer } from "@/lib/store";
import type { Level, MetricId } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Explorer({ initialSlug }: { initialSlug?: string }) {
  const nav = useNavigate();
  const level = useExplorer((s) => s.level);
  const metric = useExplorer((s) => s.metric);
  const selected = useExplorer((s) => s.selected);
  const welcome = useExplorer((s) => s.welcome);
  const postcard = useExplorer((s) => s.postcard);
  const search = useExplorer((s) => s.search);
  const setLevel = useExplorer((s) => s.setLevel);
  const setMetric = useExplorer((s) => s.setMetric);
  const select = useExplorer((s) => s.select);
  const openBySlug = useExplorer((s) => s.openBySlug);
  const hideWelcome = useExplorer((s) => s.hideWelcome);
  const hidePostcard = useExplorer((s) => s.hidePostcard);
  const setSearch = useExplorer((s) => s.setSearch);
  const reset = useExplorer((s) => s.reset);

  const [geoMsg, setGeoMsg] = useState("");
  const [hitsOpen, setHitsOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSlug) {
      hideWelcome();
      openBySlug(initialSlug);
    }
  }, [initialSlug, hideWelcome, openBySlug]);

  useEffect(() => {
    if (selected) {
      if (selected.slug !== initialSlug) {
        void nav({ to: "/place/$slug", params: { slug: selected.slug } });
      }
    } else if (initialSlug) {
      void nav({ to: "/" });
    }
  }, [selected, initialSlug, nav]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (hitsOpen) {
          setHitsOpen(false);
          return;
        }
        if (postcard) hidePostcard();
        else if (welcome) hideWelcome();
        return;
      }
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLSelectElement)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [postcard, welcome, hitsOpen, hidePostcard, hideWelcome]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchBox.current && !searchBox.current.contains(e.target as Node)) {
        setHitsOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const allGeo = useMemo(
    () => [
      ...REGIONS.map((r) => ({ ...r, kind: "Region" as const })),
      ...DISTRICTS.map((t) => ({ ...t, kind: "District" as const })),
    ],
    [],
  );

  const hits = useMemo(() => {
    const q = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    if (!q) return [];
    const fold = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return allGeo.filter((g) => fold(g.name).includes(q)).slice(0, 8);
  }, [search, allGeo]);

  function findMe() {
    hideWelcome();
    if (!navigator.geolocation) {
      setGeoMsg("Location isn’t available — type your place in search.");
      searchRef.current?.focus();
      return;
    }
    setGeoMsg("Finding your place… checked on this device only.");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const hit = await locatePlace(pos.coords.longitude, pos.coords.latitude);
        if (!hit) {
          setGeoMsg("Couldn’t place those coordinates inside a district. Search instead?");
          searchRef.current?.focus();
          return;
        }
        const row = findByName(hit.name);
        if (row) {
          select(row);
          setGeoMsg("");
        } else {
          setGeoMsg("Found a boundary but no matching place record.");
        }
      },
      (err) => {
        setGeoMsg(
          err.code === 1
            ? "Location permission declined — search a name instead."
            : "Couldn’t get a location fix — search a name instead.",
        );
        searchRef.current?.focus();
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
    );
  }

  const metrics = METRICS[level];
  const depOn = metricById(level, metric).dep;

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-hair bg-panel/90 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3">
          <div className="min-w-0">
            <p className="kicker hidden text-lagoon sm:block">Tirohanga · Aotearoa</p>
            <h1 className="font-display text-xl font-medium tracking-tight sm:text-2xl">Know Aotearoa</h1>
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <span className="hidden items-center rounded-full bg-ok-bg px-3 py-1 text-xs font-bold text-ok sm:inline-flex">
              Verified snapshot · 21 Aug 2026
            </span>
            <Link
              to="/profile"
              className="rounded-full border border-hair bg-panel px-3 py-2 text-sm font-semibold text-ink hover:border-lagoon hover:text-lagoon"
            >
              <span className="hidden sm:inline">Economic profiles</span>
              <span className="sm:hidden">Profiles</span>
            </Link>
            <Button size="sm" onClick={findMe}>
              <LocateFixed className="size-4" />
              <span className="hidden sm:inline">Find my place</span>
              <span className="sm:hidden">Find me</span>
            </Button>
            <AuthSlot />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <div className="inline-flex overflow-hidden rounded-xl border border-hair bg-panel">
          {(["regions", "districts"] as Level[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              aria-pressed={level === lvl}
              className={cn(
                "px-3.5 py-2 text-sm font-semibold capitalize",
                level === lvl ? "bg-ink text-panel" : "text-muted hover:text-ink",
              )}
              onClick={() => setLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
        <select
          aria-label="Colour the map by"
          className="rounded-xl border border-hair bg-panel px-3 py-2 text-sm"
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricId)}
        >
          {metrics.map((m) => (
            <option key={m.id} value={m.id}>
              {m.short}
            </option>
          ))}
        </select>
        <div ref={searchBox} className="relative min-w-[210px] max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setHitsOpen(true);
            }}
            onFocus={() => setHitsOpen(true)}
            placeholder="Search any region or district…"
            className="w-full rounded-xl border border-hair bg-panel py-2 pr-3 pl-9 text-sm"
            aria-label="Search regions and districts"
            autoComplete="off"
          />
          {hitsOpen && search.trim() ? (
            <div className="absolute top-full z-30 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-hair bg-panel shadow-[var(--shadow-md)]">
              {hits.length ? (
                hits.map((h) => (
                  <button
                    key={h.slug}
                    type="button"
                    className="block w-full px-3 py-2.5 text-left text-sm hover:bg-lagoon-soft"
                    onClick={() => {
                      select(h);
                      setHitsOpen(false);
                      setSearch(h.name);
                    }}
                  >
                    {h.name}
                    <span className="ml-2 text-xs text-muted">
                      {h.kind}
                      {h.region ? ` · ${h.region}` : ""}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted">No matches</div>
              )}
            </div>
          ) : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            reset();
            void nav({ to: "/" });
          }}
        >
          <X className="size-3.5" />
          Clear
        </Button>
      </div>

      {geoMsg ? (
        <p className="mx-auto max-w-[1360px] px-4 text-sm text-muted sm:px-6">
          <span className="block rounded-lg border border-hair bg-panel px-3 py-2">{geoMsg}</span>
        </p>
      ) : null}

      {depOn ? (
        <p className="mx-auto max-w-[1360px] px-4 text-xs text-muted sm:px-6">
          Map colours follow the official NZDep sequential: pale cream (least deprived) to burnt orange
          (most). University of Otago, October 2024.
        </p>
      ) : null}

      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-5 px-4 py-4 lg:grid-cols-[minmax(320px,46%)_1fr] lg:items-start sm:px-6">
        <div className="paper-grain overflow-hidden rounded-[24px] border border-hair bg-panel p-4 lg:sticky lg:top-3">
          <NzMap />
        </div>
        <div className="rounded-[24px] border border-hair bg-panel p-5">
          {selected ? <PlaceBrief place={selected} /> : <NzOverview />}
        </div>
      </div>

      <footer className="mt-4 border-t border-hair bg-panel px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-[1360px] text-sm leading-relaxed text-muted">
          <h3 className="mb-2 font-sans text-base font-semibold text-ink">Methodology & sources</h3>
          <p>
            Audited snapshot, 21 Aug 2026. Population, age and ethnicity from Stats NZ 2023 Census
            (usually resident; randomly rounded to base 3). Regional GDP from Stats NZ’s YE Mar 2025
            release — 2024 revised, 2025 provisional. District GDP is MBIE modelled (experimental).
            Regional unemployment is HLFS Table 6, June 2026, not seasonally adjusted; the NZ 5.6% rate
            is seasonally adjusted. NZDep2023 from University of Otago. School rolls from the MoE
            Schools Directory (1 July 2026). NCEA from NZQA 2025 enrolment-based files. Census is a
            snapshot, not a live feed — Aotearoa Data Explorer requires a subscription key we do not
            hold.
          </p>
          <p className="mt-2 font-mono text-xs">
            Census counts randomly rounded to base 3 · this page stores nothing and tracks nothing.
          </p>
        </div>
      </footer>

      {welcome && !initialSlug ? <Welcome onFind={findMe} /> : null}
      {postcard && selected ? <Postcard place={selected} /> : null}
    </div>
  );
}
