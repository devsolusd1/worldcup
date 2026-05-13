# CUP Coins

Country meme coins for the 2026 FIFA World Cup. 48 nations + 1 hub token, all
launched on Raydium Launchlab, all with mint addresses ending in `CUP`.

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind 4
- Dexscreener API for live market data (proxied at `/api/prices`, revalidates
  every 30s server-side; the client also polls every 30s)

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Filling in mint addresses

Each country starts with `mint: null` in [lib/countries.ts](lib/countries.ts).
Once you have generated a vanity address ending in `CUP` (see
[scripts/grind-vanity.md](scripts/grind-vanity.md)) and launched the token on
Launchlab, paste the mint address into the matching country entry. The board
will pick it up on next refresh.

```ts
// before
c("brazil", "Brazil", "BRA", "🇧🇷"),

// after
{ ...c("brazil", "Brazil", "BRA", "🇧🇷"), mint: "Yo...someAddressEndingInCUP" },
```

You can also attach a direct `launchlabUrl` if you want the "Launchlab" link to
appear before the pair is indexed on Dexscreener.

## Project layout

```
app/
  page.tsx              — landing page
  layout.tsx            — root layout + metadata
  globals.css           — Tailwind + theme tokens
  api/prices/route.ts   — Dexscreener proxy (revalidate 30s)
components/
  HubCard.tsx           — featured card for the hub token ($CUP)
  SquadBoard.tsx        — sortable client-side table
lib/
  countries.ts          — 48 country + hub config
  dexscreener.ts        — fetch + summarize Dexscreener pairs
  format.ts             — number/price formatters
scripts/
  grind-vanity.md       — how to generate ...CUP vanity keypairs
```

## Notes

- The 48-team list reflects expected qualifiers and the 3 hosts (USA, Canada,
  Mexico). Adjust [lib/countries.ts](lib/countries.ts) to match the final FIFA
  draw before launch.
- Private keys for vanity addresses must NEVER be committed. The `.gitignore`
  excludes `vanity-keys/` and `*.keypair.json`.
