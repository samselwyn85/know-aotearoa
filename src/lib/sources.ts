import type { Source } from "./types";

export const SRC = {
  census: {
    label: "Stats NZ · 2023 Census",
    url: "https://www.stats.govt.nz/information-releases/2023-census-population-counts-by-ethnic-group-age-and-maori-descent-and-dwelling-counts/",
  },
  rgdp: {
    label: "Stats NZ · Regional GDP YE Mar 2024 (revised)",
    url: "https://www.stats.govt.nz/information-releases/regional-gross-domestic-product-year-ended-march-2025/",
  },
  tagdp: {
    label: "MBIE · Modelled TA GDP 2025 (experimental)",
    url: "https://www.mbie.govt.nz/business-and-employment/economic-growth/regional-economic-development/modelled-territorial-authority-gross-domestic-product/2025-release",
  },
  place: (slug: string): Source => ({
    label: "Stats NZ · Place summaries",
    url:
      "https://tools.summaries.stats.govt.nz/places/" +
      (String(slug).endsWith("-region") ? "RC/" : "TA/") +
      slug,
  }),
  ade: { label: "Aotearoa Data Explorer", url: "https://explore.data.stats.govt.nz" },
  edu: {
    label: "Education Counts · Know your region",
    url: "https://www.educationcounts.govt.nz/know-your-region",
  },
  eduRoll: {
    label: "MoE · Schools Directory",
    url: "https://catalogue.data.govt.nz/dataset/directory-of-educational-institutions",
  },
  nzqa: {
    label: "NZQA · NCEA 2025",
    url: "https://www2.nzqa.govt.nz/ncea/understanding-secondary-quals/secondary-school-stats/2025/",
  },
  hudAS: {
    label: "HUD · Accommodation Supplement",
    url: "https://catalogue.data.govt.nz/dataset/housing-support-quarterly-data",
  },
  hudHouse: {
    label: "HUD · Social housing tenancies",
    url: "https://catalogue.data.govt.nz/dataset/housing-support-quarterly-data",
  },
  nzdep: {
    label: "University of Otago · NZDep2023",
    url: "https://www.otago.ac.nz/wellington/research/groups/research-groups-in-the-department-of-public-health/hirp/socioeconomic-deprivation-indexes",
  },
  ehinz: {
    label: "EHINZ · NZDep2023 SA1 map",
    url: "https://www.ehinz.ac.nz/indicators/population-vulnerability/socioeconomic-deprivation-profile",
  },
  life: {
    label: "Stats NZ · Period life tables 2022–2024",
    url: "https://www.stats.govt.nz/information-releases/national-and-subnational-period-life-tables-2022-2024/",
  },
  rear: {
    label: "MBIE · Regional Economic Activity",
    url: "https://webrear.mbie.govt.nz/",
  },
  rgdp25: {
    label: "Stats NZ · Regional GDP YE Mar 2025",
    url: "https://www.stats.govt.nz/information-releases/regional-gross-domestic-product-year-ended-march-2025/",
  },
  hlfs: {
    label: "Stats NZ · Household Labour Force Survey June 2026",
    url: "https://www.stats.govt.nz/information-releases/labour-market-statistics-june-2026-quarter/",
  },
} satisfies Record<string, Source | ((s: string) => Source)>;
