# Generating ...CUP vanity addresses

You need 49 keypairs whose public key (the future mint address) ends in `CUP`:
1 for the hub token + 48 for the country tokens.

## Prerequisites

Install the Solana CLI:

```powershell
# Windows (PowerShell, admin)
cmd /c "curl https://release.anza.xyz/stable/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"
C:\solana-install-tmp\solana-install-init.exe stable
```

Then restart your terminal and check:

```powershell
solana --version
solana-keygen --version
```

## Grind 49 keypairs ending in `CUP`

`CUP` is 3 base58 characters, so each match averages ~58³ ≈ 195k tries — a few
seconds per match on a modern CPU. Generate the whole batch in one go:

```powershell
mkdir vanity-keys
cd vanity-keys
solana-keygen grind --ends-with CUP:49
```

`solana-keygen` writes one file per match into the current directory, named
after the public key:

```
3Kj...someThing...CUP.json
Yo...anotherThing...CUP.json
...
```

> The numeric `49` is "stop after 49 matches". The grinder uses all available
> CPU cores. Bigger batches just take proportionally longer. The 49-character
> max public key length is unchanged.

## Get the public keys

```powershell
Get-ChildItem *.json | ForEach-Object { $_.BaseName }
```

Copy the addresses into [`lib/countries.ts`](../lib/countries.ts), assigning one
to each country.

## Safety

- The `*.json` files contain the **private key** that controls minting and
  authority on each token. Treat them like passwords.
- `.gitignore` already excludes `vanity-keys/` and `*.keypair.json`, but
  double-check before committing.
- Move them to cold storage (encrypted drive, hardware wallet, etc.) as soon
  as the tokens are deployed and authorities are renounced.

## Deploying on Launchlab

Use Raydium Launchlab's UI or SDK. When it asks for the mint keypair, supply
the matching `*.json` file from `vanity-keys/`. After the token is live, paste
the address into `lib/countries.ts`:

```ts
{ ...c("brazil", "Brazil", "BRA", "🇧🇷"), mint: "<the address ending in CUP>" }
```

Also set `launchlabUrl` if you want a direct trade link even before Dexscreener
indexes the pair.
