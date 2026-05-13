import type { HubToken } from "@/lib/countries";
import type { TokenSummary } from "@/lib/dexscreener";
import {
  formatPct,
  formatPrice,
  formatUsdCompact,
  shortMint,
} from "@/lib/format";

type Props = {
  hub: HubToken;
  summary: TokenSummary | null;
};

export function HubCard({ hub, summary }: Props) {
  const live = hub.mint && summary && summary.priceUsd !== null;
  const change = summary?.priceChange24h ?? null;
  const changeColor =
    change == null
      ? "text-white/40"
      : change >= 0
        ? "text-[var(--green)]"
        : "text-[var(--red)]";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--gold)]/40 p-[1px]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/40 via-[var(--green)]/20 to-[var(--gold)]/40" />
      <div className="relative rounded-2xl bg-gradient-to-br from-[#0a1410] via-[#0a0a08] to-[#04080c] p-6 sm:p-8">
        <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[var(--gold)]/15 blur-3xl" />
        <div className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-[var(--green)]/10 blur-3xl" />
        <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
              <span aria-hidden>🏆</span> Hub Token
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-5xl sm:text-6xl">
                <span className="hero-gradient">${hub.ticker}</span>
              </span>
              <span className="text-white/60">{hub.name}</span>
            </div>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              {hub.description}
            </p>
            <div className="mt-3 text-xs text-white/40 tabular">
              {hub.mint ? (
                <a
                  href={`https://solscan.io/token/${hub.mint}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/70"
                >
                  {shortMint(hub.mint)}
                </a>
              ) : (
                "mint pending"
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 sm:text-right">
            <Stat
              label="Price"
              value={live ? formatPrice(summary!.priceUsd) : "—"}
            />
            <Stat
              label="24h"
              value={live ? formatPct(change) : "—"}
              valueClass={changeColor}
            />
            <Stat
              label="Market cap"
              value={live ? formatUsdCompact(summary!.marketCap) : "—"}
            />
          </div>
        </div>

        {live && summary?.pairUrl && (
          <div className="relative mt-6 flex flex-wrap gap-2">
            <a
              href={summary.pairUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-gold rounded-full px-5 py-2 text-sm"
            >
              Trade on Dexscreener
            </a>
            {hub.launchlabUrl && (
              <a
                href={hub.launchlabUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                Launchlab
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/50">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-lg tabular sm:text-2xl ${valueClass ?? ""}`}
      >
        {value}
      </div>
    </div>
  );
}
