import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection, loadDeployer } from "./config";

async function main() {
  const deployer = loadDeployer();
  const lamports = await connection.getBalance(deployer.publicKey);
  const sol = lamports / LAMPORTS_PER_SOL;

  console.log("");
  console.log(`Deployer: ${deployer.publicKey.toBase58()}`);
  console.log(`Balance:  ${sol.toFixed(6)} SOL (${lamports} lamports)`);
  console.log(`RPC:      ${connection.rpcEndpoint}`);
  console.log("");

  if (sol < 0.05) {
    console.log("⚠  Balance looks low. Each createLaunchpad costs ~0.01-0.03 SOL");
    console.log("   in rent + tx fees. Top up before mass deploy.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
