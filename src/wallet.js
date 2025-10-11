import { ethers } from "ethers";
export const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";

// Example ABI (replace with your actual ABI)
const CONTRACT_ABI = [
  // ...your contract ABI here...
];

// Checks if the contract is deployed and accessible
export async function checkWebsiteContract() {
  try {
    const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/cR2JU1F2OOvp3DvHfBIEW");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const name = await contract.name();
    console.log("Connected to contract:", name);
    return true;
  } catch (error) {
    console.error("Contract check failed:", error);
    return false;
  }
}