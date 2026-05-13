import fs from "node:fs";
import path from "node:path";
import { COUNTRIES, HUB } from "../../lib/countries";
import { VANITY_DIR } from "./config";
import { writeMintsFile } from "./sync-mints";

export type Assignment = {
  id: string;
  name: string;
  symbol: string;
  vanityFile: string;
  publicKey: string;
};

const ASSIGNMENTS_FILE = "./scripts/deploy/assignments.json";

function listVanityFiles(): string[] {
  if (!fs.existsSync(VANITY_DIR)) {
    throw new Error(
      `Vanity dir not found: ${VANITY_DIR}\n` +
        `Set VANITY_DIR env var to the folder with the 49 *CUP.json files, ` +
        `or copy them to ./vanity-keys/`,
    );
  }
  return fs
    .readdirSync(VANITY_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

function shuffle<T>(input: T[]): T[] {
  const arr = input.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateAssignments(): Assignment[] {
  const files = listVanityFiles();
  if (files.length < 49) {
    throw new Error(
      `Expected at least 49 vanity files in ${VANITY_DIR}, found ${files.length}`,
    );
  }

  const shuffled = shuffle(files);
  const assignments: Assignment[] = [];

  // First (shuffled) vanity → hub
  assignments.push({
    id: "hub",
    name: HUB.name,
    symbol: HUB.ticker,
    vanityFile: shuffled[0],
    publicKey: path.basename(shuffled[0], ".json"),
  });

  // Next 48 → countries in COUNTRIES order
  for (let i = 0; i < COUNTRIES.length; i++) {
    const country = COUNTRIES[i];
    const file = shuffled[i + 1];
    assignments.push({
      id: country.id,
      name: country.name,
      symbol: country.ticker,
      vanityFile: file,
      publicKey: path.basename(file, ".json"),
    });
  }

  fs.writeFileSync(
    ASSIGNMENTS_FILE,
    JSON.stringify(assignments, null, 2) + "\n",
    "utf-8",
  );

  // Immediately pre-allocate the 49 mints into lib/mints.ts so the site
  // can be deployed/committed before any on-chain deploys run.
  writeMintsFile();

  return assignments;
}

export function loadAssignments(): Assignment[] {
  if (!fs.existsSync(ASSIGNMENTS_FILE)) {
    return generateAssignments();
  }
  return JSON.parse(fs.readFileSync(ASSIGNMENTS_FILE, "utf-8")) as Assignment[];
}

async function main() {
  const regenerate =
    process.argv.includes("--regenerate") || process.argv.includes("-r");

  if (regenerate && fs.existsSync(ASSIGNMENTS_FILE)) {
    fs.unlinkSync(ASSIGNMENTS_FILE);
  }

  const assignments = fs.existsSync(ASSIGNMENTS_FILE)
    ? loadAssignments()
    : generateAssignments();

  console.log(
    `Assignments (${assignments.length}) → ${ASSIGNMENTS_FILE}${regenerate ? " (regenerated)" : ""}\n`,
  );
  for (const a of assignments) {
    console.log(`  ${a.symbol.padEnd(5)} ${a.name.padEnd(35)} ${a.publicKey}`);
  }
  console.log(
    `\nlib/mints.ts has been pre-populated with all ${assignments.length} mints.\n` +
      `Commit it and push to Vercel — the site will show the cards as "Listed"\n` +
      `until each deploy + Dexscreener indexing flips them to "Live".`,
  );
}

if (process.argv[1]?.endsWith("assignments.ts")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
