"use client";

import { useEffect, useMemo, useState } from "react";
import type { CountryToken, HubToken } from "@/lib/countries";
import type { TokenSummary } from "@/lib/dexscreener";
import { HubCard } from "./HubCard";
import {
  formatPct,
  formatPrice,
  formatUsdCompact,
  shortMint,
} from "@/lib/format";

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

  const rows = useMemo(() => buildRows(countries, data?.tokens ?? {}), [
    countries,
    data,
  ]);

  const hubSummary = hub.mint ? (data?.tokens?.[hub.mint] ?? null) : null;
  const liveCount = rows.filter((r) => r.summary.priceUsd !== null).length;

  return (
    <div className="space-y-8">
      <HubCard hub={hub} summary={hubSummary} />

      <div className="flex items-center justify-between text-xs text-white/40">
        <span>
          {liveCount} of {countries.length} country coins live
        </span>
        <span className="tabular">
          {loading
            ? "loading…"
            : data
              ? `updated ${new Date(data.updatedAt).toLocaleTimeString()}`
              : "no data"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-widest text-white/40">
              <th className="px-4 py-3 sm:px-5">#</th>
              <th className="px-4 py-3 sm:px-5">Country</th>
              <th className="px-4 py-3 sm:px-5">Ticker</th>
              <th className="px-4 py-3 text-right sm:px-5">Price</th>
              <th className="px-4 py-3 text-right sm:px-5">24h</th>
              <th className="px-4 py-3 text-right sm:px-5">Market cap</th>
              <th className="px-4 py-3 text-right sm:px-5">Volume 24h</th>
              <th className="px-4 py-3 text-right sm:px-5">Trade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <Row key={row.country.id} rank={i + 1} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type RowData = {
  country: CountryToken;
  summary: TokenSummary;
};

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

function buildRows(
  countries: CountryToken[],
  tokens: Record<string, TokenSummary>,
): RowData[] {
  const rows: RowData[] = countries.map((country) => ({
    country,
    summary: country.mint ? (tokens[country.mint] ?? EMPTY_SUMMARY) : EMPTY_SUMMARY,
  }));

  rows.sort((a, b) => {
    const aLive = a.summary.priceUsd !== null;
    const bLive = b.summary.priceUsd !== null;
    if (aLive !== bLive) return aLive ? -1 : 1;
    const aCap = a.summary.marketCap ?? 0;
    const bCap = b.summary.marketCap ?? 0;
    if (aCap !== bCap) return bCap - aCap;
    return a.country.name.localeCompare(b.country.name);
  });

  return rows;
}

function Row({ rank, row }: { rank: number; row: RowData }) {
  const { country, summary } = row;
  const live = Boolean(country.mint) && summary.priceUsd !== null;
  const change = summary.priceChange24h;
  const changeColor =
    change == null
      ? "text-white/30"
      : change >= 0
        ? "text-[var(--green)]"
        : "text-[var(--red)]";

  return (
    <tr className="border-t border-white/5 hover:bg-white/[0.03]">
      <td className="px-4 py-4 text-white/40 tabular sm:px-5">{rank}</td>
      <td className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>
            {country.flag}
          </span>
          <div>
            <div className="font-medium">{country.name}</div>
            {country.mint ? (
              <a
                href={`https://solscan.io/token/${country.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] tabular text-white/30 hover:text-white/60"
              >
                {shortMint(country.mint)}
              </a>
            ) : (
              <span className="text-[10px] uppercase tracking-widest text-white/30">
                soon
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 font-mono text-xs text-white/70 sm:px-5">
        ${country.ticker}
      </td>
      <td className="px-4 py-4 text-right tabular sm:px-5">
        {live ? formatPrice(summary.priceUsd) : "—"}
      </td>
      <td className={`px-4 py-4 text-right tabular sm:px-5 ${changeColor}`}>
        {live ? formatPct(change) : "—"}
      </td>
      <td className="px-4 py-4 text-right tabular sm:px-5">
        {live ? formatUsdCompact(summary.marketCap) : "—"}
      </td>
      <td className="px-4 py-4 text-right tabular sm:px-5">
        {live ? formatUsdCompact(summary.volume24h) : "—"}
      </td>
      <td className="px-4 py-4 text-right sm:px-5">
        {live && summary.pairUrl ? (
          <a
            href={summary.pairUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-white/90"
          >
            Trade
          </a>
        ) : country.launchlabUrl ? (
          <a
            href={country.launchlabUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 hover:bg-white/5"
          >
            Launchlab
          </a>
        ) : (
          <span className="text-xs text-white/20">—</span>
        )}
      </td>
    </tr>
  );
}
