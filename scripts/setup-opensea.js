const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔗 Setting up OpenSea integration for Skunk Squad NFT...");
  
  // Contract details
  const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
  const COLLECTION_NAME = "Skunk Squad NFT";
  const COLLECTION_DESCRIPTION = "A collection of 10,000 unique Skunk Squad NFTs with various traits and rarities.";
  const EXTERNAL_LINK = "https://skunksquadnft.com";
  const ROYALTY_RECIPIENT = "0x16Be43d7571Edf69cec8D6221044638d161aA994";
  
  // Create metadata directory structure
  const metadataDir = path.join(__dirname, "..", "metadata");
  const imagesDir = path.join(metadataDir, "images");
  
  console.log("📁 Creating metadata directory structure...");
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  // 1. Create contract-level metadata
  console.log("📄 Creating contract-level metadata...");
  const contractMetadata = {
    name: COLLECTION_NAME,
    description: COLLECTION_DESCRIPTION,
    image: "https://api.skunksquadnft.com/images/collection-banner.png",
    external_link: EXTERNAL_LINK,
    seller_fee_basis_points: 250, // 2.5%
    fee_recipient: ROYALTY_RECIPIENT,
    schema_version: "1.0.0",
    collection: {
      name: COLLECTION_NAME,
      family: "Skunk Squad"
    }
  };
  
  const contractMetadataPath = path.join(metadataDir, "contract.json");
  fs.writeFileSync(contractMetadataPath, JSON.stringify(contractMetadata, null, 2));
  console.log("✅ Contract metadata created:", contractMetadataPath);
  
  // 2. Create unrevealed metadata
  console.log("🎭 Creating unrevealed metadata...");
  const unrevealedMetadata = {
    name: "Skunk Squad NFT",
    description: "This Skunk Squad NFT has not been revealed yet. Stay tuned for the big reveal!",
    image: "https://api.skunksquadnft.com/images/unrevealed.png",
    external_url: EXTERNAL_LINK,
    attributes: [
      {
        trait_type: "Status",
        value: "Unrevealed"
      }
    ]
  };
  
  const unrevealedMetadataPath = path.join(metadataDir, "unrevealed.json");
  fs.writeFileSync(unrevealedMetadataPath, JSON.stringify(unrevealedMetadata, null, 2));
  console.log("✅ Unrevealed metadata created:", unrevealedMetadataPath);
  
  // 3. Create sample token metadata (for testing)
  console.log("🎨 Creating sample token metadata...");
  for (let i = 1; i <= 5; i++) {
    const tokenMetadata = {
      name: `Skunk Squad #${i}`,
      description: `Skunk Squad #${i} is a unique NFT with ${Math.floor(Math.random() * 8) + 1} traits from the Skunk Squad collection.`,
      image: `https://api.skunksquadnft.com/images/${i}.png`,
      external_url: `${EXTERNAL_LINK}/token/${i}`,
      attributes: generateSampleAttributes(i)
    };
    
    const tokenMetadataPath = path.join(metadataDir, `${i}.json`);
    fs.writeFileSync(tokenMetadataPath, JSON.stringify(tokenMetadata, null, 2));
  }
  console.log("✅ Sample token metadata created (1-5)");
  
  // 4. Create OpenSea collection configuration
  console.log("⚙️ Creating OpenSea collection configuration...");
  const openSeaConfig = {
    contract_address: CONTRACT_ADDRESS,
    network: "sepolia", // Change to "ethereum" for mainnet
    collection_slug: "skunk-squad-nft",
    urls: {
      testnet: `https://testnets.opensea.io/collection/skunk-squad-nft`,
      mainnet: `https://opensea.io/collection/skunk-squad-nft`,
      contract: `https://testnets.opensea.io/assets/sepolia/${CONTRACT_ADDRESS.toLowerCase()}`
    },
    metadata_endpoints: {
      contract_uri: "https://api.skunksquadnft.com/contract.json",
      base_uri: "https://api.skunksquadnft.com/metadata/",
      unrevealed_uri: "https://api.skunksquadnft.com/unrevealed.json"
    },
    collection_settings: {
      name: COLLECTION_NAME,
      description: COLLECTION_DESCRIPTION,
      category: "Art",
      blockchain: "ethereum",
      payment_tokens: ["ETH", "WETH"],
      royalty_percentage: 2.5,
      explicit_content: false
    }
  };
  
  const openSeaConfigPath = path.join(metadataDir, "opensea-config.json");
  fs.writeFileSync(openSeaConfigPath, JSON.stringify(openSeaConfig, null, 2));
  console.log("✅ OpenSea configuration created:", openSeaConfigPath);
  
  // 5. Create deployment instructions
  console.log("📋 Creating deployment instructions...");
  const deploymentInstructions = {
    steps: [
      {
        step: 1,
        title: "Upload Metadata to Hosting",
        description: "Upload all metadata files to your hosting solution",
        files: [
          "contract.json",
          "unrevealed.json", 
          "1.json to {maxSupply}.json"
        ],
        hosting_options: [
          "IPFS (recommended for decentralization)",
          "Your website (https://api.skunksquadnft.com/)",
          "CDN service (Cloudflare, AWS CloudFront)"
        ]
      },
      {
        step: 2,
        title: "Update Contract URIs",
        description: "Update the contract to point to your hosted metadata",
        functions: [
          "setBaseURI('https://api.skunksquadnft.com/metadata/')",
          "setContractURI('https://api.skunksquadnft.com/contract.json')"
        ]
      },
      {
        step: 3,
        title: "OpenSea Integration",
        description: "Set up your collection on OpenSea",
        actions: [
          "Visit https://testnets.opensea.io/ (for testnet)",
          "Connect wallet and find your collection",
          "Edit collection details and upload images",
          "Configure royalties and settings"
        ]
      },
      {
        step: 4,
        title: "Test Integration",
        description: "Verify everything works correctly",
        checks: [
          "Metadata loads correctly",
          "Images display properly", 
          "Royalties are configured",
          "Trading functions work"
        ]
      }
    ],
    urls: {
      testnet_collection: `https://testnets.opensea.io/assets/sepolia/${CONTRACT_ADDRESS.toLowerCase()}`,
      contract_etherscan: `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`
    }
  };
  
  const instructionsPath = path.join(metadataDir, "deployment-instructions.json");
  fs.writeFileSync(instructionsPath, JSON.stringify(deploymentInstructions, null, 2));
  console.log("✅ Deployment instructions created:", instructionsPath);
  
  // 6. Create URI update script
  console.log("🔧 Creating URI update script...");
  const uriUpdateScript = `const { ethers } = require("hardhat");

async function updateContractURIs() {
  console.log("🔄 Updating contract URIs...");
  
  const CONTRACT_ADDRESS = "${CONTRACT_ADDRESS}";
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

updateContractURIs().catch(console.error);`;

  const uriUpdateScriptPath = path.join(__dirname, "update-uris.js");
  fs.writeFileSync(uriUpdateScriptPath, uriUpdateScript);
  console.log("✅ URI update script created:", uriUpdateScriptPath);
  
  console.log("\n🎉 OpenSea integration setup complete!");
  console.log("\n📂 Created Files:");
  console.log("- metadata/contract.json (Contract-level metadata)");
  console.log("- metadata/unrevealed.json (Pre-reveal metadata)");
  console.log("- metadata/1.json to 5.json (Sample token metadata)");
  console.log("- metadata/opensea-config.json (Collection configuration)");
  console.log("- metadata/deployment-instructions.json (Step-by-step guide)");
  console.log("- scripts/update-uris.js (Contract URI update script)");
  
  console.log("\n🔗 OpenSea Links:");
  console.log("- Testnet Collection:", `https://testnets.opensea.io/assets/sepolia/${CONTRACT_ADDRESS.toLowerCase()}`);
  console.log("- Contract on Etherscan:", `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
  
  console.log("\n📋 Next Steps:");
  console.log("1. Upload metadata files to your hosting solution");
  console.log("2. Run 'npx hardhat run scripts/update-uris.js --network sepolia'");
  console.log("3. Visit OpenSea testnet to configure your collection");
  console.log("4. Test minting and verify metadata displays correctly");
  
  return {
    metadataDirectory: metadataDir,
    contractAddress: CONTRACT_ADDRESS,
    openSeaUrls: openSeaConfig.urls
  };
}

// Sample attributes generator for testing
function generateSampleAttributes(tokenId) {
  const backgrounds = ["Forest", "Desert", "Ocean", "Mountain", "City"];
  const bodies = ["Default", "Hoodie", "Suit", "Casual", "Armor"];
  const heads = ["Default", "Cap", "Crown", "Helmet", "Bandana"];
  const eyes = ["Normal", "Laser", "3D", "Wink", "Sleepy"];
  const mouths = ["Smile", "Frown", "Tongue", "Pipe", "Grin"];
  
  return [
    {
      trait_type: "Background",
      value: backgrounds[tokenId % backgrounds.length]
    },
    {
      trait_type: "Body", 
      value: bodies[tokenId % bodies.length]
    },
    {
      trait_type: "Head",
      value: heads[tokenId % heads.length]
    },
    {
      trait_type: "Eyes",
      value: eyes[tokenId % eyes.length]
    },
    {
      trait_type: "Mouth",
      value: mouths[tokenId % mouths.length]
    },
    {
      trait_type: "Rarity Score",
      value: Math.floor(Math.random() * 100) + 1
    }
  ];
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ OpenSea integration setup failed:", error);
      process.exit(1);
    });
}

module.exports = main;