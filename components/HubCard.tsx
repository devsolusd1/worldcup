import type { HubToken } from "@/lib/countries";
import type { TokenSummary } from "@/lib/dexscreener";
import { formatPrice, formatPct, formatUsdCompact, shortMint } from "@/lib/format";

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
    <div className="relative overflow-hidden rounded-2xl border border-[var(--gold)]/40 bg-gradient-to-br from-[#1a1410] via-[#0f0a07] to-[#050a08] p-6 sm:p-8">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[var(--gold)]/10 blur-3xl" />
      <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
            Hub Token
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-display text-4xl sm:text-5xl">${hub.ticker}</span>
            <span className="text-white/60">{hub.name}</span>
          </div>
          <p className="mt-3 max-w-xl text-sm text-white/70">{hub.description}</p>
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
          <Stat label="Price" value={live ? formatPrice(summary!.priceUsd) : "—"} />
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
            className="rounded-full bg-[var(--gold)] px-4 py-2 text-sm font-semibold text-black hover:bg-[var(--gold)]/90"
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
      <div className="text-[10px] uppercase tracking-widest text-white/40">
        {label}
      </div>
      <div className={`mt-1 font-display text-lg tabular sm:text-xl ${valueClass ?? ""}`}>
        {value}
      </div>
    </div>
  );
}
