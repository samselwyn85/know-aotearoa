import { create } from "zustand";
import type { Level, MetricId, Place, ThemeId } from "./types";
import { findBySlug, metricById, rowsFor } from "./places";

type ExplorerState = {
  level: Level;
  metric: MetricId;
  theme: ThemeId;
  selected: Place | null;
  welcome: boolean;
  postcard: boolean;
  search: string;
  setLevel: (level: Level) => void;
  setMetric: (metric: MetricId) => void;
  setTheme: (theme: ThemeId) => void;
  select: (place: Place | null, opts?: { postcard?: boolean }) => void;
  openBySlug: (slug: string) => void;
  hideWelcome: () => void;
  hidePostcard: () => void;
  setSearch: (q: string) => void;
  reset: () => void;
};

export const useExplorer = create<ExplorerState>((set, get) => ({
  level: "regions",
  metric: "popChg",
  theme: "all",
  selected: null,
  welcome: true,
  postcard: false,
  search: "",
  setLevel: (level) => {
    const metric = metricById(level, get().metric).id;
    set({ level, metric, selected: null, postcard: false });
  },
  setMetric: (metric) => set({ metric }),
  setTheme: (theme) => set({ theme }),
  select: (place, opts) => {
    if (!place) {
      set({ selected: null, postcard: false, welcome: false });
      return;
    }
    const level: Level = place.region === undefined ? "regions" : "districts";
    const metric = metricById(level, get().metric).id;
    set({
      selected: place,
      level,
      metric,
      welcome: false,
      postcard: opts?.postcard === true,
    });
  },
  openBySlug: (slug) => {
    const place = findBySlug(slug);
    if (place) get().select(place, { postcard: false });
  },
  hideWelcome: () => set({ welcome: false }),
  hidePostcard: () => set({ postcard: false }),
  setSearch: (search) => set({ search }),
  reset: () =>
    set({
      level: "regions",
      metric: "popChg",
      theme: "all",
      selected: null,
      postcard: false,
      search: "",
    }),
}));

export function currentRows() {
  const { level } = useExplorer.getState();
  return rowsFor(level);
}
