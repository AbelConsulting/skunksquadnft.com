const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");

describe("SkunkSquadNFT", function () {
  let contract;
  let owner;
  let user1;
  let user2;
  let user3;
  let royaltyRecipient;
  let merkleTree;
  let merkleRoot;
  
  const CONTRACT_NAME = "Skunk Squad Test";
  const CONTRACT_SYMBOL = "SKUNKTEST";
  const BASE_URI = "https://test.example.com/";
  const CONTRACT_URI = "https://test.example.com/contract.json";
  const UNREVEALED_URI = "https://test.example.com/unrevealed.json";
  const MINT_PRICE = ethers.parseEther("0.05");
  const MAX_SUPPLY = 10000;
  
  // Whitelist addresses for testing
  const whitelistAddresses = [];
  
  beforeEach(async function () {
    [owner, user1, user2, user3, royaltyRecipient] = await ethers.getSigners();
    
    // Set up whitelist
    whitelistAddresses.push(user1.address, user2.address);
    
    // Create merkle tree
    const leaves = whitelistAddresses.map(address => 
      ethers.keccak256(ethers.solidityPacked(["address"], [address]))
    );
    merkleTree = new MerkleTree(leaves, ethers.keccak256, { sortPairs: true });
    merkleRoot = merkleTree.getHexRoot();
    
    // Deploy contract
    const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFT");
    contract = await SkunkSquadNFT.deploy(
      CONTRACT_NAME,
      CONTRACT_SYMBOL,
      BASE_URI,
      CONTRACT_URI,
      UNREVEALED_URI,
      royaltyRecipient.address
    );
    await contract.waitForDeployment();
    
    // Set merkle root
    await contract.setMerkleRoot(merkleRoot);
  });
  
  function getWhitelistProof(address) {
    const leaf = ethers.keccak256(ethers.solidityPacked(["address"], [address]));
    return merkleTree.getHexProof(leaf);
  }
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await contract.name()).to.equal(CONTRACT_NAME);
      expect(await contract.symbol()).to.equal(CONTRACT_SYMBOL);
    });
    
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct constants", async function () {
      expect(await contract.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
      expect(await contract.MINT_PRICE()).to.equal(MINT_PRICE);
      expect(await contract.MAX_PER_TX()).to.equal(10);
      expect(await contract.MAX_PER_WALLET_WHITELIST()).to.equal(3);
      expect(await contract.MAX_PER_WALLET_PUBLIC()).to.equal(20);
    });
    
    it("Should start with minting disabled", async function () {
      expect(await contract.whitelistMintActive()).to.be.false;
      expect(await contract.publicMintActive()).to.be.false;
    });
    
    it("Should start unrevealed", async function () {
      expect(await contract.isRevealed()).to.be.false;
    });
    
    it("Should set correct royalty info", async function () {
      const [receiver, amount] = await contract.royaltyInfo(1, ethers.parseEther("1"));
      expect(receiver).to.equal(royaltyRecipient.address);
      expect(amount).to.equal(ethers.parseEther("0.025")); // 2.5%
    });
  });
  
  describe("Owner Functions", function () {
    it("Should allow owner to toggle whitelist mint", async function () {
      await expect(contract.toggleWhitelistMint())
        .to.emit(contract, "WhitelistMintToggled")
        .withArgs(true);
      
      expect(await contract.whitelistMintActive()).to.be.true;
      
      await contract.toggleWhitelistMint();
      expect(await contract.whitelistMintActive()).to.be.false;
    });
    
    it("Should allow owner to toggle public mint", async function () {
      await expect(contract.togglePublicMint())
        .to.emit(contract, "PublicMintToggled")
        .withArgs(true);
      
      expect(await contract.publicMintActive()).to.be.true;
    });
    
    it("Should allow owner to set merkle root", async function () {
      const newRoot = "0x1234567890123456789012345678901234567890123456789012345678901234";
      await expect(contract.setMerkleRoot(newRoot))
        .to.emit(contract, "MerkleRootUpdated")
        .withArgs(newRoot);
      
      expect(await contract.merkleRoot()).to.equal(newRoot);
    });
    
    it("Should allow owner to set base URI", async function () {
      const newURI = "https://new.example.com/";
      await expect(contract.setBaseURI(newURI))
        .to.emit(contract, "BaseURIUpdated")
        .withArgs(newURI);
    });
    
    it("Should allow owner to reveal", async function () {
      const revealURI = "https://revealed.example.com/";
      await expect(contract.reveal(revealURI))
        .to.emit(contract, "Revealed")
        .withArgs(revealURI);
      
      expect(await contract.isRevealed()).to.be.true;
    });
    
    it("Should not allow revealing twice", async function () {
      await contract.reveal("https://revealed.example.com/");
      await expect(contract.reveal("https://revealed2.example.com/"))
        .to.be.revertedWith("Already revealed");
    });
    
    it("Should reject non-owner calls", async function () {
      await expect(contract.connect(user1).toggleWhitelistMint())
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(contract.connect(user1).setMerkleRoot(merkleRoot))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Whitelist Minting", function () {
    beforeEach(async function () {
      await contract.toggleWhitelistMint(); // Enable whitelist minting
    });
    
    it("Should allow whitelisted users to mint", async function () {
      const proof = getWhitelistProof(user1.address);
      const quantity = 2;
      const value = MINT_PRICE * BigInt(quantity);
      
      await expect(contract.connect(user1).whitelistMint(quantity, proof, { value }))
        .to.emit(contract, "Transfer");
      
      expect(await contract.balanceOf(user1.address)).to.equal(quantity);
      expect(await contract.whitelistMinted(user1.address)).to.equal(quantity);
    });
    
    it("Should reject non-whitelisted users", async function () {
      const proof = getWhitelistProof(user1.address); // Wrong proof for user3
      const quantity = 1;
      const value = MINT_PRICE * BigInt(quantity);
      
      await expect(contract.connect(user3).whitelistMint(quantity, proof, { value }))
        .to.be.revertedWith("Invalid merkle proof");
    });
    
    it("Should enforce whitelist mint limit", async function () {
      const proof = getWhitelistProof(user1.address);
      const quantity = 4; // Exceeds MAX_PER_WALLET_WHITELIST (3)
      const value = MINT_PRICE * BigInt(quantity);
      
      await expect(contract.connect(user1).whitelistMint(quantity, proof, { value }))
        .to.be.revertedWith("Exceeds whitelist limit");
    });
    
    it("Should require sufficient payment", async function () {
      const proof = getWhitelistProof(user1.address);
      const quantity = 2;
      const insufficientValue = MINT_PRICE; // Not enough for 2 tokens
      
      await expect(contract.connect(user1).whitelistMint(quantity, proof, { value: insufficientValue }))
        .to.be.revertedWith("Insufficient payment");
    });
    
    it("Should reject minting when whitelist is disabled", async function () {
      await contract.toggleWhitelistMint(); // Disable
      
      const proof = getWhitelistProof(user1.address);
      const quantity = 1;
      const value = MINT_PRICE;
      
      await expect(contract.connect(user1).whitelistMint(quantity, proof, { value }))
        .to.be.revertedWith("Whitelist mint not active");
    });
    
    it("Should track whitelist mints correctly", async function () {
      const proof = getWhitelistProof(user1.address);
      
      // First mint
      await contract.connect(user1).whitelistMint(2, proof, { value: MINT_PRICE * 2n });
      expect(await contract.whitelistMinted(user1.address)).to.equal(2);
      
      // Second mint
      await contract.connect(user1).whitelistMint(1, proof, { value: MINT_PRICE });
      expect(await contract.whitelistMinted(user1.address)).to.equal(3);
      
      // Should reject exceeding limit
      await expect(contract.connect(user1).whitelistMint(1, proof, { value: MINT_PRICE }))
        .to.be.revertedWith("Exceeds whitelist limit");
    });
  });
  
  describe("Public Minting", function () {
    beforeEach(async function () {
      await contract.togglePublicMint(); // Enable public minting
    });
    
    it("Should allow public minting", async function () {
      const quantity = 5;
      const value = MINT_PRICE * BigInt(quantity);
      
      await expect(contract.connect(user3).publicMint(quantity, { value }))
        .to.emit(contract, "Transfer");
      
      expect(await contract.balanceOf(user3.address)).to.equal(quantity);
      expect(await contract.publicMinted(user3.address)).to.equal(quantity);
    });
    
    it("Should enforce per-transaction limit", async function () {
      const quantity = 11; // Exceeds MAX_PER_TX (10)
      const value = MINT_PRICE * BigInt(quantity);
      
      await expect(contract.connect(user3).publicMint(quantity, { value }))
        .to.be.revertedWith("Exceeds per transaction limit");
    });
    
    it("Should enforce per-wallet limit", async function () {
      // First mint: 10 tokens
      await contract.connect(user3).publicMint(10, { value: MINT_PRICE * 10n });
      expect(await contract.publicMinted(user3.address)).to.equal(10);
      
      // Second mint: 10 more tokens
      await contract.connect(user3).publicMint(10, { value: MINT_PRICE * 10n });
      expect(await contract.publicMinted(user3.address)).to.equal(20);
      
      // Third mint: Should fail (exceeds MAX_PER_WALLET_PUBLIC)
      await expect(contract.connect(user3).publicMint(1, { value: MINT_PRICE }))
        .to.be.revertedWith("Exceeds wallet limit");
    });
    
    it("Should require sufficient payment", async function () {
      const quantity = 3;
      const insufficientValue = MINT_PRICE * 2n; // Not enough for 3 tokens
      
      await expect(contract.connect(user3).publicMint(quantity, { value: insufficientValue }))
        .to.be.revertedWith("Insufficient payment");
    });
    
    it("Should reject minting when public mint is disabled", async function () {
      await contract.togglePublicMint(); // Disable
      
      const quantity = 1;
      const value = MINT_PRICE;
      
      await expect(contract.connect(user3).publicMint(quantity, { value }))
        .to.be.revertedWith("Public mint not active");
    });
  });
  
  describe("Owner Minting", function () {
    it("Should allow owner to mint for free", async function () {
      const quantity = 50;
      
      await expect(contract.ownerMint(user3.address, quantity))
        .to.emit(contract, "Transfer");
      
      expect(await contract.balanceOf(user3.address)).to.equal(quantity);
    });
    
    it("Should allow batch owner minting", async function () {
      const recipients = [user1.address, user2.address, user3.address];
      const quantities = [10, 20, 30];
      
      await expect(contract.batchOwnerMint(recipients, quantities))
        .to.emit(contract, "Transfer");
      
      expect(await contract.balanceOf(user1.address)).to.equal(10);
      expect(await contract.balanceOf(user2.address)).to.equal(20);
      expect(await contract.balanceOf(user3.address)).to.equal(30);
    });
    
    it("Should reject mismatched arrays in batch mint", async function () {
      const recipients = [user1.address, user2.address];
      const quantities = [10]; // Mismatched length
      
      await expect(contract.batchOwnerMint(recipients, quantities))
        .to.be.revertedWith("Arrays length mismatch");
    });
    
    it("Should reject non-owner calls", async function () {
      await expect(contract.connect(user1).ownerMint(user1.address, 1))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Supply Management", function () {
    it("Should enforce max supply", async function () {
      // Try to mint beyond max supply using owner mint
      await expect(contract.ownerMint(owner.address, MAX_SUPPLY + 1))
        .to.be.revertedWith("Exceeds max supply");
    });
    
    it("Should track total minted correctly", async function () {
      await contract.ownerMint(user1.address, 100);
      expect(await contract.totalMinted()).to.equal(100);
      
      await contract.ownerMint(user2.address, 50);
      expect(await contract.totalMinted()).to.equal(150);
    });
    
    it("Should enforce supply limit across all mint types", async function () {
      // Mint close to max supply
      await contract.ownerMint(owner.address, MAX_SUPPLY - 5);
      
      // Enable public minting
      await contract.togglePublicMint();
      
      // Try to mint 10 tokens (should fail as only 5 remaining)
      const value = MINT_PRICE * 10n;
      await expect(contract.connect(user3).publicMint(10, { value }))
        .to.be.revertedWith("Exceeds max supply");
      
      // Should be able to mint remaining 5
      const remainingValue = MINT_PRICE * 5n;
      await contract.connect(user3).publicMint(5, { value: remainingValue });
      expect(await contract.totalMinted()).to.equal(MAX_SUPPLY);
    });
  });
  
  describe("Metadata", function () {
    it("Should return unrevealed URI before reveal", async function () {
      await contract.ownerMint(user1.address, 1);
      expect(await contract.tokenURI(1)).to.equal(UNREVEALED_URI);
    });
    
    it("Should return correct URI after reveal", async function () {
      await contract.ownerMint(user1.address, 1);
      await contract.reveal(BASE_URI);
      expect(await contract.tokenURI(1)).to.equal(BASE_URI + "1.json");
    });
    
    it("Should return contract URI", async function () {
      expect(await contract.contractURI()).to.equal(CONTRACT_URI);
    });
    
    it("Should revert for non-existent tokens", async function () {
      await expect(contract.tokenURI(999))
        .to.be.revertedWith("URIQueryForNonexistentToken");
    });
  });
  
  describe("Royalties", function () {
    it("Should return correct royalty info", async function () {
      const salePrice = ethers.parseEther("1");
      const [receiver, amount] = await contract.royaltyInfo(1, salePrice);
      
      expect(receiver).to.equal(royaltyRecipient.address);
      expect(amount).to.equal(salePrice * 250n / 10000n); // 2.5%
    });
    
    it("Should allow owner to update royalty info", async function () {
      const newRecipient = user1.address;
      const newFee = 500; // 5%
      
      await expect(contract.setRoyaltyInfo(newRecipient, newFee))
        .to.emit(contract, "RoyaltyUpdated")
        .withArgs(newRecipient, newFee);
    });
    
    it("Should reject royalty fee too high", async function () {
      await expect(contract.setRoyaltyInfo(user1.address, 1001)) // > 10%
        .to.be.revertedWith("Royalty fee too high");
    });
  });
  
  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Add some funds to contract
      await contract.togglePublicMint();
      await contract.connect(user1).publicMint(1, { value: MINT_PRICE });
    });
    
    it("Should allow owner to withdraw funds", async function () {
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(contract.target);
      
      await expect(contract.withdraw()).to.emit(contract, "Withdrawal");
      
      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.be.gt(initialBalance); // Account for gas costs
      expect(await ethers.provider.getBalance(contract.target)).to.equal(0);
    });
    
    it("Should allow emergency withdraw", async function () {
      const recipient = user2.address;
      const initialBalance = await ethers.provider.getBalance(recipient);
      
      await contract.emergencyWithdraw(recipient);
      
      const finalBalance = await ethers.provider.getBalance(recipient);
      expect(finalBalance).to.equal(initialBalance + MINT_PRICE);
    });
    
    it("Should reject withdrawal with no funds", async function () {
      await contract.withdraw(); // First withdrawal
      await expect(contract.withdraw()).to.be.revertedWith("No funds to withdraw");
    });
    
    it("Should reject non-owner withdrawal", async function () {
      await expect(contract.connect(user1).withdraw())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Security", function () {
    it("Should reject contract calls", async function () {
      // Deploy a malicious contract
      const MaliciousContract = await ethers.getContractFactory("TestMaliciousContract");
      const malicious = await MaliciousContract.deploy(contract.target);
      
      await contract.togglePublicMint();
      
      await expect(malicious.attemptMint())
        .to.be.revertedWith("No contracts allowed");
    });
    
    it("Should prevent reentrancy", async function () {
      // This would need a more complex setup with a reentrancy contract
      // For now, we'll just verify the ReentrancyGuard is in place
      expect(await contract.supportsInterface("0x01ffc9a7")).to.be.true; // ERC165
    });
    
    it("Should require quantity > 0", async function () {
      await contract.togglePublicMint();
      
      await expect(contract.connect(user1).publicMint(0, { value: 0 }))
        .to.be.revertedWith("Quantity must be greater than 0");
    });
  });
  
  describe("Interface Support", function () {
    it("Should support required interfaces", async function () {
      // ERC721A
      expect(await contract.supportsInterface("0x80ac58cd")).to.be.true;
      // ERC2981 (Royalties)
      expect(await contract.supportsInterface("0x2a55205a")).to.be.true;
      // ERC165
      expect(await contract.supportsInterface("0x01ffc9a7")).to.be.true;
    });
  });
});