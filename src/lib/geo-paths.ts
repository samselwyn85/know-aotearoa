import raw from "@/data/paths.json";

export type GeoPath = { name: string; d: string };

type PathsFile = {
  viewBox: string;
  regions: GeoPath[];
  districts: GeoPath[];
};

export const PATHS = raw as PathsFile;
