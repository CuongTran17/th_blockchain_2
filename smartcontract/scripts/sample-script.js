const hre = require("hardhat");

async function main() {
  const FirstSmartContract =
    await hre.ethers.getContractFactory("FirstSmartContract");

  const contract = await FirstSmartContract.deploy();
  await contract.deployed();

  console.log("FirstSmartContract deployed to:", contract.address);

  console.log("Balance ban dau:", (await contract.getBalance()).toString());

  const tx = await contract.setBalance(500000000);
  await tx.wait();

  console.log("Balance sau khi ghi:", (await contract.getBalance()).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});