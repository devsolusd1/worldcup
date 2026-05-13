import { SquadBoard } from "@/components/SquadBoard";
import { COUNTRIES, HUB } from "@/lib/countries";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 sm:mb-14">
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--gold)]">
          June 11 · July 19 · 2026
        </div>
        <h1 className="mt-3 font-display text-5xl sm:text-7xl">
          CUP <span className="text-white/40">coins</span>
        </h1>
        <p className="mt-4 max-w-2xl text-white/70">
          48 country meme coins for the 2026 World Cup. Every token launched on
          Raydium Launchlab. Every mint address ends with{" "}
          <span className="font-mono text-white">CUP</span>.
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
