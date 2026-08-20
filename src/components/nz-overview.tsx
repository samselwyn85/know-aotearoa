import { NZ, metricById, rowsFor } from "@/lib/places";
import { fmt, money, oneIn } from "@/lib/format";
import { SRC } from "@/lib/sources";
import { useExplorer } from "@/lib/store";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export function NzOverview() {
  const level = useExplorer((s) => s.level);
  const metricId = useExplorer((s) => s.metric);
  const select = useExplorer((s) => s.select);
  const md = metricById(level, metricId);
  const rows = rowsFor(level).filter((r) => md.get(r) != null);
  const sorted = [...rows].sort((a, b) => (md.get(b) ?? 0) - (md.get(a) ?? 0));
  const top = sorted.slice(0, 5);
  const bot = sorted.slice(-5).reverse();
  const maxV = rows.length ? Math.max(...rows.map((r) => md.get(r) ?? 0)) : 1;
  const minV = rows.length ? Math.min(...rows.map((r) => md.get(r) ?? 0)) : 0;
  const barW = (v: number) => Math.max(6, Math.round(((v - minV) / (maxV - minV || 1)) * 100));
  const maoriOne = oneIn(NZ.maoriEth);
  const age65 = oneIn(NZ.p65);

  return (
    <div>
      <div className="text-xs font-bold tracking-[0.08em] text-muted uppercase">National picture</div>
      <h2 className="mt-1 font-display text-[clamp(1.9rem,4vw,2.6rem)] leading-tight font-medium tracking-tight">
        Aotearoa New Zealand
      </h2>
      <p className="mt-1 text-sm text-muted">
        {fmt(NZ.pop23)} people at the 2023 Census · every figure below is verified at source
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Mini
          label="Population"
          hero={fmt(NZ.pop23)}
          cmp={"↑" + NZ.chg.toFixed(1) + "% since 2018"}
          src={SRC.census.label}
        />
        <Mini
          label="GDP YE Mar 2024"
          hero={"$" + Math.round(NZ.gdpB)}
          unit="billion"
          cmp={money(NZ.gdpPC) + " per person"}
          src={SRC.rgdp.label}
        />
        <Mini
          label="Māori (ethnicity)"
          hero={NZ.maoriEth.toFixed(1) + "%"}
          cmp={maoriOne ? "About 1 in " + maoriOne : "Census ethnicity"}
          src={SRC.census.label}
        />
        <Mini
          label="Median age"
          hero={NZ.medAge.toFixed(1)}
          unit="years"
          cmp={age65 ? "1 in " + age65 + " is 65 or older" : "Census age"}
          src={SRC.census.label}
        />
      </div>
      <div className="mt-8">
        <h3 className="text-xs font-bold tracking-[0.1em] text-muted uppercase">
          {md.label} — {level} ranked
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <RankCol title="Highest" rows={top} format={md.format} get={md.get} barW={barW} onPick={select} low={false} />
          <RankCol title="Lowest" rows={bot} format={md.format} get={md.get} barW={barW} onPick={select} low />
        </div>
        <p className="mt-4 text-xs text-muted">
          Change the map colouring to re-rank, or use Find my place to open a decision brief for your
          district.
        </p>
      </div>
      <Link
        to="/profile/$slug"
        params={{ slug: "wellington-city" }}
        className="mt-8 flex items-start justify-between gap-3 rounded-2xl border border-lagoon/25 bg-lagoon-soft/80 p-4 transition hover:border-lagoon"
      >
        <div>
          <div className="text-[0.7rem] font-extrabold tracking-[0.1em] text-lagoon uppercase">
            Regional economic profile
          </div>
          <h3 className="mt-1 font-display text-xl font-medium">Start with Wellington City</h3>
          <p className="mt-1 text-sm leading-snug text-muted">
            GDP, industries, labour and people in the same shape as Infometrics’ public profiles —
            every region and district is in the catalogue.
          </p>
        </div>
      </Link>
    </div>
  );
}

function Mini({
  label,
  hero,
  unit,
  cmp,
  src,
}: {
  label: string;
  hero: string;
  unit?: string;
  cmp: string;
  src: string;
}) {
  return (
    <article className="flex flex-col gap-1.5 rounded-2xl border border-hair bg-panel p-4 shadow-[var(--shadow-sm)]">
      <div className="text-xs font-bold tracking-wider text-muted uppercase">{label}</div>
      <div className="font-mono text-2xl font-semibold tracking-tight tabular-nums">
        {hero} {unit ? <small className="text-sm font-medium text-muted">{unit}</small> : null}
      </div>
      <div className="w-fit rounded-md bg-kowhai-bg px-2 py-0.5 text-xs font-bold text-kowhai">{cmp}</div>
      <div className="mt-auto border-t border-dashed border-hair pt-2 text-xs font-semibold text-lagoon">{src}</div>
    </article>
  );
}

function RankCol({
  title,
  rows,
  get,
  format,
  barW,
  onPick,
  low,
}: {
  title: string;
  rows: Place[];
  get: (r: Place) => number | null | undefined;
  format: (v: number) => string;
  barW: (v: number) => number;
  onPick: (p: Place, opts?: { postcard?: boolean }) => void;
  low: boolean;
}) {
  return (
    <div>
      <h4 className="mb-2 text-xs text-muted">{title}</h4>
      {rows.map((r) => {
        const v = get(r);
        if (v == null) return null;
        return (
          <button
            key={r.name}
            type="button"
            className="grid w-full grid-cols-[minmax(90px,38%)_1fr_auto] items-center gap-2 py-1.5 text-left text-sm"
            onClick={() => onPick(r)}
          >
            <span className="truncate font-medium hover:text-lagoon">{r.name}</span>
            <span
              className={cn("h-2 rounded-full", low ? "bg-lagoon/35" : "bg-lagoon")}
              style={{ width: `${barW(v)}%` }}
            />
            <b className="font-mono text-xs font-semibold tabular-nums">{format(v)}</b>
          </button>
        );
      })}
    </div>
  );
}
