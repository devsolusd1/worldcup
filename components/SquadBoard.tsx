"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountryToken, HubToken } from "@/lib/countries";
import type { TokenSummary } from "@/lib/dexscreener";
import { HubCard } from "./HubCard";
import { CountryCard } from "./CountryCard";

type PricesResponse = {
  updatedAt: number;
  tokens: Record<string, TokenSummary>;
  error?: string;
};

type Props = {
  hub: HubToken;
  countries: CountryToken[];
};

const REFRESH_MS = 30_000;

const EMPTY_SUMMARY: TokenSummary = {
  mint: "",
  priceUsd: null,
  marketCap: null,
  fdv: null,
  liquidityUsd: null,
  volume24h: null,
  priceChange24h: null,
  pairUrl: null,
};

export function SquadBoard({ hub, countries }: Props) {
  const [data, setData] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/prices", { cache: "no-store" });
        const json = (await res.json()) as PricesResponse;
        if (alive) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (alive) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const cards = useMemo(
    () => buildCards(countries, data?.tokens ?? {}),
    [countries, data],
  );

  const hubSummary = hub.mint ? (data?.tokens?.[hub.mint] ?? null) : null;
  const liveCount = cards.filter((c) => c.summary.priceUsd !== null).length;

  return (
    <div className="space-y-8">
      <HubCard hub={hub} summary={hubSummary} />

      <div className="flex items-center justify-between text-xs">
        <span className="pulse-dot pl-5 font-semibold text-white/80">
          {liveCount} of {countries.length} country coins live
        </span>
        <span className="tabular text-white/40">
          {loading
            ? "loading…"
            : data
              ? `updated ${new Date(data.updatedAt).toLocaleTimeString()}`
              : "no data"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map(({ country, summary, rank }) => (
          <CountryCard
            key={country.id}
            rank={rank}
            country={country}
            summary={summary}
          />
        ))}
      </div>
    </div>
  );
}

type CardData = {
  country: CountryToken;
  summary: TokenSummary;
  rank: number | null;
};

function buildCards(
  countries: CountryToken[],
  tokens: Record<string, TokenSummary>,
): CardData[] {
  const enriched = countries.map((country) => ({
    country,
    summary: country.mint
      ? (tokens[country.mint] ?? EMPTY_SUMMARY)
      : EMPTY_SUMMARY,
  }));

  enriched.sort((a, b) => {
    const aLive = a.summary.priceUsd !== null;
    const bLive = b.summary.priceUsd !== null;
    if (aLive !== bLive) return aLive ? -1 : 1;
    const aCap = a.summary.marketCap ?? 0;
    const bCap = b.summary.marketCap ?? 0;
    if (aCap !== bCap) return bCap - aCap;
    return a.country.name.localeCompare(b.country.name);
  });

  return enriched.map((row, i) => ({
    ...row,
    rank: row.summary.priceUsd !== null ? i + 1 : null,
  }));
}
