const hre = require("hardhat");

async function main() {
    console.log("🔧 Generating Constructor Arguments for Etherscan Verification\n");

    const name = "Skunk Squad";
    const symbol = "SKUNK";
    const baseURI = "ar://zSIUpHcbgIPHN9zu38dyX-cm7-9yoXevvQTpyhMq_TA/";

    console.log("Contract Parameters:");
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Base URI:", baseURI);
    console.log("\n" + "=".repeat(60));

    // Encode constructor arguments
    const abiCoder = new hre.ethers.utils.AbiCoder();
    const encodedArgs = abiCoder.encode(
        ["string", "string", "string"],
        [name, symbol, baseURI]
    );

    // Remove the 0x prefix for Etherscan
    const constructorArgs = encodedArgs.slice(2);

    console.log("\n📋 ETHERSCAN VERIFICATION INSTRUCTIONS");
    console.log("=".repeat(60));
    console.log("\n1. Go to: https://sepolia.etherscan.io/address/0x384062E20B046B738D5b4A158E0D9541437c7a9A#code");
    console.log("\n2. Click 'Verify and Publish'\n");
    console.log("3. Enter these settings:");
    console.log("   - Compiler Type: Solidity (Single file)");
    console.log("   - Compiler Version: v0.8.20+commit.a1b79de6");
    console.log("   - Open Source License: MIT License");
    console.log("   - Optimization: Yes");
    console.log("   - Runs: 200");
    console.log("\n4. Paste the contract code (see below)");
    console.log("\n5. Paste these ABI-Encoded Constructor Arguments:");
    console.log("\n" + "=".repeat(60));
    console.log(constructorArgs);
    console.log("=".repeat(60));

    console.log("\n\n📄 CONTRACT CODE TO PASTE:");
    console.log("=".repeat(60));
    console.log(`
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SkunkSquadNFTSimple is ERC721A, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 20;
    uint256 public constant MAX_PER_TX = 10;
    
    uint256 public mintPrice = 0.01 ether;
    bool public mintingEnabled = false;
    
    string private baseTokenURI;
    
    mapping(address => uint256) public walletMints;
    
    event MintingToggled(bool enabled);
    event PriceUpdated(uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initialBaseURI
    ) ERC721A(_name, _symbol) {
        baseTokenURI = _initialBaseURI;
    }
    
    function mint(uint256 quantity) external payable nonReentrant {
        require(mintingEnabled, "Minting is not enabled");
        require(quantity > 0, "Must mint at least 1");
        require(quantity <= MAX_PER_TX, "Exceeds max per transaction");
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(walletMints[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds max per wallet");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        walletMints[msg.sender] += quantity;
        _mint(msg.sender, quantity);
    }
    
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, quantity);
    }
    
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length != 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
    
    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }
    
    function canMint(address account, uint256 quantity) external view returns (bool) {
        if (!mintingEnabled) return false;
        if (quantity == 0 || quantity > MAX_PER_TX) return false;
        if (_totalMinted() + quantity > MAX_SUPPLY) return false;
        if (walletMints[account] + quantity > MAX_PER_WALLET) return false;
        return true;
    }
}
    `);
    console.log("=".repeat(60));

    console.log("\n\n✅ Copy the constructor arguments above and paste into Etherscan!");
    console.log("\n💡 TIP: The contract code should NOT include imports - Etherscan");
    console.log("    will handle those automatically since we're using 'Single file' mode.\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
