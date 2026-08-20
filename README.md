# Know Aotearoa

Official numbers for every region and district in Aotearoa New Zealand — 2023 Census, Stats NZ regional GDP, HLFS, NZDep2023 — drawn as rooms you can walk through.

Live source snapshot: 21 August 2026.

## Open it

This is a TanStack Start app (React 19 + Vite). It is **not** a single HTML file.

```bash
npm install
npm run dev
```

Then open the local URL Vite prints.

## Deploy on Vercel (public link)

1. Open [vercel.com/new](https://vercel.com/new) and import this repository.
2. Framework preset: Vite / Other. Build command `npm run build`. Output is handled by the Nitro Vercel preset already in `vite.config.ts`.
3. Leave env empty for a public read-only site (sign-in is optional).

Or from a machine with the Vercel CLI:

```bash
npx vercel --yes
```

## What the numbers are

- Population, age, ethnicity, dwellings: Stats NZ 2023 Census
- Regional GDP: Stats NZ YE Mar 2025 release (2024 revised, 2025 provisional)
- District GDP: MBIE modelled (experimental)
- Unemployment: HLFS June 2026
- Deprivation: University of Otago NZDep2023

Census is a snapshot, not a live feed.

## Licence

Data remains with its official publishers. The interface is yours to fork.
