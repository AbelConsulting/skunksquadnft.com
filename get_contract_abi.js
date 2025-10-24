/**
 * Get Contract ABI from Etherscan
 * 
 * Retrieves the ABI for a verified smart contract using the Etherscan API.
 * 
 * Usage:
 *   node get_contract_abi.js <contract_address> [network]
 * 
 * Examples:
 *   node get_contract_abi.js 0xf14F75aEDBbDE252616410649f4dd7C1963191c4 sepolia
 *   node get_contract_abi.js 0x16Be43d7571Edf69cec8D6221044638d161aA994 mainnet
 */

require('dotenv/config');
const fs = require('fs');
const https = require('https');

// Network configurations
const NETWORKS = {
  mainnet: {
    chainId: '1',
    apiUrl: 'api.etherscan.io',
    explorerUrl: 'https://etherscan.io'
  },
  sepolia: {
    chainId: '11155111',
    apiUrl: 'api-sepolia.etherscan.io',
    explorerUrl: 'https://sepolia.etherscan.io'
  }
};

// Parse command line arguments
const contractAddress = process.argv[2];
const network = process.argv[3] || 'sepolia';

if (!contractAddress) {
  console.error('❌ Error: Contract address is required');
  console.log('\nUsage: node get_contract_abi.js <contract_address> [network]');
  console.log('Example: node get_contract_abi.js 0xf14F75aEDBbDE252616410649f4dd7C1963191c4 sepolia');
  process.exit(1);
}

if (!NETWORKS[network]) {
  console.error(`❌ Error: Unknown network "${network}"`);
  console.log(`Available networks: ${Object.keys(NETWORKS).join(', ')}`);
  process.exit(1);
}

const apiKey = process.env.ETHERSCAN_API_KEY;
if (!apiKey) {
  console.error('❌ Error: ETHERSCAN_API_KEY not found in environment variables');
  console.log('Please add ETHERSCAN_API_KEY to your .env file');
  process.exit(1);
}

const networkConfig = NETWORKS[network];

console.log(`\n🔍 Fetching ABI for contract on ${network}...`);
console.log(`📍 Contract Address: ${contractAddress}`);
console.log(`🌐 Network: ${network} (Chain ID: ${networkConfig.chainId})`);
console.log(`🔗 Explorer: ${networkConfig.explorerUrl}/address/${contractAddress}#code\n`);

// Build API URL - try standard API endpoint
const apiUrl = `https://${networkConfig.apiUrl}/api?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`;

// Fetch ABI from Etherscan
https.get(apiUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (response.status === '1' && response.message === 'OK') {
        const abi = JSON.parse(response.result);
        
        console.log('✅ ABI retrieved successfully!\n');
        
        // Save ABI to file
        const filename = `abi_${contractAddress}_${network}.json`;
        fs.writeFileSync(filename, JSON.stringify(abi, null, 2));
        console.log(`💾 ABI saved to: ${filename}\n`);
        
        // Display ABI summary
        console.log('📊 ABI Summary:');
        console.log(`   Total functions: ${abi.filter(item => item.type === 'function').length}`);
        console.log(`   View functions: ${abi.filter(item => item.type === 'function' && (item.stateMutability === 'view' || item.stateMutability === 'pure')).length}`);
        console.log(`   Write functions: ${abi.filter(item => item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure').length}`);
        console.log(`   Events: ${abi.filter(item => item.type === 'event').length}`);
        
        // Display key functions
        console.log('\n🔧 Key Functions:');
        const keyFunctions = abi.filter(item => 
          item.type === 'function' && 
          (item.name === 'mintNFT' || 
           item.name === 'totalSupply' || 
           item.name === 'tokenURI' || 
           item.name === 'setBaseURI' ||
           item.name === 'reveal' ||
           item.name === 'withdraw')
        );
        
        keyFunctions.forEach(func => {
          const params = func.inputs.map(input => `${input.type} ${input.name}`).join(', ');
          const mutability = func.stateMutability === 'view' || func.stateMutability === 'pure' ? ' [view]' : func.payable ? ' [payable]' : '';
          console.log(`   • ${func.name}(${params})${mutability}`);
        });
        
        // Save compact version for web3 integration
        const compactFilename = `abi_${network}.json`;
        fs.writeFileSync(compactFilename, JSON.stringify(abi));
        console.log(`\n💾 Compact ABI saved to: ${compactFilename}`);
        
        console.log('\n✨ Done!\n');
        
      } else {
        console.error('❌ Error fetching ABI:');
        console.error(`   Status: ${response.status}`);
        console.error(`   Message: ${response.message}`);
        console.error(`   Result: ${response.result}`);
        
        if (response.result === 'Contract source code not verified') {
          console.log('\n💡 Tip: Make sure the contract is verified on Etherscan first.');
          console.log(`   Verify at: ${networkConfig.explorerUrl}/verifyContract?a=${contractAddress}`);
        }
        
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('Response data:', data);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ Request error:', error.message);
  process.exit(1);
});
