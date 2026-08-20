import { useEffect, useMemo, useState } from "react";
import { PATHS } from "@/lib/geo-paths";
import { scaleColor } from "@/lib/color";
import { findByName, metricById, rowsFor } from "@/lib/places";
import { useExplorer } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NzMap() {
  const level = useExplorer((s) => s.level);
  const metricId = useExplorer((s) => s.metric);
  const selected = useExplorer((s) => s.selected);
  const select = useExplorer((s) => s.select);
  const md = metricById(level, metricId);
  const rows = rowsFor(level);
  const list = level === "regions" ? PATHS.regions : PATHS.districts;

  const byName = useMemo(() => {
    return new Map(rows.map((r) => [r.name.toLowerCase(), r]));
  }, [rows]);

  const vals = rows.map((r) => md.get(r)).filter((v): v is number => v != null);
  const cs = scaleColor(vals, md);

  const [pulse, setPulse] = useState<string | null>(null);
  const [hover, setHover] = useState<{ name: string; value: string } | null>(null);

  useEffect(() => {
    if (!selected) return;
    setPulse(selected.name);
    const t = window.setTimeout(() => setPulse(null), 1700);
    return () => window.clearTimeout(t);
  }, [selected?.name]);

  const chip = hover
    ? hover
    : selected
      ? {
          name: selected.name,
          value: (() => {
            const v = md.get(selected);
            return v == null ? "No figure" : md.format(v);
          })(),
        }
      : { name: "Hover a place · click for the brief", value: md.short };

  return (
    <div className="relative">
      <div className="mb-2 min-h-[3.1rem]">
        <div className="text-[0.68rem] font-bold tracking-[0.12em] text-lagoon uppercase">{chip.value}</div>
        <div className="font-display text-lg leading-tight font-medium tracking-tight">{chip.name}</div>
      </div>
      <div className="mx-auto w-full max-w-[19rem] sm:max-w-[24rem] lg:max-w-none">
      <svg
        viewBox={PATHS.viewBox}
        role="img"
        aria-label="Interactive map of New Zealand"
        className="block h-auto w-full"
      >
        {list.map((p) => {
          if (p.name === "Chatham Islands") return null;
          const row = byName.get(p.name.toLowerCase());
          if (!row) return null;
          const v = md.get(row);
          const fill = v == null ? "var(--color-map-empty)" : cs.color(v);
          const on = selected?.name === row.name;
          const label = v == null ? row.name : `${row.name}, ${md.format(v)}`;
          return (
            <path
              key={p.name}
              d={p.d}
              fill={fill}
              className={cn("geo-path", on && "is-selected", pulse === row.name && "just-selected")}
              tabIndex={0}
              role="button"
              aria-label={label}
              onMouseEnter={() =>
                setHover({ name: row.name, value: v == null ? "No figure" : md.format(v) })
              }
              onMouseLeave={() => setHover(null)}
              onFocus={() =>
                setHover({ name: row.name, value: v == null ? "No figure" : md.format(v) })
              }
              onBlur={() => setHover(null)}
              onClick={() => select(row)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(row);
                }
              }}
            />
          );
        })}
      </svg>
      </div>
      <button
        type="button"
        className="absolute right-2 bottom-16 rounded-xl border border-dashed border-hair bg-paper px-2.5 py-2 text-center text-[0.68rem] text-muted transition hover:border-lagoon hover:text-lagoon"
        onClick={() => {
          const row = findByName("Chatham Islands Territory");
          if (row) select(row);
        }}
      >
        <span className="mx-auto mb-1 block size-2.5 rounded-full bg-lagoon" />
        Chatham Is.
      </button>
      <Legend lo={cs.lo} hi={cs.hi} format={md.format} dep={cs.dep} label={md.short} />
    </div>
  );
}

function Legend({
  lo,
  hi,
  format,
  dep,
  label,
}: {
  lo: number;
  hi: number;
  format: (v: number) => string;
  dep: boolean;
  label: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.72rem] text-muted">
      <span>{dep ? "Least deprived" : format(lo)}</span>
      <span
        className="h-2.5 w-32 rounded-full"
        style={{
          background: dep
            ? "linear-gradient(90deg, var(--color-dep-lo), var(--color-dep-mid), var(--color-dep-hi))"
            : "linear-gradient(90deg, var(--color-lagoon-soft), var(--color-lagoon-mid), var(--color-lagoon))",
        }}
      />
      <span>{dep ? "Most deprived" : format(hi)}</span>
      <span className="ml-auto font-semibold text-ink">{label}</span>
    </div>
  );
}
