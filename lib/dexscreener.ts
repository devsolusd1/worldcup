export type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number };
  fdv?: number;
  marketCap?: number;
};

export type TokenSummary = {
  mint: string;
  priceUsd: number | null;
  marketCap: number | null;
  fdv: number | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  pairUrl: string | null;
};

// Dexscreener tokens endpoint supports up to 30 comma-separated addresses.
const MAX_PER_REQUEST = 30;

export async function fetchTokenSummaries(
  mints: string[],
): Promise<Record<string, TokenSummary>> {
  if (mints.length === 0) return {};

  const batches: string[][] = [];
  for (let i = 0; i < mints.length; i += MAX_PER_REQUEST) {
    batches.push(mints.slice(i, i + MAX_PER_REQUEST));
  }

  const results = await Promise.all(
    batches.map(async (batch) => {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${batch.join(",")}`;
      const res = await fetch(url, { next: { revalidate: 30 } });
      if (!res.ok) {
        throw new Error(`Dexscreener responded ${res.status}`);
      }
      const json = (await res.json()) as { pairs: DexPair[] | null };
      return json.pairs ?? [];
    }),
  );

  const allPairs = results.flat();
  return summarizePairs(allPairs, mints);
}

function summarizePairs(
  pairs: DexPair[],
  mints: string[],
): Record<string, TokenSummary> {
  const byMint: Record<string, DexPair[]> = {};
  for (const pair of pairs) {
    const mint = pair.baseToken.address;
    if (!byMint[mint]) byMint[mint] = [];
    byMint[mint].push(pair);
  }

  const out: Record<string, TokenSummary> = {};
  for (const mint of mints) {
    const tokenPairs = byMint[mint];
    if (!tokenPairs || tokenPairs.length === 0) {
      out[mint] = {
        mint,
        priceUsd: null,
        marketCap: null,
        fdv: null,
        liquidityUsd: null,
        volume24h: null,
        priceChange24h: null,
        pairUrl: null,
      };
      continue;
    }
    const best = tokenPairs.reduce((a, b) =>
      (b.liquidity?.usd ?? 0) > (a.liquidity?.usd ?? 0) ? b : a,
    );
    out[mint] = {
      mint,
      priceUsd: best.priceUsd ? Number(best.priceUsd) : null,
      marketCap: best.marketCap ?? best.fdv ?? null,
      fdv: best.fdv ?? null,
      liquidityUsd: best.liquidity?.usd ?? null,
      volume24h: best.volume?.h24 ?? null,
      priceChange24h: best.priceChange?.h24 ?? null,
      pairUrl: best.url ?? null,
    };
  }
  return out;
}
