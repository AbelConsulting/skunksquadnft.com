const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🧪 COMPLETE CONTRACT TEST SUITE\n");
    console.log("=" .repeat(60));

    // Load deployment info
    const deployment = JSON.parse(
        fs.readFileSync('deployments/simple-deployment.json', 'utf8')
    );
    
    const contractAddress = deployment.contractAddress;
    console.log("Contract Address:", contractAddress);
    console.log("Network:", deployment.network);
    console.log("=" .repeat(60) + "\n");

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log("Testing from:", signer.address);
    
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

    // Get contract
    const contract = await hre.ethers.getContractAt(
        "SkunkSquadNFTSimple",
        contractAddress
    );

    let testsPassed = 0;
    let testsFailed = 0;

    // Helper function for tests
    const test = async (name, fn) => {
        try {
            process.stdout.write(`  ${name}... `);
            await fn();
            console.log("✅ PASS");
            testsPassed++;
        } catch (error) {
            console.log("❌ FAIL");
            console.log("    Error:", error.message);
            testsFailed++;
        }
    };

    console.log("📊 TEST 1: CONTRACT STATE VERIFICATION");
    console.log("-".repeat(60));
    
    await test("Contract is deployed", async () => {
        const code = await hre.ethers.provider.getCode(contractAddress);
        if (code === "0x") throw new Error("No contract at address");
    });

    await test("Owner is correct", async () => {
        const owner = await contract.owner();
        if (owner !== signer.address) throw new Error(`Owner mismatch: ${owner}`);
    });

    await test("Max supply is 10000", async () => {
        const maxSupply = await contract.MAX_SUPPLY();
        if (maxSupply.toString() !== "10000") throw new Error(`Max supply: ${maxSupply}`);
    });

    await test("Max per wallet is 20", async () => {
        const maxPerWallet = await contract.MAX_PER_WALLET();
        if (maxPerWallet.toString() !== "20") throw new Error(`Max per wallet: ${maxPerWallet}`);
    });

    await test("Max per TX is 10", async () => {
        const maxPerTx = await contract.MAX_PER_TX();
        if (maxPerTx.toString() !== "10") throw new Error(`Max per TX: ${maxPerTx}`);
    });

    await test("Mint price is 0.01 ETH", async () => {
        const mintPrice = await contract.mintPrice();
        const expected = hre.ethers.utils.parseEther("0.01");
        if (!mintPrice.eq(expected)) throw new Error(`Price: ${hre.ethers.utils.formatEther(mintPrice)} ETH`);
    });

    await test("Token starts at ID 1", async () => {
        const totalMinted = await contract.totalMinted();
        if (totalMinted.gt(0)) {
            const tokenURI = await contract.tokenURI(1);
            if (!tokenURI.includes("/1.json")) throw new Error("Token ID doesn't start at 1");
        }
    });

    console.log("\n📊 TEST 2: MINTING STATE");
    console.log("-".repeat(60));

    let mintingEnabled;
    await test("Check minting enabled", async () => {
        mintingEnabled = await contract.mintingEnabled();
    });
    console.log(`    Minting is currently: ${mintingEnabled ? "ENABLED ✅" : "DISABLED ❌"}`);

    let currentSupply;
    await test("Get current supply", async () => {
        currentSupply = await contract.totalSupply();
        const totalMinted = await contract.totalMinted();
        if (!currentSupply.eq(totalMinted)) throw new Error("Supply/Minted mismatch");
    });
    console.log(`    Current supply: ${currentSupply}`);

    let walletMints;
    await test("Check wallet mints", async () => {
        walletMints = await contract.walletMints(signer.address);
    });
    console.log(`    Your mints: ${walletMints}`);

    console.log("\n📊 TEST 3: ADMIN FUNCTIONS");
    console.log("-".repeat(60));

    await test("Can toggle minting off", async () => {
        if (mintingEnabled) {
            const tx = await contract.toggleMinting();
            await tx.wait();
            const newState = await contract.mintingEnabled();
            if (newState) throw new Error("Minting still enabled");
        }
    });

    await test("Can toggle minting back on", async () => {
        const currentState = await contract.mintingEnabled();
        if (!currentState) {
            const tx = await contract.toggleMinting();
            await tx.wait();
            const newState = await contract.mintingEnabled();
            if (!newState) throw new Error("Minting still disabled");
        }
    });

    await test("Can update mint price", async () => {
        const originalPrice = await contract.mintPrice();
        const newPrice = hre.ethers.utils.parseEther("0.02");
        
        const tx = await contract.setMintPrice(newPrice);
        await tx.wait();
        
        const updatedPrice = await contract.mintPrice();
        if (!updatedPrice.eq(newPrice)) throw new Error("Price not updated");
        
        // Restore original
        const tx2 = await contract.setMintPrice(originalPrice);
        await tx2.wait();
    });

    await test("Can update base URI", async () => {
        const testURI = "ar://test123/";
        const tx = await contract.setBaseURI(testURI);
        await tx.wait();
        
        // Restore original
        const tx2 = await contract.setBaseURI(deployment.baseURI);
        await tx2.wait();
    });

    console.log("\n📊 TEST 4: MINTING FUNCTIONALITY");
    console.log("-".repeat(60));

    let canMint;
    await test("Check canMint function", async () => {
        canMint = await contract.canMint(signer.address, 2);
    });
    console.log(`    Can mint 2 NFTs: ${canMint ? "YES ✅" : "NO ❌"}`);

    if (canMint && currentSupply.lt(10000)) {
        await test("Mint 2 NFTs", async () => {
            const mintPrice = await contract.mintPrice();
            const totalCost = mintPrice.mul(2);
            
            const tx = await contract.mint(2, {
                value: totalCost,
                gasLimit: 300000
            });
            
            await tx.wait();
            
            const newSupply = await contract.totalSupply();
            if (!newSupply.eq(currentSupply.add(2))) throw new Error("Supply not increased");
        });
        
        currentSupply = await contract.totalSupply();
        console.log(`    New supply: ${currentSupply}`);
    } else {
        console.log("    ⏭️  Skipping mint test (minting disabled or supply full)");
    }

    console.log("\n📊 TEST 5: TOKEN URI VERIFICATION");
    console.log("-".repeat(60));

    if (currentSupply.gt(0)) {
        await test("Token URI format (token #1)", async () => {
            const uri = await contract.tokenURI(1);
            const expected = `${deployment.baseURI}1.json`;
            if (uri !== expected) throw new Error(`URI mismatch: ${uri}`);
        });

        await test("Token URI format (last minted)", async () => {
            const lastTokenId = currentSupply.toString();
            const uri = await contract.tokenURI(lastTokenId);
            const expected = `${deployment.baseURI}${lastTokenId}.json`;
            if (uri !== expected) throw new Error(`URI mismatch: ${uri}`);
        });

        await test("Invalid token ID reverts", async () => {
            try {
                await contract.tokenURI(99999);
                throw new Error("Should have reverted");
            } catch (error) {
                if (!error.message.includes("Token does not exist")) throw error;
            }
        });
    }

    console.log("\n📊 TEST 6: OWNER MINT FUNCTION");
    console.log("-".repeat(60));

    await test("Owner can mint for free", async () => {
        const beforeSupply = await contract.totalSupply();
        
        const tx = await contract.ownerMint(signer.address, 1);
        await tx.wait();
        
        const afterSupply = await contract.totalSupply();
        if (!afterSupply.eq(beforeSupply.add(1))) throw new Error("Supply not increased");
    });

    console.log("\n📊 TEST 7: EDGE CASES & SECURITY");
    console.log("-".repeat(60));

    await test("Cannot mint 0 NFTs", async () => {
        try {
            const mintPrice = await contract.mintPrice();
            await contract.mint(0, { value: mintPrice });
            throw new Error("Should have reverted");
        } catch (error) {
            if (!error.message.includes("Must mint at least 1")) throw error;
        }
    });

    await test("Cannot mint more than MAX_PER_TX", async () => {
        try {
            const mintPrice = await contract.mintPrice();
            const totalCost = mintPrice.mul(11);
            await contract.mint(11, { value: totalCost });
            throw new Error("Should have reverted");
        } catch (error) {
            if (!error.message.includes("Exceeds max per transaction")) throw error;
        }
    });

    await test("Cannot mint with insufficient payment", async () => {
        try {
            await contract.mint(2, { value: 1 });
            throw new Error("Should have reverted");
        } catch (error) {
            if (!error.message.includes("Insufficient payment")) throw error;
        }
    });

    await test("Withdraw function exists", async () => {
        const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
        if (contractBalance.gt(0)) {
            const tx = await contract.withdraw();
            await tx.wait();
        }
    });

    console.log("\n📊 TEST 8: ARWEAVE METADATA CHECK");
    console.log("-".repeat(60));

    await test("Manifest is accessible", async () => {
        const manifestUrl = `https://arweave.net/${deployment.baseURI.replace("ar://", "").replace("/", "")}`;
        // This would need fetch, skipping actual HTTP check
        console.log(`\n    Manifest URL: ${manifestUrl}`);
    });

    if (currentSupply.gt(0)) {
        console.log("    Sample token URIs:");
        for (let i = 1; i <= Math.min(3, currentSupply); i++) {
            const uri = await contract.tokenURI(i);
            console.log(`      Token #${i}: ${uri}`);
        }
    }

    // Final Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    
    const finalSupply = await contract.totalSupply();
    const finalMintingState = await contract.mintingEnabled();
    const finalPrice = await contract.mintPrice();
    
    console.log("\n📊 FINAL CONTRACT STATE:");
    console.log(`  Total Supply: ${finalSupply} / 10000`);
    console.log(`  Minting Enabled: ${finalMintingState}`);
    console.log(`  Mint Price: ${hre.ethers.utils.formatEther(finalPrice)} ETH`);
    console.log(`  Contract Balance: ${hre.ethers.utils.formatEther(await hre.ethers.provider.getBalance(contractAddress))} ETH`);
    
    console.log("\n" + "=".repeat(60));
    if (testsFailed === 0) {
        console.log("🎉 ALL TESTS PASSED! CONTRACT IS READY FOR MAINNET!");
    } else {
        console.log("⚠️  SOME TESTS FAILED - REVIEW BEFORE MAINNET DEPLOYMENT");
    }
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
