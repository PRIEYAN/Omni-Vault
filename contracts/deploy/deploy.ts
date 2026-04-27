/* eslint-disable no-console */
/**
 * Hardhat deployment script for Omni-Vault.
 *
 * Order:
 *   1. MockUSDC (or use real Sepolia USDC by setting USDC_ADDRESS env var)
 *   2. MetaVault
 *   3. AaveStrategy / CompoundStrategy / NoxStrategy
 *   4. Wire strategies into the vault with allocations [4000, 3500, 2500]
 *   5. Harvester
 *
 * Usage:
 *   PRIVATE_KEY=0x... RPC_URL=https://... npx hardhat run contracts/deploy/deploy.ts --network sepolia
 */
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  // 1. USDC
  let usdcAddress = process.env.USDC_ADDRESS;
  if (!usdcAddress) {
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    console.log("MockUSDC:", usdcAddress);
  } else {
    console.log("Using existing USDC:", usdcAddress);
  }

  // 2. MetaVault
  const MetaVault = await ethers.getContractFactory("MetaVault");
  const vault = await MetaVault.deploy(usdcAddress, deployer.address);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("MetaVault:", vaultAddress);

  // 3. Strategies
  const AaveStrategy = await ethers.getContractFactory("AaveStrategy");
  const aave = await AaveStrategy.deploy(usdcAddress, vaultAddress);
  await aave.waitForDeployment();
  const aaveAddress = await aave.getAddress();
  console.log("AaveStrategy:", aaveAddress);

  const CompoundStrategy = await ethers.getContractFactory("CompoundStrategy");
  const comp = await CompoundStrategy.deploy(usdcAddress, vaultAddress);
  await comp.waitForDeployment();
  const compAddress = await comp.getAddress();
  console.log("CompoundStrategy:", compAddress);

  const NoxStrategy = await ethers.getContractFactory("NoxStrategy");
  const nox = await NoxStrategy.deploy(usdcAddress, vaultAddress);
  await nox.waitForDeployment();
  const noxAddress = await nox.getAddress();
  console.log("NoxStrategy:", noxAddress);

  // 4. Wire strategies into vault: 40% Aave, 35% Compound, 25% Nox
  const allocations = [4000, 3500, 2500];
  await (await vault.addStrategy(aaveAddress, allocations[0])).wait();
  await (await vault.addStrategy(compAddress, allocations[1])).wait();
  await (await vault.addStrategy(noxAddress, allocations[2])).wait();
  console.log("Strategies wired with allocations:", allocations);

  // 5. Harvester
  const Harvester = await ethers.getContractFactory("Harvester");
  const harvester = await Harvester.deploy(vaultAddress);
  await harvester.waitForDeployment();
  const harvesterAddress = await harvester.getAddress();
  console.log("Harvester:", harvesterAddress);

  const out = {
    network: "sepolia",
    deployer: deployer.address,
    usdc: usdcAddress,
    metaVault: vaultAddress,
    strategies: {
      aave: aaveAddress,
      compound: compAddress,
      nox: noxAddress,
    },
    harvester: harvesterAddress,
    allocations,
    timestamp: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "..", "deployments");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sepolia.json"), JSON.stringify(out, null, 2));
  console.log("\nWrote deployments/sepolia.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
