const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

function getRpc(chain) {
  if (chain === 'mainnet') return `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  if (chain === 'sepolia') return `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
  throw new Error('Unsupported chain');
}

class ContractService {
  constructor() {
    const rpc = getRpc(process.env.CHAIN);
    this.provider = new ethers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(process.env.BACKEND_MINTER_PRIVATE_KEY, this.provider);
    const abiPath = path.join(__dirname, 'abi', 'SkunkSquad.json');
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, this.wallet);
  }

  async creditCardMint(to, quantity) {
    const gasOpts = {};
    try {
      const tx = await this.contract.creditCardMint(to, quantity, gasOpts);
      const receipt = await tx.wait();
      return { ok: true, txHash: receipt.transactionHash };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

module.exports = new ContractService();