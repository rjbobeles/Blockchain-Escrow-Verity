const { ethers } = require("hardhat");

async function main() {
  const SmartEscrow = await ethers.getContractFactory("SmartEscrow");
  const smartEscrow = await SmartEscrow.deploy();

  await smartEscrow.deployed();

  console.log("Smart Escrow deployed to:", smartEscrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
