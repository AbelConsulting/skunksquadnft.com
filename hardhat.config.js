require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");

// Load environment variables
require('dotenv').config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

// Helper function to get RPC URL with fallback
function getRpcUrl(network) {
  if (ALCHEMY_API_KEY) {
    const alchemyUrls = {
      sepolia: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      mainnet: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    };
    return alchemyUrls[network];
  } else if (INFURA_PROJECT_ID) {
    const infuraUrls = {
      sepolia: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      mainnet: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
    };
    return infuraUrls[network];
  }
  throw new Error("Please provide either ALCHEMY_API_KEY or INFURA_PROJECT_ID in your .env file");
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: getRpcUrl("sepolia"),
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: getRpcUrl("mainnet"),
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    gasPrice: 20,
  },
  mocha: {
    timeout: 40000,
  },
};