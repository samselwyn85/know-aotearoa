import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LocateFixed } from "lucide-react";
import { useExplorer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { CountUp, IslandMark } from "./scenes";
import { NZ_GDP_2025, NZ_UNEMP, SNAPSHOT, TABS, type ProfileTab } from "@/lib/economy";
import { DISTRICTS, NZ } from "@/lib/places";
import { fmt, pct, shortPlace } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROOM_COPY: Record<ProfileTab, string> = {
  overview: "A hundred people. Your place, at a glance.",
  economy: "GDP stacked as a tower you can read.",
  labour: "Who has work — and who is waiting.",
  people: "Age, lit like a city at dusk.",
  housing: "Ten houses. The street you live on.",
  compare: "Two places, torn side by side.",
};

const SHOW_SLUG = "wellington-city";

export function Welcome({ onFind }: { onFind: () => void }) {
  const hide = useExplorer((s) => s.hideWelcome);
  const [leaving, setLeaving] = useState(false);
  const [cue, setCue] = useState(0);

  const facts = useMemo(() => {
    const withChg = DISTRICTS.filter((d) => Number.isFinite(d.popChg));
    const fastest = [...withChg].sort((a, b) => b.popChg - a.popChg)[0];
    const richest = [...DISTRICTS].filter((d) => d.gdpPC).sort((a, b) => (b.gdpPC ?? 0) - (a.gdpPC ?? 0))[0];
    const youngest = [...DISTRICTS]
      .filter((d) => d.medAge != null)
      .sort((a, b) => (a.medAge ?? 99) - (b.medAge ?? 99))[0];
    const maori = [...DISTRICTS]
      .filter((d) => d.maoriEth != null)
      .sort((a, b) => (b.maoriEth ?? 0) - (a.maoriEth ?? 0))[0];
    const lines: string[] = [];
    if (fastest) lines.push(`${shortPlace(fastest.name)} grew ${pct(fastest.popChg)} — fastest of any district.`);
    if (richest?.gdpPC)
      lines.push(`${shortPlace(richest.name)} makes $${Math.round(richest.gdpPC / 1000)}k a head — the most in the motu.`);
    if (youngest?.medAge != null)
      lines.push(`${shortPlace(youngest.name)} is the youngest district, median age ${youngest.medAge.toFixed(1)}.`);
    if (maori?.maoriEth != null)
      lines.push(`${shortPlace(maori.name)} is ${pct(maori.maoriEth)} Māori — the highest share in the census.`);
    return lines;
  }, []);

  useEffect(() => {
    if (facts.length < 2) return;
    const id = window.setInterval(() => setCue((n) => (n + 1) % facts.length), 3800);
    return () => window.clearInterval(id);
  }, [facts.length]);

  function dismiss(then?: () => void) {
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      hide();
      then?.();
      return;
    }
    setLeaving(true);
    window.setTimeout(() => {
      hide();
      then?.();
    }, 280);
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 overflow-x-hidden overflow-y-auto bg-ink text-panel",
        leaving && "foyer-leave",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="pointer-events-none absolute inset-y-0 right-[-8%] w-[92%] text-lagoon sm:right-[-4%] sm:w-[62%] lg:w-[54%]">
        <div className="island-reveal h-full w-full opacity-40 sm:opacity-70">
          <IslandMark ink />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-ink to-transparent" />

      <div className="foyer-stage relative z-10 mx-auto grid min-h-dvh max-w-[1280px] grid-cols-1 content-start gap-6 px-5 py-5 sm:px-10 sm:py-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,28rem)] lg:gap-10">
        <div className="flex min-w-0 flex-col lg:justify-center">
          <header className="foyer-item flex items-baseline justify-between gap-3">
            <p className="kicker text-lagoon-mid">Te Whare Tatauranga</p>
            <p className="kicker text-lagoon-mid/70">Verified · {SNAPSHOT.asAt}</p>
          </header>

          <div className="foyer-item mt-5 sm:mt-8">
            <h1 id="welcome-title">
              <span className="title-line display-mega text-panel">
                <span>Know</span>
              </span>
              <span className="title-line display-mega text-panel">
                <span>Aotearoa</span>
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-lagoon-mid sm:text-lg">
              Official numbers for every region and district. People, production, work and home — six
              rooms you can walk.
            </p>
            {facts.length ? (
              <p key={cue} className="foyer-cue mt-3 max-w-xl text-sm font-medium text-panel sm:text-base">
                {facts[cue]}
              </p>
            ) : null}
          </div>

          <dl className="foyer-item mt-6 grid grid-cols-3 gap-3 border-y border-panel/10 py-4 sm:max-w-lg">
            <Stat label="People" value={NZ.pop23} format={(n) => fmt(Math.round(n))} />
            <Stat
              label="GDP"
              value={NZ_GDP_2025.b}
              format={(n) => "$" + Math.round(n).toLocaleString("en-NZ") + "b"}
            />
            <Stat label="Places" value={DISTRICTS.length} format={(n) => String(Math.round(n))} />
          </dl>

          <div className="foyer-item mt-6 flex flex-col gap-3 sm:max-w-md sm:flex-row">
            <Button
              size="lg"
              className="min-h-14 w-full text-base sm:flex-1"
              onClick={() => dismiss(onFind)}
            >
              <LocateFixed className="size-4" />
              Find my place
            </Button>
            <Link
              to="/profile/$slug"
              params={{ slug: SHOW_SLUG }}
              className="inline-flex min-h-14 w-full items-center justify-center gap-1.5 rounded-xl border border-panel/20 px-5 py-4 text-base font-semibold text-panel transition-colors hover:border-lagoon hover:text-lagoon sm:flex-1"
            >
              Walk Wellington
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="foyer-item mt-2 text-sm text-lagoon-mid">
            <button type="button" className="min-h-11 underline-offset-4 hover:text-panel hover:underline" onClick={() => dismiss()}>
              Skip to the map
            </button>
            {import.meta.env.VITE_OFFLINE === "true" ? null : (
              <>
                <span className="mx-2 text-panel/30">·</span>
                <a href="/know-aotearoa.html" download="know-aotearoa.html" className="min-h-11 underline-offset-4 hover:text-panel hover:underline">
                  Download HTML
                </a>
              </>
            )}
            <span className="mx-2 text-panel/30">·</span>
            {NZ_UNEMP.v.toFixed(1)}% unemployment nationwide
          </p>
        </div>

        <div className="foyer-item flex min-w-0 flex-col justify-end lg:py-4">
          <p className="kicker text-lagoon">Six rooms · tap any door</p>
          <div className="foyer-reel mt-3 -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-2">
            {TABS.map((t, i) => (
              <Link
                key={t.id}
                to="/profile/$slug"
                params={{ slug: SHOW_SLUG }}
                search={{ room: t.id }}
                className="foyer-door group flex min-h-36 min-w-[10.5rem] snap-start flex-col justify-between rounded-2xl border border-panel/12 bg-ink/70 p-3 text-left backdrop-blur-sm transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-1 hover:border-lagoon hover:bg-ink/85 sm:min-w-0"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-[0.65rem] tabular-nums text-lagoon-mid">0{i + 1}</span>
                  <span className="kicker text-lagoon">{t.reo}</span>
                </div>
                <div className="my-2 min-h-10" aria-hidden>
                  <DoorMark id={t.id} />
                </div>
                <div>
                  <p className="font-display text-base leading-tight font-medium tracking-tight">{t.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-lagoon-mid">{ROOM_COPY[t.id]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
}) {
  return (
    <div>
      <dt className="kicker text-lagoon-mid">{label}</dt>
      <dd className="mt-1.5 font-display text-xl font-medium tracking-tight tabular-nums sm:text-2xl">
        <CountUp value={value} format={format} />
      </dd>
    </div>
  );
}

function DoorMark({ id }: { id: ProfileTab }) {
  if (id === "overview") {
    return (
      <div className="grid grid-cols-9 gap-0.5">
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} className={cn("person person-lagoon", i < 12 && "is-on person-pop")} style={{ animationDelay: `${i * 28}ms` }}>
            <span className="person-head" />
            <span className="person-body" />
          </span>
        ))}
      </div>
    );
  }
  if (id === "economy") {
    return (
      <div className="flex h-14 flex-col-reverse gap-0.5">
        <span className="h-2 rounded-sm bg-lagoon/35" />
        <span className="h-2.5 rounded-sm bg-lagoon/50" />
        <span className="h-3 rounded-sm bg-lagoon/70" />
        <span className="h-5 rounded-sm bg-lagoon" />
      </div>
    );
  }
  if (id === "labour") {
    return (
      <div className="grid grid-cols-10 gap-0.5">
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i} className={cn("person person-lagoon", i < 16 && "is-on person-pop")} style={{ animationDelay: `${i * 24}ms` }}>
            <span className="person-head" />
            <span className="person-body" />
          </span>
        ))}
      </div>
    );
  }
  if (id === "people") {
    return (
      <div className="flex h-14 items-end gap-1">
        <span className="monument age-city-lagoon-mid h-8 w-full rounded-t-sm" />
        <span className="monument age-city-lagoon h-14 w-full rounded-t-sm" style={{ animationDelay: "90ms" }} />
        <span className="monument age-city-kowhai h-6 w-full rounded-t-sm" style={{ animationDelay: "160ms" }} />
      </div>
    );
  }
  if (id === "housing") {
    return (
      <div className="flex items-end gap-1">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={cn("house", i < 3 && "is-on house-rise")} style={{ animationDelay: `${i * 70}ms` }}>
            <span className="house-roof" />
            <span className="house-wall" />
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="flex h-14 overflow-hidden rounded-md">
      <span className="w-1/2 bg-lagoon" />
      <span className="w-1/2 bg-panel/25" />
    </div>
  );
}
