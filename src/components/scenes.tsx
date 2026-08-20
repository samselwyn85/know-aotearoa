import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { PATHS } from "@/lib/geo-paths";
import { TABS, type ProfileTab } from "@/lib/economy";
import { cn } from "@/lib/utils";

export function CountUp({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const [n, setN] = useState(value);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    const from = value * 0.72;
    const t0 = performance.now();
    const dur = 800;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - (1 - p) ** 3;
      setN(from + (value - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{format(n)}</span>;
}

export function IslandMark({ className, ink }: { className?: string; ink?: boolean }) {
  return (
    <svg
      viewBox={PATHS.viewBox}
      aria-hidden
      className={cn("island-breathe pointer-events-none h-full w-full", className)}
    >
      {PATHS.regions.map((p) =>
        p.name === "Chatham Islands" ? null : (
          <path
            key={p.name}
            d={p.d}
            fill="currentColor"
            className={ink ? "text-lagoon-mid" : "text-lagoon"}
          />
        ),
      )}
    </svg>
  );
}

export function SceneStage({
  reo,
  index,
  title,
  lede,
  children,
  tone = "paper",
}: {
  reo: string;
  index: number;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  tone?: "paper" | "lagoon" | "kowhai" | "ink" | "dep";
}) {
  return (
    <section
      className={cn(
        "room-in paper-grain relative min-h-[28rem] overflow-x-hidden overflow-y-hidden px-4 py-10 sm:min-h-[32rem] sm:px-6 sm:py-12",
        tone === "paper" && "bg-panel text-ink",
        tone === "lagoon" && "bg-lagoon-soft text-ink",
        tone === "kowhai" && "bg-kowhai-bg text-ink",
        tone === "ink" && "bg-ink text-panel",
        tone === "dep" && "bg-dep-lo text-ink",
      )}
    >
      {tone === "ink" ? (
        <div className="pointer-events-none absolute -right-16 -bottom-28 h-[125%] w-[52%] text-lagoon opacity-45 sm:w-[38%]">
          <IslandMark ink />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto max-w-[1200px]">
        <div className="flex items-baseline justify-between gap-3">
          <p className={cn("kicker", tone === "ink" ? "text-lagoon-mid" : "text-lagoon")}>
            Room 0{index} · {reo}
          </p>
          <p className={cn("kicker hidden sm:block", tone === "ink" ? "text-lagoon-mid/70" : "text-muted")}>
            0{index} / 06
          </p>
        </div>
        <div className="mt-4">{title}</div>
        {lede ? (
          <p
            className={cn(
              "mt-3 max-w-2xl text-base leading-relaxed",
              tone === "ink" ? "text-lagoon-mid" : "text-muted",
            )}
          >
            {lede}
          </p>
        ) : null}
        {children ? <div className="relative z-10 mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

function PersonMark({ on, delay, tone }: { on: boolean; delay: number; tone: "lagoon" | "dep" | "kowhai" }) {
  return (
    <span
      className={cn(
        "person",
        on && "is-on person-pop",
        tone === "lagoon" && "person-lagoon",
        tone === "dep" && "person-dep",
        tone === "kowhai" && "person-kowhai",
      )}
      style={on ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span className="person-head" />
      <span className="person-body" />
    </span>
  );
}

export function PeopleField({
  value,
  label,
  compare,
  tone = "lagoon",
}: {
  value: number;
  label: string;
  compare?: number;
  tone?: "lagoon" | "dep" | "kowhai";
}) {
  const n = Math.max(0, Math.min(100, Math.round(value)));
  const nz = compare != null ? Math.max(0, Math.min(100, Math.round(compare))) : null;
  return (
    <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <div className="grid grid-cols-10 gap-x-1 gap-y-2 sm:gap-x-2 sm:gap-y-3" aria-hidden>
          {Array.from({ length: 100 }, (_, i) => (
            <PersonMark key={i} on={i < n} delay={i * 10} tone={tone} />
          ))}
        </div>
        <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      </div>
      <div className="min-w-[9rem]">
        <div
          className={cn(
            "display-mega tabular-nums",
            tone === "dep" ? "text-dep-hi" : tone === "kowhai" ? "text-kowhai" : "text-lagoon",
          )}
        >
          <CountUp value={n} format={(v) => String(Math.round(v))} />
        </div>
        <p className="mt-1 text-sm font-semibold tracking-tight">in 100 people</p>
        {nz != null ? (
          <p className="mt-2 text-sm text-muted">
            Aotearoa {nz}
            {compare != null ? ` · ${compare.toFixed(1)}%` : null}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function HouseStreet({
  value,
  label,
  compare,
}: {
  value: number;
  label: string;
  compare?: number;
}) {
  const n = Math.max(0, Math.min(10, Math.round(value / 10)));
  return (
    <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <div className="flex items-end justify-between gap-1 sm:gap-2" aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={cn("house", i < n ? "is-on house-rise" : "")}
              style={i < n ? { animationDelay: `${i * 70}ms` } : undefined}
            >
              <span className="house-roof" />
              <span className="house-wall" />
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm font-medium text-muted">{label}</p>
      </div>
      <div className="min-w-[9rem]">
        <div className="display-mega tabular-nums text-dep-hi">
          <CountUp value={Math.round(value)} format={(v) => String(Math.round(v))} />
        </div>
        <p className="mt-1 text-sm font-semibold tracking-tight">in 100 people</p>
        {compare != null ? <p className="mt-2 text-sm text-muted">Aotearoa {compare.toFixed(1)}%</p> : null}
      </div>
    </div>
  );
}

export type MixSlice = {
  id: string;
  short: string;
  label: string;
  share: number;
  nzShare: number;
  gdpB: number;
};

export function GdpTower({
  rows,
  formatB,
}: {
  rows: MixSlice[];
  formatB: (n: number) => string;
}) {
  const [hot, setHot] = useState<string | null>(null);
  const shown = rows.slice(0, 8);
  const rest = rows.slice(8).reduce((s, r) => s + r.share, 0);
  const floors =
    rest > 0.4
      ? [...shown, { id: "rest", short: "Everything else", label: "Remaining industries", share: rest, nzShare: 0, gdpB: 0 }]
      : shown;
  const active = floors.find((f) => f.id === hot) ?? floors[0];
  return (
    <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,20rem)]">
      <div className="flex min-h-56 flex-col-reverse overflow-hidden rounded-t-2xl sm:min-h-80">
        {floors.map((f, i) => {
          const on = hot == null || hot === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onMouseEnter={() => setHot(f.id)}
              onMouseLeave={() => setHot(null)}
              onFocus={() => setHot(f.id)}
              onBlur={() => setHot(null)}
              className={cn("tower-floor min-h-9 px-3 py-1.5 text-left", on ? "is-on" : "is-dim")}
              style={{
                flexGrow: Math.max(f.share, 2.2),
                animationDelay: `${i * 70}ms`,
                background: `color-mix(in oklab, var(--color-lagoon) ${Math.max(38, 88 - i * 7)}%, var(--color-ink))`,
              }}
              aria-pressed={hot === f.id}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold">{f.short}</span>
                <span className="font-mono text-xs tabular-nums">{f.share.toFixed(1)}%</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col justify-end">
        <p className="kicker text-lagoon-mid">Largest floor</p>
        <h3 className="display-scene mt-3">{active?.short}</h3>
        <p className="mt-2 text-sm leading-relaxed text-lagoon-mid">{active?.label}</p>
        {active ? (
          <p className="mt-4 font-mono text-lg tabular-nums">
            {active.share.toFixed(1)}% of GDP
            {active.gdpB ? ` · ${formatB(active.gdpB)}` : ""}
          </p>
        ) : null}
        {active && active.nzShare > 0 ? (
          <p className="mt-1 text-sm text-lagoon-mid">Aotearoa {active.nzShare.toFixed(1)}%</p>
        ) : null}
        <p className="mt-4 text-sm text-lagoon-mid">Each floor is an industry. Taller means a bigger share of production.</p>
      </div>
    </div>
  );
}

export function AgeCity({
  young,
  working,
  older,
}: {
  young?: number;
  working?: number;
  older: number;
}) {
  const rows =
    young != null && working != null
      ? [
          { k: "0–14", v: young, tone: "lagoon-mid" as const },
          { k: "15–64", v: working, tone: "lagoon" as const },
          { k: "65+", v: older, tone: "kowhai" as const },
        ]
      : [
          { k: "Under 65", v: 100 - older, tone: "lagoon" as const },
          { k: "65+", v: older, tone: "kowhai" as const },
        ];
  const max = Math.max(...rows.map((r) => r.v), 1);
  return (
    <div className="flex h-64 items-end gap-3 sm:h-80 sm:gap-6">
      {rows.map((r, i) => {
        const h = Math.max(18, (r.v / max) * 100);
        const panes = Math.max(6, Math.round(r.v / 3.2));
        return (
          <div key={r.k} className="flex min-w-0 flex-1 flex-col items-stretch gap-2">
            <div className="flex h-full items-end">
              <div
                className={cn("monument age-city relative w-full overflow-hidden rounded-t-xl", `age-city-${r.tone}`)}
                style={{ height: `${h}%`, animationDelay: `${i * 110}ms` }}
              >
                <div className="absolute inset-x-2 top-3 bottom-6 grid grid-cols-3 gap-1 content-start sm:grid-cols-4 sm:gap-1.5">
                  {Array.from({ length: panes }, (_, p) => (
                    <span
                      key={p}
                      className="window-lit aspect-square rounded-sm"
                      style={{ animationDelay: `${i * 110 + p * 28}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="font-mono text-xl font-semibold tabular-nums sm:text-2xl">{r.v.toFixed(1)}%</div>
              <div className="text-xs font-bold tracking-wider text-muted uppercase">{r.k}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function TabRail({
  tab,
  onTab,
}: {
  tab: ProfileTab;
  onTab: (id: ProfileTab) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  const [ready, setReady] = useState(false);

  const placePill = () => {
    const root = scroller.current;
    const mark = pill.current;
    const btn = root?.querySelector<HTMLButtonElement>("[aria-pressed='true']");
    if (!root || !mark || !btn) return;
    const r = root.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    if (first.current) {
      mark.style.transition = "none";
    }
    mark.style.width = `${b.width}px`;
    mark.style.transform = `translateX(${b.left - r.left + root.scrollLeft}px)`;
    if (first.current) {
      void mark.offsetWidth;
      mark.style.transition = "";
      first.current = false;
    }
    setReady(true);
  };

  useLayoutEffect(() => {
    placePill();
  }, [tab]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const on = () => placePill();
    root.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      root.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [tab]);

  return (
    <nav className="sticky top-0 z-20 border-b border-hair bg-paper/92 backdrop-blur-md" aria-label="Profile rooms">
      <div className="mx-auto max-w-[1200px] px-2 sm:px-4">
        <div ref={scroller} className="relative flex flex-nowrap gap-0 overflow-x-auto py-1.5">
          <span ref={pill} className="tab-pill pointer-events-none absolute top-1.5 bottom-1.5 left-0 rounded-xl bg-ink" />
          {TABS.map((t, i) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                className={cn(
                  "relative z-10 min-h-11 shrink-0 rounded-xl px-3.5 py-2 text-left transition-colors duration-200 sm:px-4",
                  on ? "text-panel" : "text-muted hover:text-ink",
                  on && !ready && "bg-ink",
                )}
                onClick={() => onTab(t.id)}
              >
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[0.65rem] tabular-nums opacity-70">0{i + 1}</span>
                  <span className="font-display text-sm leading-none font-medium tracking-tight sm:text-base">
                    {t.reo}
                  </span>
                </span>
                <span className="mt-1 block pl-6 text-[0.65rem] font-semibold tracking-wider uppercase">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
        <p className="sr-only">Arrow keys walk the rooms</p>
      </div>
    </nav>
  );
}

export function SplitNames({
  a,
  b,
  aSub,
  bSub,
}: {
  a: string;
  b: string;
  aSub: string;
  bSub: string;
}) {
  return (
    <div className="grid overflow-hidden sm:grid-cols-2">
      <div className="split-a bg-ink px-5 py-10 text-panel sm:px-8">
        <p className="kicker text-lagoon-mid">This place</p>
        <h3 className="display-scene mt-3">{a}</h3>
        <p className="mt-3 font-mono text-lg tabular-nums text-lagoon-mid">{aSub}</p>
      </div>
      <div className="split-b bg-lagoon-soft px-5 py-10 text-ink sm:px-8">
        <p className="kicker text-lagoon">Compared with</p>
        <h3 className="display-scene mt-3">{b}</h3>
        <p className="mt-3 font-mono text-lg tabular-nums text-muted">{bSub}</p>
      </div>
    </div>
  );
}

export function TugBar({
  aLabel,
  bLabel,
  a,
  b,
  format,
}: {
  aLabel: string;
  bLabel: string;
  a: number;
  b: number;
  format: (n: number) => string;
}) {
  const total = Math.abs(a) + Math.abs(b) || 1;
  const left = (Math.abs(a) / total) * 100;
  return (
    <div className="mt-8">
      <div className="flex items-baseline justify-between gap-3 text-sm font-semibold">
        <span className="truncate">{aLabel}</span>
        <span className="truncate text-right">{bLabel}</span>
      </div>
      <div className="mt-3 flex h-16 overflow-hidden rounded-2xl">
        <div className="bar-grow bg-lagoon" style={{ width: `${left}%` }} />
        <div className="flex-1 bg-ink" />
      </div>
      <div className="mt-3 flex justify-between gap-3 font-mono text-lg font-semibold tabular-nums">
        <span>{format(a)}</span>
        <span>{format(b)}</span>
      </div>
    </div>
  );
}
