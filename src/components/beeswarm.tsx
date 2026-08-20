import { useMemo, useState } from "react";
import { metricById } from "@/lib/places";
import { placeKind, swarmCaption } from "@/lib/insights";
import { shortPlace } from "@/lib/format";
import { useExplorer } from "@/lib/store";
import type { Place } from "@/lib/types";

function medianOf(vals: number[]) {
  const a = [...vals].sort((x, y) => x - y);
  const n = a.length;
  if (!n) return null;
  return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
}

function nameJitter(name: string) {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function Beeswarm({ place }: { place: Place }) {
  const level = useExplorer((s) => s.level);
  const metricId = useExplorer((s) => s.metric);
  const select = useExplorer((s) => s.select);
  const md = metricById(level, metricId);
  const k = placeKind(place);
  const [hover, setHover] = useState("");

  const model = useMemo(() => {
    const get = md.get;
    const pts = k.peers.filter((r) => get(r) != null);
    if (pts.length < 2) return null;
    const vals = pts.map((r) => get(r)!);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);
    const med = medianOf(vals)!;
    const W = 520;
    const H = 78;
    const pad = 28;
    const mid = 38;
    const xOf = (v: number) => pad + (hi === lo ? 0.5 : (v - lo) / (hi - lo)) * (W - 2 * pad);
    return { pts, lo, hi, med, W, H, pad, mid, xOf };
  }, [k.peers, md, place.name]);

  if (!model) return null;
  const v = md.get(place);
  const caption =
    v != null ? swarmCaption(place.name, v, model.med, md.short.toLowerCase(), k.words) : "";

  return (
    <div className="mt-2">
      <p className="text-[0.68rem] font-bold tracking-[0.12em] text-lagoon uppercase">
        You among {k.peers.length}
      </p>
      <p className="mt-1 text-[0.92rem] leading-snug text-ink">{caption}</p>
      <svg className="mt-1 block h-[78px] w-full" viewBox={`0 0 ${model.W} ${model.H}`}>
        <line
          x1={model.xOf(model.med)}
          y1="16"
          x2={model.xOf(model.med)}
          y2="60"
          stroke="currentColor"
          strokeWidth="0.7"
          className="text-ink/40"
        />
        <text
          x={model.xOf(model.med)}
          y="13"
          textAnchor="middle"
          className="fill-muted font-mono text-[9px]"
        >
          median
        </text>
        <text x={model.pad} y="74" className="fill-muted font-mono text-[9px]">
          {md.format(model.lo)}
        </text>
        <text
          x={model.W - model.pad}
          y="74"
          textAnchor="end"
          className="fill-muted font-mono text-[9px]"
        >
          {md.format(model.hi)}
        </text>
        {model.pts.map((r) => {
          const you = r.name === place.name;
          const cy = model.mid + (nameJitter(r.name) - 0.5) * (you ? 8 : 28);
          return (
            <circle
              key={r.name}
              cx={model.xOf(md.get(r)!)}
              cy={cy}
              r={you ? 6.2 : 3.2}
              className={you ? "fill-lagoon stroke-ink" : "fill-lagoon-soft stroke-lagoon"}
              strokeWidth={you ? 1.3 : 1}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(`${shortPlace(r.name)} · ${md.format(md.get(r)!)}`)}
              onMouseLeave={() => setHover("")}
              onClick={() => {
                if (r.name !== place.name) select(r);
              }}
            />
          );
        })}
      </svg>
      <div className="min-h-[1.15em] text-[0.75rem] text-muted">{hover}</div>
    </div>
  );
}
