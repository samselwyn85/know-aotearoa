import { toast } from "sonner";
import { useExplorer } from "@/lib/store";
import { NZ } from "@/lib/places";
import { fmt, isRegion, money, pct } from "@/lib/format";
import { pcRel, postcardChips, soWhatLine, placeKind } from "@/lib/insights";
import { Button } from "@/components/ui/button";
import type { Place } from "@/lib/types";
import { placeShareUrl } from "@/lib/utils";

function Bar({ a, b }: { a: number; b: number }) {
  const scale = Math.max(Math.abs(a), Math.abs(b), 0.001);
  const w = (v: number) => Math.max(3, Math.round((Math.abs(v) / scale) * 100));
  return (
    <div className="mt-1.5 grid gap-1">
      <div className="h-2 overflow-hidden rounded-full bg-lagoon-soft">
        <i className="block h-full rounded-full bg-lagoon" style={{ width: `${w(a)}%` }} />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-lagoon-soft">
        <i className="block h-full rounded-full bg-lagoon/45" style={{ width: `${w(b)}%` }} />
      </div>
    </div>
  );
}

function Row({
  lbl,
  placeTxt,
  nzTxt,
  a,
  b,
  delta,
}: {
  lbl: string;
  placeTxt: string;
  nzTxt: string;
  a: number;
  b: number;
  delta: string;
}) {
  return (
    <div className="mb-3">
      <div className="text-[0.68rem] font-bold tracking-wider text-muted uppercase">{lbl}</div>
      <div className="mt-1 flex justify-between gap-3 text-[0.86rem]">
        <span>
          This place <b className="font-mono tabular-nums">{placeTxt}</b>
        </span>
        <span>
          NZ <b className="font-mono tabular-nums">{nzTxt}</b>
        </span>
      </div>
      <Bar a={a} b={b} />
      <div className="mt-1 text-[0.75rem] text-muted">{delta}</div>
    </div>
  );
}

export function Postcard({ place }: { place: Place }) {
  const hide = useExplorer((s) => s.hidePostcard);
  const k = placeKind(place);
  const chips = postcardChips(place);
  const rows: {
    lbl: string;
    placeTxt: string;
    nzTxt: string;
    a: number;
    b: number;
    delta: string;
  }[] = [
    {
      lbl: "Population growth 2018–23",
      placeTxt: (place.popChg >= 0 ? "+" : "") + place.popChg.toFixed(1) + "%",
      nzTxt: "+" + NZ.chg.toFixed(1) + "%",
      a: place.popChg,
      b: NZ.chg,
      delta: (place.popChg - NZ.chg >= 0 ? "+" : "") + (place.popChg - NZ.chg).toFixed(1) + " pp vs NZ",
    },
  ];
  if (place.maoriEth != null && NZ.maoriEth != null) {
    rows.push({
      lbl: "Māori share",
      placeTxt: pct(place.maoriEth),
      nzTxt: pct(NZ.maoriEth),
      a: place.maoriEth,
      b: NZ.maoriEth,
      delta:
        (place.maoriEth - NZ.maoriEth >= 0 ? "+" : "") +
        (place.maoriEth - NZ.maoriEth).toFixed(1) +
        " pp vs NZ",
    });
  }
  if (place.medAge != null && NZ.medAge != null) {
    rows.push({
      lbl: "Median age",
      placeTxt: place.medAge.toFixed(1) + " yrs",
      nzTxt: NZ.medAge.toFixed(1) + " yrs",
      a: place.medAge,
      b: NZ.medAge,
      delta:
        (place.medAge - NZ.medAge >= 0 ? "+" : "") +
        (place.medAge - NZ.medAge).toFixed(1) +
        " yrs vs NZ",
    });
  }
  if (place.gdpPC != null) {
    rows.push({
      lbl: "GDP per person",
      placeTxt: money(place.gdpPC),
      nzTxt: money(NZ.gdpPC),
      a: place.gdpPC,
      b: NZ.gdpPC,
      delta: pcRel(place.gdpPC),
    });
  }
  if (place.nceaL2pct != null && NZ.nceaL2pct != null) {
    rows.push({
      lbl: "Year 12 NCEA Level 2 (2025)",
      placeTxt: pct(place.nceaL2pct),
      nzTxt: pct(NZ.nceaL2pct),
      a: place.nceaL2pct,
      b: NZ.nceaL2pct,
      delta:
        (place.nceaL2pct - NZ.nceaL2pct >= 0 ? "+" : "") +
        (place.nceaL2pct - NZ.nceaL2pct).toFixed(1) +
        " pp vs NZ",
    });
  }
  if (place.depHighPct != null && NZ.depHighPct != null) {
    rows.push({
      lbl: "People in NZDep2023 deciles 8–10",
      placeTxt: pct(place.depHighPct),
      nzTxt: pct(NZ.depHighPct),
      a: place.depHighPct,
      b: NZ.depHighPct,
      delta:
        (place.depHighPct - NZ.depHighPct >= 0 ? "+" : "") +
        (place.depHighPct - NZ.depHighPct).toFixed(1) +
        " pp vs NZ",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-auto bg-ink/70 p-0 sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) hide();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pc-name"
    >
      <div className="card-enter max-h-[88vh] w-full overflow-auto rounded-t-[28px] bg-paper px-5 py-6 shadow-[var(--shadow-lg)] sm:max-w-[480px] sm:rounded-[28px] sm:px-8 sm:py-8">
        <div className="text-[0.7rem] font-bold tracking-[0.14em] text-lagoon uppercase">{k.line}</div>
        <h2
          id="pc-name"
          className="mt-1 font-display text-[clamp(2rem,5.4vw,3rem)] leading-[1.05] font-medium tracking-tight"
        >
          {place.name}
        </h2>
        <p className="mt-4 text-[clamp(1.05rem,2.4vw,1.32rem)] leading-snug font-semibold text-kowhai">
          {soWhatLine(place)}
        </p>
        {rows.map((r) => (
          <Row key={r.lbl} {...r} />
        ))}
        {chips.length > 0 && (
          <div className="mt-4 mb-3 flex flex-wrap gap-1.5">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-hair bg-panel px-3 py-1 text-[0.74rem] font-semibold"
              >
                {c}
              </span>
            ))}
          </div>
        )}
        <p className="mt-2 text-[0.72rem] leading-relaxed text-muted">
          Stats NZ 2023 Census
          {place.gdpPC != null
            ? isRegion(place)
              ? " · Regional GDP YE Mar 2024"
              : " · MBIE modelled TA GDP (experimental)"
            : ""}
          {place.depHighPct != null ? " · University of Otago NZDep2023" : ""}
          {" · "}
          {fmt(place.pop23)} people
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={hide}>Open the full brief</Button>
          <Button
            variant="secondary"
            onClick={() => {
              const url = placeShareUrl(place.slug);
              void navigator.clipboard?.writeText(url).then(
                () => toast("Link copied"),
                () => toast("Couldn’t copy — copy from the address bar"),
              );
            }}
          >
            Copy link
          </Button>
          <Button variant="ghost" onClick={hide}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
