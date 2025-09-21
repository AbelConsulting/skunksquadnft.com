const { MerkleTree } = require("merkletreejs");
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

/**
 * Generate Merkle Tree for whitelist addresses
 * @param {string[]} addresses - Array of whitelisted addresses
 * @returns {Object} - Merkle tree, root, and proof functions
 */
function generateMerkleTree(addresses) {
  // Validate addresses
  const validAddresses = addresses.filter(address => {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      console.warn(`Invalid address skipped: ${address}`);
      return false;
    }
  });
  
  if (validAddresses.length === 0) {
    throw new Error("No valid addresses provided");
  }
  
  console.log(`📋 Generating Merkle tree for ${validAddresses.length} addresses`);
  
  // Create leaves (keccak256 hash of each address)
  const leaves = validAddresses.map(address => 
    ethers.keccak256(ethers.solidityPacked(["address"], [address]))
  );
  
  // Create Merkle tree
  const tree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
  const root = tree.getHexRoot();
  
  console.log(`🌳 Merkle Root: ${root}`);
  
  // Function to get proof for an address
  function getProof(address) {
    if (!ethers.isAddress(address)) {
      throw new Error(`Invalid address: ${address}`);
    }
    
    const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [address]));
    const proof = tree.getHexProof(leaf);
    return proof;
  }
  
  // Function to verify a proof
  function verifyProof(address, proof) {
    if (!ethers.isAddress(address)) {
      return false;
    }
    
    const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [address]));
    return tree.verify(proof, leaf, root);
  }
  
  return {
    tree,
    root,
    addresses: validAddresses,
    getProof,
    verifyProof,
    generateWhitelistData: () => {
      return validAddresses.map(address => ({
        address,
        proof: getProof(address)
      }));
    }
  };
}

/**
 * Load addresses from file
 * @param {string} filePath - Path to file containing addresses
 * @returns {string[]} - Array of addresses
 */
function loadAddressesFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const fileContent = fs.readFileSync(filePath, "utf8");
  const extension = path.extname(filePath).toLowerCase();
  
  let addresses = [];
  
  if (extension === ".json") {
    const data = JSON.parse(fileContent);
    if (Array.isArray(data)) {
      addresses = data;
    } else if (Array.isArray(data.addresses)) {
      addresses = data.addresses;
    } else {
      throw new Error("JSON file must contain an array of addresses or an object with 'addresses' property");
    }
  } else if (extension === ".txt" || extension === ".csv") {
    addresses = fileContent
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith("#"))
      .map(line => line.split(",")[0].trim()); // Handle CSV format
  } else {
    throw new Error("Unsupported file format. Use .json, .txt, or .csv");
  }
  
  return addresses;
}

/**
 * Save whitelist data to file
 * @param {Object} whitelist - Whitelist data with root, addresses, and proofs
 * @param {string} outputPath - Output file path
 */
function saveWhitelistData(whitelist, outputPath) {
  const data = {
    merkleRoot: whitelist.root,
    totalAddresses: whitelist.addresses.length,
    generatedAt: new Date().toISOString(),
    addresses: whitelist.generateWhitelistData()
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`💾 Whitelist data saved to: ${outputPath}`);
}

/**
 * Command line interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
📋 Whitelist Merkle Tree Generator

Usage:
  node scripts/whitelist.js <input-file> [output-file]

Arguments:
  input-file   - Path to file containing whitelist addresses (.json, .txt, or .csv)
  output-file  - Path to save whitelist data (optional, defaults to whitelist.json)

Examples:
  node scripts/whitelist.js whitelist.txt
  node scripts/whitelist.js addresses.json whitelist-data.json
  node scripts/whitelist.js addresses.csv output/whitelist.json

File Formats:
  .txt - One address per line
  .csv - Addresses in first column, one per line
  .json - Array of addresses or object with "addresses" property

Example input files:

whitelist.txt:
0x1234567890123456789012345678901234567890
0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef
# Comments are ignored

addresses.json:
["0x1234567890123456789012345678901234567890", "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef"]

OR

{"addresses": ["0x1234567890123456789012345678901234567890"]}
    `);
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1] || "whitelist.json";
  
  try {
    console.log(`📖 Loading addresses from: ${inputFile}`);
    const addresses = loadAddressesFromFile(inputFile);
    
    if (addresses.length === 0) {
      throw new Error("No addresses found in input file");
    }
    
    console.log(`✅ Loaded ${addresses.length} addresses`);
    
    // Generate merkle tree
    const whitelist = generateMerkleTree(addresses);
    
    // Save whitelist data
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    saveWhitelistData(whitelist, outputFile);
    
    // Display summary
    console.log(`
🎯 Whitelist Generation Complete!

📊 Summary:
- Total addresses: ${whitelist.addresses.length}
- Merkle root: ${whitelist.root}
- Output file: ${outputFile}

🔧 Next steps:
1. Set the merkle root in your contract:
   await contract.setMerkleRoot("${whitelist.root}");

2. Use the proof data from ${outputFile} for frontend integration

3. Test with a sample address:
   const proof = whitelist.getProof("${whitelist.addresses[0]}");
   console.log("Proof:", proof);
    `);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Export functions for use in other scripts
module.exports = {
  generateMerkleTree,
  loadAddressesFromFile,
  saveWhitelistData
};

// Run CLI if called directly
if (require.main === module) {
  main();
}