const { ethers } = require("hardhat");

async function updateContractURIs() {
  console.log("🔄 Updating contract URIs...");
  
  const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
  const BASE_URI = "https://api.skunksquadnft.com/metadata/";
  const CONTRACT_URI = "https://api.skunksquadnft.com/contract.json";
  
  const [owner] = await ethers.getSigners();
  const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFTEnhanced");
  const contract = SkunkSquadNFT.attach(CONTRACT_ADDRESS);
  
  // Update base URI
  console.log("📝 Updating base URI...");
  const baseUriTx = await contract.setBaseURI(BASE_URI);
  await baseUriTx.wait();
  console.log("✅ Base URI updated:", BASE_URI);
  
  // Update contract URI
  console.log("📝 Updating contract URI...");
  const contractUriTx = await contract.setContractURI(CONTRACT_URI);
  await contractUriTx.wait();
  console.log("✅ Contract URI updated:", CONTRACT_URI);
  
  console.log("🎉 All URIs updated successfully!");
}

updateContractURIs().catch(console.error);