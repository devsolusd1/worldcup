import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import BN from "bn.js";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import {
  TxVersion,
  LAUNCHPAD_PROGRAM,
  LaunchpadConfig,
  CpmmCreatorFeeOn,
  getPdaLaunchpadConfigId,
} from "@raydium-io/raydium-sdk-v2";
import {
  PLATFORM_ID,
  VANITY_DIR,
  connection,
  getRaydium,
  loadDeployer,
} from "./config";
import { type Assignment, loadAssignments } from "./assignments";
import { writeMintsFile } from "./sync-mints";

const METADATA_CIDS_FILE = "./metadata-cids.json";
const DEPLOYS_FILE = "./scripts/deploy/deploys.json";

type DeployRecord = {
  id: string;
  symbol: string;
  mint: string;
  timestamp: number;
  poolId?: string;
  txIds?: string[];
  error?: string;
};

function loadDeploys(): Record<string, DeployRecord> {
  if (!fs.existsSync(DEPLOYS_FILE)) return {};
  return JSON.parse(fs.readFileSync(DEPLOYS_FILE, "utf-8"));
}

function saveDeploys(map: Record<string, DeployRecord>) {
  fs.writeFileSync(
    DEPLOYS_FILE,
    JSON.stringify(map, null, 2) + "\n",
    "utf-8",
  );
}

function loadKeypair(filename: string): Keypair {
  const full = path.join(VANITY_DIR, filename);
  const raw = fs.readFileSync(full, "utf-8");
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
}

function loadMetadataCids(): Record<string, string> {
  if (!fs.existsSync(METADATA_CIDS_FILE)) {
    throw new Error(
      `${METADATA_CIDS_FILE} not found. Run 'npm run pinata' first.`,
    );
  }
  return JSON.parse(fs.readFileSync(METADATA_CIDS_FILE, "utf-8"));
}

function metadataUriFor(symbol: string, cids: Record<string, string>): string {
  const cid = cids[symbol];
  if (!cid) {
    throw new Error(`No metadata CID for symbol "${symbol}"`);
  }
  return `https://ipfs.io/ipfs/${cid}`;
}

