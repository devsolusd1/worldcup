import { SquadBoard } from "@/components/SquadBoard";
import { COUNTRIES, HUB } from "@/lib/countries";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--green)]/40 bg-[var(--green)]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--green)]">
          <span aria-hidden>⚽</span> June 11 · July 19 · 2026
        </div>
        <h1 className="mt-4 font-display text-6xl leading-[0.95] sm:text-8xl">
          <span className="hero-gradient">CUP</span>
          <span className="ml-3 text-white/40">coins</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-white/75 sm:text-lg">
          48 country meme coins for the 2026 World Cup. Every token launched on{" "}
          <span className="font-semibold text-[var(--gold)]">
            Raydium Launchlab
          </span>
          . Every mint address ends with{" "}
          <span className="font-mono font-bold text-[var(--green)]">CUP</span>.
        </p>
      </header>

      <SquadBoard hub={HUB} countries={COUNTRIES} />

      <footer className="mt-16 border-t border-white/5 pt-8 text-xs text-white/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>Not financial advice. Market data via Dexscreener.</span>
          <span>cupcoins.fun · 2026</span>
        </div>
      </footer>
    </main>
  );
}
