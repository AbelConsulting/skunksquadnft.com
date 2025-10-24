/**
 * Extract ABI from Hardhat Compilation
 * 
 * This script compiles the contract and extracts the ABI from the artifacts.
 * Use this when Etherscan API is not available or the contract isn't verified yet.
 * 
 * Usage:
 *   node extract_abi_from_contract.js [network]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const network = process.argv[2] || 'sepolia';

console.log('\n🔨 Extracting ABI from Hardhat compilation...\n');

try {
  // Check if contracts directory exists
  if (!fs.existsSync('contracts')) {
    console.error('❌ Error: contracts directory not found');
    console.log('💡 Make sure you\'re in the project root directory');
    process.exit(1);
  }

  // Compile the contract
  console.log('⚙️  Compiling contract...');
  execSync('npx hardhat compile', { stdio: 'inherit' });

  // Find the artifact file
  const artifactsPath = path.join('artifacts', 'contracts');
  
  if (!fs.existsSync(artifactsPath)) {
    console.error('❌ Error: artifacts not found after compilation');
    process.exit(1);
  }

  // Look for SkunkSquadNFT artifact
  const contractName = 'SkunkSquadNFT';
  let artifactFile = null;

  function findArtifact(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        const result = findArtifact(fullPath);
        if (result) return result;
      } else if (file === `${contractName}.json`) {
        return fullPath;
      }
    }
    return null;
  }

  artifactFile = findArtifact(artifactsPath);

  if (!artifactFile) {
    console.error(`❌ Error: Could not find ${contractName}.json artifact`);
    process.exit(1);
  }

  console.log(`✅ Found artifact: ${artifactFile}\n`);

  // Read the artifact
  const artifact = JSON.parse(fs.readFileSync(artifactFile, 'utf8'));
  const abi = artifact.abi;

  // Save ABI to file (formatted)
  const filename = `abi_${contractName}_${network}.json`;
  fs.writeFileSync(filename, JSON.stringify(abi, null, 2));
  console.log(`💾 ABI saved to: ${filename}\n`);

  // Display ABI summary
  const functions = abi.filter(item => item.type === 'function');
  const viewFuncs = functions.filter(f => f.stateMutability === 'view' || f.stateMutability === 'pure');
  const writeFuncs = functions.filter(f => f.stateMutability !== 'view' && f.stateMutability !== 'pure');
  const events = abi.filter(item => item.type === 'event');

  console.log('📊 ABI Summary:');
  console.log(`   Total functions: ${functions.length}`);
  console.log(`   View functions: ${viewFuncs.length}`);
  console.log(`   Write functions: ${writeFuncs.length}`);
  console.log(`   Events: ${events.length}`);

  // Display key functions
  const keyFunctionNames = ['mintNFT', 'totalSupply', 'tokenURI', 'setBaseURI', 'reveal', 'withdraw'];
  const keyFunctions = functions.filter(f => keyFunctionNames.includes(f.name));

  if (keyFunctions.length > 0) {
    console.log('\n🔧 Key Functions:');
    keyFunctions.forEach(func => {
      const params = func.inputs.map(input => `${input.type} ${input.name}`).join(', ');
      const mutability = func.stateMutability === 'view' || func.stateMutability === 'pure' 
        ? ' [view]' 
        : func.stateMutability === 'payable' ? ' [payable]' : '';
      console.log(`   • ${func.name}(${params})${mutability}`);
    });
  }

  // Save compact version for web3 integration
  const compactFilename = `abi_${network}.json`;
  fs.writeFileSync(compactFilename, JSON.stringify(abi));
  console.log(`\n💾 Compact ABI saved to: ${compactFilename}`);

  // Also save contract bytecode info
  const bytecodeInfo = {
    contractName: artifact.contractName,
    sourceName: artifact.sourceName,
    bytecodeSize: artifact.bytecode.length / 2 - 1, // hex to bytes
    deployedBytecodeSize: artifact.deployedBytecode.length / 2 - 1
  };

  console.log('\n📦 Contract Info:');
  console.log(`   Name: ${bytecodeInfo.contractName}`);
  console.log(`   Source: ${bytecodeInfo.sourceName}`);
  console.log(`   Bytecode size: ${bytecodeInfo.bytecodeSize} bytes`);
  console.log(`   Deployed size: ${bytecodeInfo.deployedBytecodeSize} bytes`);

  console.log('\n✨ Done!\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
