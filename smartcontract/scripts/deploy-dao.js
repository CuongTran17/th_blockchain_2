const hre = require("hardhat");

async function main() {
  const DominionDAO =
    await hre.ethers.getContractFactory("DominionDAO");

  const dao = await DominionDAO.deploy();
  console.log("Deploy transaction:", dao.deployTransaction.hash);

  await dao.deployed();

  console.log("DominionDAO deployed to:", dao.address);
  console.log("DAO balance:", (await dao.daoBalance()).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});