async function confirm(prompt: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(`${prompt} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

async function deployOne(
  assignment: Assignment,
  metadataUri: string,
): Promise<{ mint: string; poolId?: string; txIds: string[] }> {
  const raydium = await getRaydium();
  const pair = loadKeypair(assignment.vanityFile);

  if (pair.publicKey.toBase58() !== assignment.publicKey) {
    throw new Error(
      `Keypair pubkey ${pair.publicKey.toBase58()} does not match assignment ${assignment.publicKey}`,
    );
  }

  const programId = LAUNCHPAD_PROGRAM;
  const mintA = pair.publicKey;

  const configId = getPdaLaunchpadConfigId(
    programId,
    NATIVE_MINT,
    0,
    0,
  ).publicKey;

  const configData = await raydium.connection.getAccountInfo(configId);
  if (!configData) throw new Error("Launchpad config account not found");
  const configInfo = LaunchpadConfig.decode(configData.data);
  const mintBInfo = await raydium.token.getTokenInfo(configInfo.mintB);

  const inAmount = new BN(0);

  const { execute, extInfo } = await raydium.launchpad.createLaunchpad({
    programId,
    mintA,
    decimals: 6,
    name: assignment.name,
    symbol: assignment.symbol,
    migrateType: "cpmm",
    uri: metadataUri,
    configId,
    configInfo,
    mintBDecimals: mintBInfo.decimals,
    platformId: PLATFORM_ID,
    txVersion: TxVersion.V0,
    slippage: new BN(100),
    buyAmount: inAmount,
    createOnly: false,
    extraSigners: [pair],
    creatorFeeOn: CpmmCreatorFeeOn.OnlyTokenB,
    supply: new BN("1000000000000000"),
    totalSellA: new BN("793100000000000"),
    totalFundRaisingB: new BN("85000000000"),
    totalLockedAmount: new BN(0),
    cliffPeriod: new BN(0),
    unlockPeriod: new BN(0),
    computeBudgetConfig: {
      units: 600000,
      microLamports: 46591500,
    },
  });

  const sentInfo = await execute({ sequentially: true });

  const txIds = Array.isArray(sentInfo)
    ? sentInfo.map((s: { txId?: string }) => s.txId ?? String(s))
    : [(sentInfo as { txId?: string })?.txId ?? String(sentInfo)];

  const poolId =
    (extInfo as { address?: { poolId?: { toBase58(): string } } })?.address
      ?.poolId?.toBase58?.() ?? undefined;

  return { mint: mintA.toBase58(), poolId, txIds };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const yes = args.includes("--yes") || args.includes("-y");
  const includeHub = args.includes("--include-hub");

  const onlyArg = args.find((a) => a.startsWith("--only="));
  const only = onlyArg
    ? onlyArg
        .split("=")[1]
        .split(",")
        .map((s) => s.trim().toUpperCase())
    : null;

  const delayArg = args.find((a) => a.startsWith("--delay="));
  const delaySeconds = delayArg ? Number(delayArg.split("=")[1]) : 0;
  if (Number.isNaN(delaySeconds) || delaySeconds < 0) {
    throw new Error(`--delay must be a non-negative number of seconds`);
  }

  return { dryRun, yes, only, includeHub, delaySeconds };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const { dryRun, yes, only, includeHub, delaySeconds } = parseArgs();

  const assignments = loadAssignments();
  const cids = loadMetadataCids();
  const deploys = loadDeploys();

  // Filter: pending = not yet successfully deployed
  let pending = assignments.filter((a) => {
    const prior = deploys[a.id];
    return !prior || prior.error;
  });

  // Skip hub by default — it is deployed last, when the user is ready.
  // Override with --include-hub or --only=CUP/hub.
  const hubExplicit =
    includeHub ||
    (only &&
      (only.includes("CUP") || only.includes("HUB")));
  let hubSkipped = false;
  if (!hubExplicit) {
    const before = pending.length;
    pending = pending.filter((a) => a.id !== "hub");
    hubSkipped = pending.length < before;
  }

  if (only) {
    pending = pending.filter(
      (a) => only.includes(a.symbol.toUpperCase()) || only.includes(a.id.toUpperCase()),
    );
  }

  const deployer = loadDeployer();
  const balance = await connection.getBalance(deployer.publicKey);

  console.log("");
  console.log(`Deployer:  ${deployer.publicKey.toBase58()}`);
  console.log(
    `Balance:   ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`,
  );
  console.log(`RPC:       ${connection.rpcEndpoint}`);
  console.log(`Platform:  ${PLATFORM_ID.toBase58()}`);
  console.log(`Vanities:  ${VANITY_DIR}`);
  console.log(
    `Delay:     ${delaySeconds > 0 ? `${delaySeconds}s between deploys` : "none"}`,
  );
  console.log(
    `Pending:   ${pending.length} of ${assignments.length}${only ? ` (filtered by --only=${only.join(",")})` : ""}`,
  );
  if (hubSkipped) {
    console.log(
      `           (hub $CUP skipped — pass --include-hub or --only=CUP to deploy it)`,
    );
  }
  console.log("");

  if (pending.length === 0) {
    console.log("Nothing to deploy.");
    return;
  }

  console.log("Will deploy:");
  for (const a of pending.slice(0, 10)) {
    console.log(
      `  ${a.symbol.padEnd(5)} ${a.name.padEnd(30)} ${a.publicKey}`,
    );
  }
  if (pending.length > 10) {
    console.log(`  ... and ${pending.length - 10} more`);
  }
  console.log("");

  if (dryRun) {
    console.log("Dry run — exiting before execute().");
    return;
  }

  if (!yes && !(await confirm(`Proceed with ${pending.length} deploy(s)?`))) {
    console.log("Aborted.");
    return;
  }

  let ok = 0;
  let failed = 0;
  for (let i = 0; i < pending.length; i++) {
    const a = pending[i];
    let uri: string;
    try {
      uri = metadataUriFor(a.symbol, cids);
    } catch (err) {
      console.error(`✗ ${a.symbol}: ${(err as Error).message} — skipping`);
      failed++;
      continue;
    }

    process.stdout.write(
      `→ [${(i + 1).toString().padStart(2)}/${pending.length}] ${a.symbol.padEnd(5)} ${a.name.padEnd(30)} `,
    );
    try {
      const result = await deployOne(a, uri);
      deploys[a.id] = {
        id: a.id,
        symbol: a.symbol,
        mint: result.mint,
        poolId: result.poolId,
        txIds: result.txIds,
        timestamp: Date.now(),
      };
      saveDeploys(deploys);
      const sync = writeMintsFile();
      console.log(
        `✓ ${result.mint}${result.poolId ? `  pool ${result.poolId}` : ""}  [synced ${sync.written}]`,
      );
      ok++;
    } catch (err) {
      const msg = (err as Error).message ?? String(err);
      deploys[a.id] = {
        id: a.id,
        symbol: a.symbol,
        mint: a.publicKey,
        timestamp: Date.now(),
        error: msg,
      };
      saveDeploys(deploys);
      console.log(`✗ ${msg.slice(0, 120)}`);
      failed++;
    }

    // Throttle between deploys (skip after the last one)
    if (delaySeconds > 0 && i < pending.length - 1) {
      await sleep(delaySeconds * 1000);
    }
  }

  console.log("");
  console.log(`Done — ok: ${ok}, failed: ${failed}`);
  console.log(`Results saved to ${DEPLOYS_FILE}`);
  if (ok > 0) {
    console.log(`lib/mints.ts already up to date (synced after each deploy).`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
