import { useEffect, useId, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IndustryRow } from "@/lib/economy";
import { moneyB } from "@/lib/economy";
import { fmt, pct, shortPlace } from "@/lib/format";
import { NZDEP_CSS } from "@/lib/color";
import { cn } from "@/lib/utils";

const LAGOON = "#3ea094";
const LAGOON_MID = "#6eb8ad";
const MUTED = "#7a7a7a";
const HAIR = "#ededed";
const KOWHAI = "#c0ab3c";
const DONUT = [LAGOON, LAGOON_MID, KOWHAI, HAIR];

export function ChartFrame({
  title,
  takeaway,
  why,
  children,
  height,
  footer,
  compact,
}: {
  title: string;
  takeaway?: string;
  why?: string;
  children: ReactNode;
  height?: string;
  footer?: ReactNode;
  compact?: boolean;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <section
      className={cn(
        "card-enter rounded-2xl border border-hair bg-panel shadow-[var(--shadow-sm)]",
        compact ? "p-3" : "p-4",
      )}
    >
      <h3 className={cn("font-display font-medium tracking-tight", compact ? "text-base" : "text-lg")}>
        {title}
      </h3>
      {takeaway ? (
        <p
          className={cn(
            "mt-1 leading-snug font-medium text-ink",
            compact ? "font-sans text-sm" : "font-sans text-[0.95rem]",
          )}
        >
          {takeaway}
        </p>
      ) : null}
      {why ? <p className="mt-1 text-sm leading-snug text-muted">{why}</p> : null}
      <div className={cn("mt-3 w-full", height)}>
        {ready ? children : <div className="h-full min-h-40 animate-pulse rounded-xl bg-lagoon-soft/80" />}
      </div>
      {footer}
    </section>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const w = 88;
  const h = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 3 - ((v - lo) / (hi - lo || 1)) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const last = values[values.length - 1];
  const up = last >= values[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-[88px] text-lagoon" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.join(" ")}
      />
      <circle
        cx={w}
        cy={h - 3 - ((last - lo) / (hi - lo || 1)) * (h - 6)}
        r="2.4"
        className={up ? "fill-lagoon" : "fill-kowhai"}
      />
    </svg>
  );
}

export function GdpLine({
  data,
  localName,
}: {
  data: { year: number; local: number; nz: number }[];
  localName: string;
}) {
  const gid = useId().replace(/:/g, "");
  const indexed = data.map((d) => {
    const l0 = data[0]?.local || 1;
    const n0 = data[0]?.nz || 1;
    return {
      year: d.year,
      [localName]: Math.round((d.local / l0) * 1000) / 10,
      Aotearoa: Math.round((d.nz / n0) * 1000) / 10,
      localB: d.local,
    };
  });
  const last = indexed[indexed.length - 1];
  const localEnd = last ? Number(last[localName]) : 100;
  const nzEnd = last ? Number(last.Aotearoa) : 100;
  const faster = localEnd - nzEnd;
  const takeaway =
    Math.abs(faster) < 2
      ? `${localName} has tracked Aotearoa since 2018.`
      : faster > 0
        ? `${localName} is ${faster.toFixed(0)} points ahead of Aotearoa since 2018.`
        : `${localName} is ${Math.abs(faster).toFixed(0)} points behind Aotearoa since 2018.`;

  return (
    <ChartFrame
      title="How the economy has moved"
      takeaway={takeaway}
      why="Nominal GDP, rebased so 2018 = 100. Regions use the official Stats NZ series. Districts follow the parent region’s official path, scaled to MBIE’s 2024 total."
      height="h-64"
      footer={
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 text-lagoon">
            <span className="h-0.5 w-4 rounded-full bg-lagoon" />
            {localName} {localEnd.toFixed(0)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="h-px w-4 border-t border-dashed border-lagoon-mid" />
            Aotearoa {nzEnd.toFixed(0)}
          </span>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={indexed} margin={{ top: 12, right: 56, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gdp-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LAGOON} stopOpacity={0.28} />
              <stop offset="100%" stopColor={LAGOON} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={HAIR} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="year" tick={{ fill: MUTED, fontSize: 12 }} axisLine={{ stroke: HAIR }} tickLine={false} />
          <YAxis tick={{ fill: MUTED, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-hair bg-panel px-3 py-2 text-xs shadow-[var(--shadow-md)]">
                  <div className="font-semibold">{label}</div>
                  {payload.map((p) => (
                    <div key={String(p.name)} className="mt-0.5">
                      {String(p.name)}: <b>{Number(p.value).toFixed(1)}</b>
                      {p.name === localName && p.payload?.localB != null ? (
                        <span className="text-muted"> · {moneyB(p.payload.localB as number)}</span>
                      ) : null}
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey={localName}
            stroke={LAGOON}
            strokeWidth={2.4}
            fill={`url(#gdp-${gid})`}
            dot={{ r: 3, fill: LAGOON, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="Aotearoa"
            stroke={LAGOON_MID}
            strokeWidth={2}
            fill="none"
            dot={false}
            strokeDasharray="4 4"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function IndustryLollipop({ rows, limit = 8 }: { rows: IndustryRow[]; limit?: number }) {
  const data = [...rows].sort((a, b) => b.share - a.share).slice(0, limit);
  const max = Math.max(...data.map((r) => Math.max(r.share, r.nzShare)), 1);
  const lead = data[0];
  const takeaway = lead
    ? `${lead.short} is the largest slice at ${lead.share.toFixed(1)}% of GDP` +
      (lead.lq >= 1.2 ? ` — ${lead.lq.toFixed(1)}× the national share.` : ".")
    : undefined;
  return (
    <ChartFrame
      title="What the economy is made of"
      takeaway={takeaway}
      why="Dot = this place. Tick = Aotearoa. Hover a row for the exact share."
      footer={
        <p className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-lagoon" /> this place
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border-2 border-lagoon-mid bg-panel" /> Aotearoa
          </span>
        </p>
      }
    >
      <ul className="space-y-2.5">
        {data.map((r) => {
          const localW = (r.share / max) * 100;
          const nzW = (r.nzShare / max) * 100;
          return (
            <li key={r.id} className="grid grid-cols-[6.5rem_1fr_3.2rem] items-center gap-2 text-sm sm:grid-cols-[7.5rem_1fr_3.2rem]">
              <span className="truncate text-right text-xs font-medium">{r.short}</span>
              <div className="relative h-5">
                <div className="absolute inset-y-[9px] right-0 left-0 h-px bg-hair" />
                <div
                  className="bar-grow absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-lagoon/25"
                  style={{ width: `${localW}%` }}
                />
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${nzW}%` }}
                  title={`Aotearoa ${r.nzShare.toFixed(1)}%`}
                >
                  <span className="dot-pop block size-2.5 rounded-full border-2 border-lagoon-mid bg-panel" />
                </span>
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${localW}%` }}
                  title={`${r.short} ${r.share.toFixed(1)}%`}
                >
                  <span className="dot-pop block size-3.5 rounded-full bg-lagoon shadow-[var(--shadow-sm)]" />
                </span>
              </div>
              <b className="font-mono text-xs tabular-nums">{r.share.toFixed(1)}%</b>
            </li>
          );
        })}
      </ul>
    </ChartFrame>
  );
}

export function MixDonut({ rows, name }: { rows: IndustryRow[]; name: string }) {
  const top = [...rows].sort((a, b) => b.share - a.share);
  const three = top.slice(0, 3);
  const rest = top.slice(3).reduce((s, r) => s + r.share, 0);
  const pie = [
    ...three.map((r) => ({ name: r.short, value: r.share })),
    { name: "Everything else", value: rest },
  ];
  const conc = three.reduce((s, r) => s + r.share, 0);
  return (
    <ChartFrame
      title="How concentrated is this economy?"
      takeaway={`The three biggest industries are ${conc.toFixed(0)}% of ${shortPlace(name)}’s GDP.`}
      why="A concentrated place leans on a few sectors. A diverse one spreads the risk."
    >
      <div className="grid items-center gap-3 sm:grid-cols-2">
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pie}
                dataKey="value"
                nameKey="name"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={2}
                stroke="none"
              >
                {pie.map((e, i) => (
                  <Cell key={e.name} fill={DONUT[i] ?? HAIR} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [`${Number(v).toFixed(1)}%`, "Share"]}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${HAIR}`,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="font-mono text-2xl font-semibold tabular-nums">{conc.toFixed(0)}%</div>
              <div className="text-[0.65rem] font-bold tracking-wide text-muted uppercase">top 3</div>
            </div>
          </div>
        </div>
        <ul className="space-y-2 text-sm">
          {pie.map((e, i) => (
            <li key={e.name} className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: DONUT[i] ?? HAIR }} />
                <span className="truncate">{e.name}</span>
              </span>
              <b className="font-mono text-xs tabular-nums">{e.value.toFixed(1)}%</b>
            </li>
          ))}
        </ul>
      </div>
    </ChartFrame>
  );
}

export function Waffle({
  value,
  label,
  compare,
  compareLabel = "Aotearoa",
  why = "Each square is one person in a hundred.",
}: {
  value: number;
  label: string;
  compare?: number;
  compareLabel?: string;
  why?: string;
}) {
  const n = Math.max(0, Math.min(100, Math.round(value)));
  const cnZ = compare != null ? Math.max(0, Math.min(100, Math.round(compare))) : null;
  const rawDiff = compare != null ? Math.round(value - compare) : 0;
  const takeaway =
    compare != null
      ? rawDiff === 0
        ? `Same share as Aotearoa (${n} in 100).`
        : rawDiff > 0
          ? `${rawDiff} more in 100 than Aotearoa.`
          : `${Math.abs(rawDiff)} fewer in 100 than Aotearoa.`
      : `${n} in 100.`;
  return (
    <ChartFrame title={label} takeaway={takeaway} why={why}>
      <div className={cn("grid gap-6", compare != null ? "sm:grid-cols-2" : "")}>
        <WaffleGrid n={n} caption={`This place · ${value.toFixed(1)}%`} />
        {cnZ != null ? <WaffleGrid n={cnZ} caption={`${compareLabel} · ${compare!.toFixed(1)}%`} muted /> : null}
      </div>
    </ChartFrame>
  );
}

function WaffleGrid({ n, caption, muted }: { n: number; caption: string; muted?: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "aspect-square rounded-[3px]",
              i < n
                ? cn(muted ? "bg-lagoon-mid" : "bg-lagoon", "waffle-on")
                : "bg-lagoon-soft",
            )}
            style={i < n ? { animationDelay: `${i * 6}ms` } : undefined}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-medium text-muted">{caption}</p>
    </div>
  );
}

export function VsNz({
  rows,
  compact,
}: {
  rows: { label: string; local: number; nz: number; format: (n: number) => string }[];
  compact?: boolean;
}) {
  const scored = rows
    .filter((r) => Number.isFinite(r.local) && Number.isFinite(r.nz) && r.nz !== 0)
    .map((r) => {
      const delta = ((r.local / r.nz) - 1) * 100;
      return { ...r, delta };
    });
  const above = scored.filter((r) => r.delta > 3).length;
  const below = scored.filter((r) => r.delta < -3).length;
  const takeaway =
    above && below
      ? `Above Aotearoa on ${above}, below on ${below}.`
      : above
        ? `Above Aotearoa on ${above} of these measures.`
        : below
          ? `Below Aotearoa on ${below} of these measures.`
          : "Close to the national picture on these measures.";
  if (!scored.length) return null;
  const cap = 80;
  return (
    <ChartFrame
      title="This place versus Aotearoa"
      takeaway={takeaway}
      why={compact ? undefined : "Bars to the right sit above the national figure. Left sits below. The centre line is NZ."}
      compact={compact}
    >
      <ul className={cn("space-y-3", compact && "space-y-2.5")}>
        {scored.map((r) => {
          const mag = Math.min(cap, Math.abs(r.delta));
          const w = (mag / cap) * 50;
          const right = r.delta >= 0;
          return (
            <li key={r.label}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                <span className="font-medium">{r.label}</span>
                <span className="font-mono tabular-nums text-muted">
                  {r.format(r.local)}
                  <span className="mx-1 text-hair">·</span>
                  NZ {r.format(r.nz)}
                </span>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-lagoon-soft">
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-ink/30" />
                <div
                  className={cn("bar-grow absolute top-0.5 h-2 rounded-full", right ? "bg-lagoon" : "bg-kowhai")}
                  style={
                    right
                      ? { left: "50%", width: `${w}%` }
                      : { right: "50%", width: `${w}%`, transformOrigin: "right center" }
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ChartFrame>
  );
}

export function Dumbbell({
  aName,
  bName,
  rows,
}: {
  aName: string;
  bName: string;
  rows: { label: string; a: number; b: number; format: (n: number) => string }[];
}) {
  return (
    <ChartFrame
      title="Head to head"
      takeaway={`Filled dots are ${shortPlace(aName)}. Hollow dots are ${shortPlace(bName)}.`}
      why="Each row is its own scale — read the numbers, not the length across rows."
    >
      <ul className="space-y-4">
        {rows.map((r) => {
          const lo = Math.min(r.a, r.b);
          const hi = Math.max(r.a, r.b);
          const pad = (hi - lo) * 0.12 || Math.abs(hi) * 0.08 || 1;
          const min = lo - pad;
          const max = hi + pad;
          const x = (v: number) => ((v - min) / (max - min || 1)) * 100;
          const aX = x(r.a);
          const bX = x(r.b);
          return (
            <li key={r.label}>
              <div className="mb-1 text-xs font-medium">{r.label}</div>
              <div className="relative h-6">
                <div
                  className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-lagoon-mid"
                  style={{
                    left: `${Math.min(aX, bX)}%`,
                    width: `${Math.abs(aX - bX)}%`,
                  }}
                />
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${aX}%` }}
                  title={`${aName} ${r.format(r.a)}`}
                >
                  <span className="dot-pop block size-3.5 rounded-full bg-lagoon" />
                </span>
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${bX}%` }}
                  title={`${bName} ${r.format(r.b)}`}
                >
                  <span className="dot-pop block size-3.5 rounded-full border-2 border-lagoon-mid bg-panel" />
                </span>
              </div>
              <div className="mt-0.5 flex justify-between font-mono text-[0.7rem] tabular-nums text-muted">
                <span>{r.a <= r.b ? r.format(r.a) : r.format(r.b)}</span>
                <span>{r.a > r.b ? r.format(r.a) : r.format(r.b)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </ChartFrame>
  );
}

export function AgeBands({
  name,
  local,
  nz,
}: {
  name: string;
  local: { young?: number; working?: number; older: number };
  nz: { young?: number; working?: number; older: number };
}) {
  const twoBand = local.young == null || local.working == null;
  const older = local.older - nz.older;
  const takeaway =
    Math.abs(older) < 1.2
      ? `${name} has a similar age mix to Aotearoa.`
      : older > 0
        ? `${name} is older — ${pct(local.older)} are 65+, versus ${pct(nz.older)} nationally.`
        : `${name} is younger — ${pct(local.older)} are 65+, versus ${pct(nz.older)} nationally.`;
  return (
    <ChartFrame
      title="Who lives here, by age"
      takeaway={takeaway}
      why={
        twoBand
          ? "Census 2023. 0–14 is published for regions; districts show 65+ versus everyone under 65."
          : "Census 2023. Working-age is 15–64."
      }
    >
      {twoBand ? (
        <>
          <TwoBandRow label={name} older={local.older} />
          <TwoBandRow label="Aotearoa" older={nz.older} muted className="mt-3" />
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-lagoon" /> Under 65
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-kowhai" /> 65+
            </span>
          </div>
        </>
      ) : (
        <>
          <BandRow label={name} young={local.young!} working={local.working!} older={local.older} />
          <BandRow
            label="Aotearoa"
            young={nz.young ?? 0}
            working={nz.working ?? 0}
            older={nz.older}
            muted
            className="mt-3"
          />
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-lagoon-mid" /> 0–14
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-lagoon" /> 15–64
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-sm bg-kowhai" /> 65+
            </span>
          </div>
        </>
      )}
    </ChartFrame>
  );
}

function TwoBandRow({
  label,
  older,
  muted,
  className,
}: {
  label: string;
  older: number;
  muted?: boolean;
  className?: string;
}) {
  const under = 100 - older;
  return (
    <div className={className}>
      <div className="mb-1 text-xs font-medium">{label}</div>
      <div className={cn("bar-grow flex h-9 overflow-hidden rounded-lg text-[0.7rem] font-semibold text-panel", muted && "opacity-80")}>
        <div className="grid place-items-center bg-lagoon" style={{ width: `${under}%` }}>
          {under >= 14 ? `${under.toFixed(0)}%` : ""}
        </div>
        <div className="grid place-items-center bg-kowhai text-panel" style={{ width: `${older}%` }}>
          {older >= 10 ? `${older.toFixed(0)}%` : ""}
        </div>
      </div>
    </div>
  );
}

function BandRow({
  label,
  young,
  working,
  older,
  muted,
  className,
}: {
  label: string;
  young: number;
  working: number;
  older: number;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1 text-xs font-medium">{label}</div>
      <div className={cn("bar-grow flex h-9 overflow-hidden rounded-lg text-[0.7rem] font-semibold text-panel", muted && "opacity-80")}>
        <div className="grid place-items-center bg-lagoon-mid" style={{ width: `${young}%` }}>
          {young >= 10 ? `${young.toFixed(0)}%` : ""}
        </div>
        <div className="grid place-items-center bg-lagoon" style={{ width: `${working}%` }}>
          {working >= 14 ? `${working.toFixed(0)}%` : ""}
        </div>
        <div className="grid place-items-center bg-kowhai text-panel" style={{ width: `${older}%` }}>
          {older >= 10 ? `${older.toFixed(0)}%` : ""}
        </div>
      </div>
    </div>
  );
}

export function EthnicBars({
  rows,
}: {
  rows: { label: string; local: number; nz: number }[];
}) {
  const maori = rows.find((r) => r.label === "Māori");
  const takeaway = maori
    ? `Māori ethnicity is ${maori.local.toFixed(1)}% here (NZ ${maori.nz.toFixed(1)}%). People can belong to more than one group.`
    : "Total-response ethnicity — people can belong to more than one group.";
  const max = Math.max(...rows.flatMap((r) => [r.local, r.nz]), 1);
  return (
    <ChartFrame title="Ethnicity" takeaway={takeaway} why="Census 2023, total-response.">
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="font-medium">{r.label}</span>
              <span className="font-mono tabular-nums text-muted">
                {r.local.toFixed(1)}% · NZ {r.nz.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-2.5 overflow-hidden rounded-full bg-lagoon-soft">
                <div className="bar-grow h-full rounded-full bg-lagoon" style={{ width: `${(r.local / max) * 100}%` }} />
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-lagoon-soft">
                <div className="bar-grow h-full rounded-full bg-lagoon-mid" style={{ width: `${(r.nz / max) * 100}%` }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </ChartFrame>
  );
}

export function RankBars({
  rows,
  format,
  highlight,
}: {
  rows: { name: string; value: number }[];
  format: (v: number) => string;
  highlight: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.name}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className={cn("truncate font-medium", r.name === highlight && "text-lagoon")}>{r.name}</span>
            <b className="font-mono tabular-nums">{format(r.value)}</b>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-lagoon-soft">
            <div
              className={cn("bar-grow h-2.5 rounded-full", r.name === highlight ? "bg-lagoon" : "bg-lagoon-mid")}
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LqPills({ rows }: { rows: IndustryRow[] }) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {rows.map((r) => (
        <li key={r.id} className="rounded-xl border border-hair bg-panel px-3 py-3">
          <div className="text-xs font-bold tracking-wider text-muted uppercase">{r.short}</div>
          <div className="mt-1 font-mono text-xl font-semibold tabular-nums">{r.lq.toFixed(2)}×</div>
          <p className="mt-1 text-xs leading-snug text-muted">
            {pct(r.share)} of local GDP · NZ {pct(r.nzShare)} · {fmt(Math.round(r.jobs))} jobs
          </p>
        </li>
      ))}
    </ul>
  );
}

export function GlanceWaffles({
  items,
}: {
  items: { value: number; nz?: number; label: string }[];
}) {
  if (!items.length) return null;
  return (
    <div className={cn("stagger-in grid gap-3 grid-cols-2", items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
      {items.map((it) => {
        const n = Math.max(0, Math.min(100, Math.round(it.value)));
        const rawDiff = it.nz == null ? null : Math.round(it.value - it.nz);
        const vs =
          rawDiff == null
            ? null
            : rawDiff === 0
              ? "Same as Aotearoa"
              : rawDiff > 0
                ? `${rawDiff} more in 100 than NZ`
                : `${Math.abs(rawDiff)} fewer in 100 than NZ`;
        return (
          <article
            key={it.label}
            className="rounded-2xl border border-hair bg-panel p-4 shadow-[var(--shadow-sm)]"
          >
            <MiniWaffle n={n} />
            <div className="mt-2 font-mono text-2xl leading-none font-semibold tabular-nums">
              {n}{" "}
              <small className="font-sans text-sm font-medium text-muted">in 100</small>
            </div>
            <div className="mt-1 text-sm font-medium leading-snug">{it.label}</div>
            {vs ? <p className="mt-1 text-xs leading-snug text-muted">{vs}</p> : null}
          </article>
        );
      })}
    </div>
  );
}

function MiniWaffle({ n }: { n: number }) {
  return (
    <div className="grid grid-cols-10 gap-0.5" aria-hidden>
      {Array.from({ length: 100 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "aspect-square rounded-[2px]",
            i < n ? cn("bg-lagoon", "waffle-on") : "bg-lagoon-soft",
          )}
          style={i < n ? { animationDelay: `${i * 5}ms` } : undefined}
        />
      ))}
    </div>
  );
}

export function MixSlope({ rows, name }: { rows: IndustryRow[]; name: string }) {
  const data = [...rows]
    .map((r) => ({ ...r, diff: r.share - r.nzShare }))
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 6);
  const lead = data[0];
  const takeaway = lead
    ? lead.diff > 0
      ? `${lead.short} is ${lead.diff.toFixed(1)} points above the national share — the biggest over-index.`
      : `${lead.short} is ${Math.abs(lead.diff).toFixed(1)} points below the national share — the biggest under-index.`
    : undefined;
  const max = Math.max(...data.flatMap((d) => [d.share, d.nzShare]), 1);
  return (
    <ChartFrame
      title="Where the mix differs from Aotearoa"
      takeaway={takeaway}
      why={`Six industries with the largest gap versus the national share. Filled dot is ${shortPlace(name)}.`}
      footer={
        <p className="mt-3 flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-lagoon" /> {shortPlace(name)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border-2 border-lagoon-mid bg-panel" /> Aotearoa
          </span>
        </p>
      }
    >
      <div className="mb-2 hidden grid-cols-[6.5rem_3rem_1fr_3rem] gap-2 text-[0.65rem] font-bold tracking-wide text-muted uppercase sm:grid">
        <span />
        <span className="text-right">NZ</span>
        <span />
        <span>Here</span>
      </div>
      <ul className="space-y-3">
        {data.map((r) => {
          const a = (r.nzShare / max) * 100;
          const b = (r.share / max) * 100;
          return (
            <li
              key={r.id}
              className="grid grid-cols-[5.5rem_2.6rem_1fr_2.8rem] items-center gap-1.5 text-sm sm:grid-cols-[6.5rem_3rem_1fr_3rem] sm:gap-2"
            >
              <span className="truncate text-xs font-medium">{r.short}</span>
              <span className="text-right font-mono text-xs tabular-nums text-muted">{r.nzShare.toFixed(1)}</span>
              <div className="relative h-5">
                <div
                  className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-lagoon-mid"
                  style={{
                    left: `${Math.min(a, b)}%`,
                    width: `${Math.abs(a - b)}%`,
                  }}
                />
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${a}%` }}
                >
                  <span className="dot-pop block size-2.5 rounded-full border-2 border-lagoon-mid bg-panel" />
                </span>
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${b}%` }}
                >
                  <span className="dot-pop block size-3.5 rounded-full bg-lagoon" />
                </span>
              </div>
              <span
                className={cn(
                  "font-mono text-xs font-semibold tabular-nums",
                  r.diff > 0.4 ? "text-lagoon" : r.diff < -0.4 ? "text-kowhai" : "",
                )}
              >
                {r.share.toFixed(1)}
              </span>
            </li>
          );
        })}
      </ul>
    </ChartFrame>
  );
}

export function DepScale({
  local,
  nz,
  name,
}: {
  local: number;
  nz: number;
  name: string;
}) {
  const x = (d: number) => ((Math.max(1, Math.min(10, d)) - 1) / 9) * 100;
  const gap = local - nz;
  const takeaway =
    Math.abs(gap) < 0.3
      ? `${shortPlace(name)} is close to the national mean on NZDep2023.`
      : gap > 0
        ? `${shortPlace(name)} sits ${gap.toFixed(1)} deciles more deprived than Aotearoa.`
        : `${shortPlace(name)} sits ${Math.abs(gap).toFixed(1)} deciles less deprived than Aotearoa.`;
  return (
    <ChartFrame
      title="Where this place sits on NZDep2023"
      takeaway={takeaway}
      why="1 is least deprived, 10 is most. Mean of small areas, population-weighted."
    >
      <div className="px-1 pt-6 pb-2">
        <div className="relative h-12">
          <div
            className="absolute inset-x-0 top-4 h-3 rounded-full"
            style={{ background: `linear-gradient(to right, ${NZDEP_CSS.join(",")})` }}
          />
          <span
            className="absolute top-3.5 size-4 -translate-x-1/2 rounded-full border-2 border-panel bg-lagoon-mid"
            style={{ left: `${x(nz)}%` }}
            title={`Aotearoa ${nz.toFixed(1)}`}
          />
          <span
            className="absolute top-2.5 size-6 -translate-x-1/2 rounded-full border-2 border-panel bg-ink shadow-[var(--shadow-sm)]"
            style={{ left: `${x(local)}%` }}
            title={`${name} ${local.toFixed(1)}`}
          />
          <span
            className="absolute -top-1 -translate-x-1/2 font-mono text-[0.65rem] font-semibold tabular-nums"
            style={{ left: `${x(local)}%` }}
          >
            {local.toFixed(1)}
          </span>
        </div>
        <div className="mt-1 flex justify-between text-[0.65rem] font-bold tracking-wide text-muted uppercase">
          <span>1 least</span>
          <span>10 most</span>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-ink" /> {shortPlace(name)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-lagoon-mid" /> Aotearoa {nz.toFixed(1)}
        </span>
      </p>
    </ChartFrame>
  );
}

export function IndustryBars({ rows }: { rows: IndustryRow[]; showNz?: boolean }) {
  return <IndustryLollipop rows={rows} limit={15} />;
}

export function CompareBars({
  rows,
  aName = "This place",
  bName = "Compare",
}: {
  rows: { label: string; a: number; b: number; unit?: string }[];
  aName?: string;
  bName?: string;
}) {
  return (
    <Dumbbell
      aName={aName}
      bName={bName}
      rows={rows.map((r) => ({
        label: r.label,
        a: r.a,
        b: r.b,
        format: (n) => n.toFixed(1) + (r.unit ?? "%"),
      }))}
    />
  );
}

export function StackAge({
  local,
  nz,
  name,
}: {
  local: { young?: number; working?: number; older: number };
  nz: { young?: number; working?: number; older: number };
  name: string;
}) {
  return <AgeBands name={name} local={local} nz={nz} />;
}

