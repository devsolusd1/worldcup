"use client";

import { useState } from "react";
import type { CountryToken } from "@/lib/countries";
import type { TokenSummary } from "@/lib/dexscreener";
import {
  formatPct,
  formatPrice,
  formatUsdCompact,
  shortMint,
} from "@/lib/format";

type Props = {
  rank: number | null;
  country: CountryToken;
  summary: TokenSummary;
};

export function CountryCard({ rank, country, summary }: Props) {
  const [copied, setCopied] = useState(false);

  const hasMint = Boolean(country.mint);
  const live = hasMint && summary.priceUsd !== null;
  const change = summary.priceChange24h;
  const chartUrl = live ? summary.pairUrl : null;

  const changeColor =
    change == null
      ? "text-white/30"
      : change >= 0
        ? "text-[var(--green)]"
        : "text-[var(--red)]";

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!country.mint) return;
    try {
      await navigator.clipboard.writeText(country.mint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // browser denied — ignore silently
    }
  }

  const inner = (
    <>
      <div className="relative h-28 w-full overflow-hidden">
        <span
          className={`fi fi-${country.iso2}`}
          role="img"
          aria-label={`${country.name} flag`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04080c] via-[#04080c]/40 to-transparent" />
        {rank !== null && (
          <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold tabular text-white/90 backdrop-blur">
            #{rank}
          </div>
        )}
        <div className="absolute right-3 top-3">
          {live ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green)]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--green)] ring-1 ring-[var(--green)]/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--green)]" />
              Live
            </span>
          ) : hasMint ? (
            <span className="rounded-full bg-[var(--gold)]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] ring-1 ring-[var(--gold)]/40">
              Listed
            </span>
          ) : (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/40 ring-1 ring-white/10">
              Soon
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-base font-bold leading-tight">
            {country.name}
          </h3>
          <span className="font-mono text-xs font-bold text-[var(--gold)]">
            ${country.ticker}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40">
              Price
            </div>
            <div className="mt-0.5 font-semibold tabular">
              {live ? formatPrice(summary.priceUsd) : "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest text-white/40">
              24h
            </div>
            <div className={`mt-0.5 font-semibold tabular ${changeColor}`}>
              {live ? formatPct(change) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-widest text-white/40">
              Market cap
            </div>
            <div className="mt-0.5 font-semibold tabular">
              {live ? formatUsdCompact(summary.marketCap) : "—"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest text-white/40">
              Vol 24h
            </div>
            <div className="mt-0.5 font-semibold tabular">
              {live ? formatUsdCompact(summary.volume24h) : "—"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
          <code className="truncate text-[10px] text-white/40">
            {country.mint ? shortMint(country.mint) : "mint pending"}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!hasMint}
            className="shrink-0 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 transition hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/10 hover:text-[var(--gold)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:bg-white/5 disabled:hover:text-white/80"
            aria-label="Copy contract address"
          >
            {copied ? "Copied!" : "Copy CA"}
          </button>
        </div>
      </div>
    </>
  );

  const baseClass =
    "group relative block overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] transition-all";
  const interactiveClass = chartUrl
    ? "cursor-pointer hover:-translate-y-0.5 hover:border-[var(--green)]/50 hover:shadow-[0_8px_30px_-12px_rgba(0,213,99,0.4)]"
    : hasMint
      ? "hover:border-[var(--gold)]/40"
      : "opacity-60";

  if (chartUrl) {
    return (
      <a
        href={chartUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${interactiveClass}`}
      >
        {inner}
      </a>
    );
  }

  return <div className={`${baseClass} ${interactiveClass}`}>{inner}</div>;
}
