import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Raydium, DEV_API_URLS } from "@raydium-io/raydium-sdk-v2";
import bs58 from "bs58";

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  "https://mainnet.helius-rpc.com/?api-key=2ea31dea-8fc1-41e7-bebe-b008a512da0a";

export const connection = new Connection(RPC_URL, "finalized");

// dog.fun platform id from the template. Override with PLATFORM_ID env var if needed.
export const PLATFORM_ID = new PublicKey(
  process.env.PLATFORM_ID ?? "3swsaVK2YqNjnrTJR87KgbZXM5Vtko1Jt5ktdHqqGPR6",
);

// Folder containing the *.CUP.json vanity keypair files. Defaults to ./vanity-keys
// in the project root. Override with VANITY_DIR env var.
export const VANITY_DIR = process.env.VANITY_DIR ?? "./vanity-keys";

export function loadDeployer(): Keypair {
  const secret = process.env.DEPLOYER_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error(
      "DEPLOYER_SECRET_KEY env var is not set.\n" +
        "Export it as a bs58-encoded secret key (the format Phantom exports as 'Private Key').",
    );
  }
  let decoded: Uint8Array;
  try {
    decoded = bs58.decode(secret);
  } catch (e) {
    throw new Error(`DEPLOYER_SECRET_KEY is not valid bs58: ${(e as Error).message}`);
  }
  if (decoded.length !== 64) {
    throw new Error(
      `DEPLOYER_SECRET_KEY decoded to ${decoded.length} bytes; expected 64.`,
    );
  }
  return Keypair.fromSecretKey(decoded);
}

let raydiumInstance: Raydium | null = null;

export async function getRaydium(): Promise<Raydium> {
  if (raydiumInstance) return raydiumInstance;
  const owner = loadDeployer();
  console.log(`Connecting to ${RPC_URL}`);
  raydiumInstance = await Raydium.load({
    owner,
    connection,
    cluster: "mainnet",
    disableFeatureCheck: true,
    disableLoadToken: true,
    blockhashCommitment: "finalized",
    urlConfigs: {
      ...DEV_API_URLS,
      BASE_HOST: "https://api-v3.raydium.io",
      OWNER_BASE_HOST: "https://owner-v1.raydium.io",
      SWAP_HOST: "https://transaction-v1.raydium.io",
      CPMM_LOCK: "https://dynamic-ipfs.raydium.io/lock/cpmm/position",
    },
  });
  return raydiumInstance;
}
