import { useExplorer } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { TABS } from "@/lib/economy";
import { IslandMark } from "./scenes";

export function Welcome({ onFind }: { onFind: () => void }) {
  const hide = useExplorer((s) => s.hideWelcome);
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-ink p-5 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="pointer-events-none absolute -right-10 -bottom-16 h-[120%] w-[78%] text-lagoon opacity-40 sm:w-[52%]">
        <IslandMark ink />
      </div>
      <div className="paper-grain scene-enter relative z-10 w-full max-w-[560px] rounded-sheet bg-paper px-6 py-12 text-center shadow-[var(--shadow-lg)] sm:px-10">
        <p className="kicker text-lagoon">Official numbers · 2023 Census</p>
        <h2 id="welcome-title" className="display-bleed mt-4">
          Know Aotearoa
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Tap a place. Walk six rooms — people, production, work, home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {TABS.map((t, i) => (
            <span key={t.id} className="text-xs font-semibold tracking-wide text-lagoon">
              <span className="font-mono text-[0.65rem] tabular-nums text-muted">0{i + 1} </span>
              {t.reo}
            </span>
          ))}
        </div>
        <Button
          size="lg"
          className="mt-8 w-full"
          onClick={() => {
            hide();
            onFind();
          }}
        >
          Find my place
        </Button>
        <button type="button" className="mt-3 min-h-11 w-full py-2 text-sm font-bold text-lagoon" onClick={hide}>
          Or search a region or district
        </button>
        <button
          type="button"
          className="mt-4 min-h-11 w-full text-sm text-muted underline underline-offset-4"
          onClick={hide}
        >
          Skip to the map
        </button>
      </div>
    </div>
  );
}
