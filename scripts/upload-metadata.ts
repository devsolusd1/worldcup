import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const METADATA_DIR = path.join(ROOT, "metadata");
const OUT_FILE = path.join(ROOT, "metadata-cids.json");

const JWT = process.env.PINATA_JWT;
if (!JWT) {
  console.error(
    "PINATA_JWT env var is not set.\n" +
      "Get a JWT from https://app.pinata.cloud/developers/api-keys and run:\n" +
      "  PowerShell:  $env:PINATA_JWT = '<jwt>'; npm run pinata\n" +
      "  bash:        PINATA_JWT='<jwt>' npm run pinata",
  );
  process.exit(1);
}

const CONCURRENCY = 5;

type Pinned = { symbol: string; cid: string };

async function pin(symbol: string, content: object): Promise<string> {
  const res = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${JWT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataContent: content,
        pinataMetadata: { name: `${symbol}.json` },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Pinata ${res.status} for ${symbol}: ${body}`);
  }

  const json = (await res.json()) as { IpfsHash: string };
  return json.IpfsHash;
}

async function processFile(file: string): Promise<Pinned> {
  const symbol = path.basename(file, ".json");
  const raw = await readFile(path.join(METADATA_DIR, file), "utf-8");
  const content = JSON.parse(raw);
  const cid = await pin(symbol, content);
  console.log(`✓ ${symbol}  ${cid}`);
  return { symbol, cid };
}

async function main() {
  const files = (await readdir(METADATA_DIR))
    .filter((f) => f.endsWith(".json"))
    .sort();

  console.log(
    `Pinning ${files.length} metadata files to Pinata (concurrency ${CONCURRENCY})\n`,
  );

  const results: Pinned[] = [];
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(processFile));
    results.push(...batchResults);
  }

  const mapping: Record<string, string> = {};
  for (const r of results.sort((a, b) => a.symbol.localeCompare(b.symbol))) {
    mapping[r.symbol] = r.cid;
  }

  await writeFile(OUT_FILE, JSON.stringify(mapping, null, 2) + "\n", "utf-8");
  console.log(
    `\n✓ Pinned ${results.length} files. Mapping saved to metadata-cids.json`,
  );
  console.log("\nMetadata URIs (use for Launchlab):");
  for (const [symbol, cid] of Object.entries(mapping)) {
    console.log(`  ${symbol}: https://ipfs.io/ipfs/${cid}`);
  }
}

main().catch((err) => {
  console.error("\n✗ Upload failed:");
  console.error(err);
  process.exit(1);
});
