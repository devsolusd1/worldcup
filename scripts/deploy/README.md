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

   ```powershell
   $env:DEPLOYER_SECRET_KEY = 'your_bs58_secret_key'
   $env:VANITY_DIR = 'C:\Users\John\Downloads\CUP'  # if not copying locally
   ```

   ```cmd
   set DEPLOYER_SECRET_KEY=your_bs58_secret_key
   set VANITY_DIR=C:\Users\John\Downloads\CUP
   ```

## Recommended flow

```powershell
# 1. Sanity check: see your deployer pubkey + balance
npm run deploy:balance

# 2. Generate the random vanity ↔ country assignment (saved to
#    scripts/deploy/assignments.json — edit if you want)
npm run deploy:assignments

# 3. Simulate without spending SOL
npm run deploy:dry

# 4. Deploy ONLY the hub $CUP first to verify everything works
npm run deploy -- --only=CUP

#    → check the mint on solscan.io and the pool on raydium.io/launchpad
#    → if it looks good, continue

# 5. Deploy the remaining 48
npm run deploy

# 6. Write the resulting mint addresses back into lib/mints.ts so the
#    site picks them up automatically
npm run deploy:sync
```

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
  Clear it after each session: `$env:DEPLOYER_SECRET_KEY = $null`.
- Each `createLaunchpad` costs ~0.01–0.03 SOL in rent + fees. Top up the
  deployer wallet with enough SOL for 49 deploys + buffer (~2 SOL safe).
- The script uses `createOnly: false, buyAmount: 0` — same as your template.
  If a deploy fails immediately on the first token, that combination might
  not be accepted by the SDK on the current version; switch to
  `createOnly: true` in [deploy.ts](deploy.ts) and re-run.
