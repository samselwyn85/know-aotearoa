#!/usr/bin/env python3
"""Re-download official Stats NZ files used by Know Aotearoa.

Live ADE (api.data.stats.govt.nz) requires a subscription key — we do not hold one.
These public files are the official sources. Re-run when Stats NZ publishes a new
RGDP, HLFS, or census population-count workbook.
"""
from __future__ import annotations

URLS = {
    "rgdp.csv": "https://www.stats.govt.nz/assets/Uploads/Regional-gross-domestic-product/Regional-gross-domestic-product-Year-ended-March-2025/Download-data/regional-gross-domestic-product-year-ended-march-2025.csv",
    "hlfs.xlsx": "https://www.stats.govt.nz/assets/Uploads/Labour-market-statistics/Labour-market-statistics-June-2026-quarter/Download-data/household-labour-force-survey-june-2026-quarter.xlsx",
    "census.xlsx": "https://www.stats.govt.nz/assets/Uploads/2023-Census-population-counts-by-ethnic-group-age-and-Maori-descent-and-dwelling-counts/Downloads/2023-Census-national-and-subnational-usually-resident-population-counts-and-dwelling-counts.xlsx",
}

if __name__ == "__main__":
    print("Official sources (fetched 21 Aug 2026 into src/data/official-*.json):")
    for name, url in URLS.items():
        print(f"  {name}: {url}")
    print("The running app reads the verified snapshot, not a live ADE feed.")
