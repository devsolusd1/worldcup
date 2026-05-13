# Launchlab batch deploy

Automates deploying all 49 tokens (1 hub `$CUP` + 48 country coins) on Raydium
Launchlab, using the pre-generated vanity keypairs and the metadata URIs that
were pinned to Pinata.

## What it does

For each token, runs `raydium.launchpad.createLaunchpad({...})` with:

- `mintA` = the vanity public key from the matching `*.CUP.json` keypair
- `name` / `symbol` = country/hub info from [lib/countries.ts](../../lib/countries.ts)
- `uri` = `https://ipfs.io/ipfs/<cid>` from [metadata-cids.json](../../metadata-cids.json)
- All other params identical to the user's working template
  (`createOnly: false`, `buyAmount: 0`, dog.fun platform id, etc.)

Results are written to `deploys.json` incrementally — the run is resumable.
Failed deploys are retried on the next run.

## One-time setup

1. **Copy or point to the vanity keypairs.** Either:
   - Copy the 49 `*.CUP.json` files into `cup-coins/vanity-keys/`, OR
   - Set `VANITY_DIR` env var to the folder that has them
     (e.g. `C:\Users\John\Downloads\CUP`).

2. **Confirm `metadata-cids.json` exists** at the repo root (run
   `npm run pinata` if not).

3. **Export the deployer wallet's secret key** (bs58 format — same as
   Phantom's "Export Private Key"):

   ```cmd
   set DEPLOYER_SECRET_KEY=your_bs58_secret_key
   set VANITY_DIR=C:\Users\John\Downloads\CUP
   ```

   To clear them after you're done:

   ```cmd
   set DEPLOYER_SECRET_KEY=
   set VANITY_DIR=
   ```

## Recommended flow (cmd.exe)

The hub `$CUP` is intentionally skipped by default — deploy it LAST,
after the country tokens are live and you've prepared CUP metadata.

`--delay=10` spaces deploys by 10 seconds between transactions, which
keeps the RPC happy and gives the chain time to settle.

```cmd
:: 1. Sanity check: see your deployer pubkey + balance
npm run deploy:balance

:: 2. Generate the random vanity <-> country mapping AND pre-populate
::    lib/mints.ts with all 49 reserved mint addresses.
::    Both assignments.json and lib/mints.ts are committed to git, so the
::    site is "ready" before any on-chain deploys happen.
npm run deploy:assignments

:: 3. Commit + push the pre-allocated state to Vercel
git add scripts/deploy/assignments.json lib/mints.ts
git commit -m "chore: pre-allocate 49 token mints"
git push

::    -> Vercel rebuilds. All 48 country cards now show "Listed" with
::       their reserved mint addresses + Copy CA. Hub is also pre-listed.
::       Cards stay "Listed" until each token is created on-chain AND
::       Dexscreener indexes its pool, at which point they flip to "Live".

:: 4. Simulate the deploys without spending SOL
npm run deploy:dry

:: 5. Smoke test: deploy ONE country first
npm run deploy -- --only=BRA

::    -> check the mint on solscan.io and the pool on raydium.io/launchpad
::    -> if it looks good, continue

:: 6. Deploy the remaining 47 country tokens, 10s between each
npm run deploy -- --delay=10

:: 7. LATER, when CUP metadata is ready and uploaded to Pinata, deploy hub
npm run deploy -- --only=CUP

:: (lib/mints.ts is already correct — pre-allocated from step 2 — you don't
::  need deploy:sync. It's available as 'npm run deploy:sync' for repair.)
```

## Flags

| Flag | Effect |
|---|---|
| `--dry-run` | Print the plan, don't call execute() |
| `--only=BRA,ARG` | Deploy only the listed symbols |
| `--include-hub` | Include the hub `$CUP` in the batch (excluded by default) |
| `--delay=10` | Wait N seconds between deploys (default: 0) |
| `--yes` / `-y` | Skip the y/N confirmation prompt |

## Re-running / retrying

- `deploys.json` tracks which tokens succeeded. Re-running `npm run deploy`
  only attempts the ones missing or marked as errored.
- To retry just one: `npm run deploy -- --only=BRA,ARG`
- To regenerate the assignment (different random shuffle):
  `npm run deploy:assignments -- --regenerate`
  (only do this BEFORE any deploys happen, otherwise existing deploys.json
  will be out of sync).

## Files

| File | Committed? | Purpose |
|---|---|---|
| `config.ts` | ✓ | Loads deployer keypair + Raydium SDK |
| `assignments.ts` | ✓ | Generates/loads random vanity↔country mapping |
| `deploy.ts` | ✓ | Main batch deploy script |
| `sync-mints.ts` | ✓ | Writes mint addresses to `lib/mints.ts` |
| `balance.ts` | ✓ | Shows deployer balance |
| `assignments.json` | gitignored | Active mapping (run-specific) |
| `deploys.json` | gitignored | Incremental results + errors |

## Safety notes

- `DEPLOYER_SECRET_KEY` is a hot wallet secret. Never commit, log, or share.
  Clear it after each session: `set DEPLOYER_SECRET_KEY=` (cmd) or
  `$env:DEPLOYER_SECRET_KEY = $null` (PowerShell).
- Each `createLaunchpad` costs ~0.01–0.03 SOL in rent + fees. Top up the
  deployer wallet with enough SOL for 49 deploys + buffer (~2 SOL safe).
- The script uses `createOnly: false, buyAmount: 0` — same as your template.
  If a deploy fails immediately on the first token, that combination might
  not be accepted by the SDK on the current version; switch to
  `createOnly: true` in [deploy.ts](deploy.ts) and re-run.
