const hre=require("hardhat");
async function main(){
  const C=await hre.ethers.getContractFactory("CipherDAO");
  const c=await C.deploy();
  await c.waitForDeployment();
  console.log("VITE_CONTRACT_ADDRESS="+await c.getAddress());
}
main().catch(e=>{console.error(e);process.exit(1);});