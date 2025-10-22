const fetch = require('node-fetch');

async function getArDriveDataTransaction(fileId) {
    console.log("🔍 Looking up ArDrive file data transaction...\n");
    console.log("File-Id:", fileId);
    
    // ArDrive uses Arweave GraphQL to store metadata
    const query = `
        query {
            transactions(
                tags: [
                    { name: "File-Id", values: ["${fileId}"] }
                    { name: "Entity-Type", values: ["file"] }
                ]
                first: 10
                sort: HEIGHT_DESC
            ) {
                edges {
                    node {
                        id
                        tags {
                            name
                            value
                        }
                        block {
                            timestamp
                            height
                        }
                    }
                }
            }
        }
    `;

    try {
        const response = await fetch('https://arweave.net/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();
        
        if (result.data && result.data.transactions.edges.length > 0) {
            console.log(`\n✅ Found ${result.data.transactions.edges.length} transaction(s):\n`);
            
            result.data.transactions.edges.forEach((edge, index) => {
                const txId = edge.node.id;
                const tags = edge.node.tags;
                const contentType = tags.find(t => t.name === 'Content-Type')?.value;
                const entityType = tags.find(t => t.name === 'Entity-Type')?.value;
                const dataTxId = tags.find(t => t.name === 'Data-Tx-Id')?.value;
                const timestamp = edge.node.block?.timestamp;
                
                console.log(`Transaction #${index + 1}:`);
                console.log(`  Metadata TX ID: ${txId}`);
                if (dataTxId) {
                    console.log(`  ✨ Data TX ID: ${dataTxId}`);
                    console.log(`  🌐 Data URL: https://arweave.net/${dataTxId}`);
                    console.log(`  🔗 Base URI: ar://${dataTxId}/`);
                }
                console.log(`  Content-Type: ${contentType || 'unknown'}`);
                console.log(`  Entity-Type: ${entityType || 'unknown'}`);
                if (timestamp) {
                    console.log(`  Timestamp: ${new Date(timestamp * 1000).toISOString()}`);
                }
                console.log();
            });
            
            // Find the data transaction
            const dataTransaction = result.data.transactions.edges.find(edge => {
                const tags = edge.node.tags;
                const dataTxId = tags.find(t => t.name === 'Data-Tx-Id')?.value;
                return dataTxId;
            });
            
            if (dataTransaction) {
                const dataTxId = dataTransaction.node.tags.find(t => t.name === 'Data-Tx-Id')?.value;
                console.log("🎯 RECOMMENDED BASE URI:");
                console.log(`   ar://${dataTxId}/`);
                console.log("\n📋 To update your contract, run:");
                console.log(`   npx hardhat run scripts/update-contract-uri.js --network sepolia ${dataTxId}`);
                
                return dataTxId;
            } else {
                // If no Data-Tx-Id, the metadata transaction itself contains the data
                const firstTxId = result.data.transactions.edges[0].node.id;
                console.log("🎯 RECOMMENDED BASE URI:");
                console.log(`   ar://${firstTxId}/`);
                console.log("\n📋 To update your contract, run:");
                console.log(`   npx hardhat run scripts/update-contract-uri.js --network sepolia ${firstTxId}`);
                
                return firstTxId;
            }
        } else {
            console.log("❌ No transactions found for this File-Id");
            console.log("\n💡 This could mean:");
            console.log("   1. The file hasn't been confirmed on Arweave yet");
            console.log("   2. The File-Id is incorrect");
            console.log("   3. The transaction is still being mined");
            
            return null;
        }
    } catch (error) {
        console.error("❌ Error querying Arweave:", error.message);
        return null;
    }
}

// Run with the File-Id from ArDrive
const fileId = process.argv[2] || "e93d706d-678e-4d3a-bb85-028ab83dee6c";

if (require.main === module) {
    getArDriveDataTransaction(fileId)
        .then((txId) => {
            if (txId) {
                console.log("\n✅ Success! Use the Data TX ID above.");
                process.exit(0);
            } else {
                console.log("\n⚠️  Could not find Data TX ID. Check ArDrive web interface.");
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error("❌ Script failed:", error);
            process.exit(1);
        });
}

module.exports = getArDriveDataTransaction;
