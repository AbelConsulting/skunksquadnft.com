// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SkunkSquadNFT 2.0
 * @dev Simplified NFT contract focusing on core functionality
 */
contract SkunkSquadNFTSimple is ERC721A, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // =============================================================
    //                           STORAGE
    // =============================================================
    
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 20;
    uint256 public constant MAX_PER_TX = 10;
    
    uint256 public mintPrice = 0.01 ether;
    bool public mintingEnabled = false;
    
    string private baseTokenURI;
    
    // Track mints per wallet
    mapping(address => uint256) public walletMints;
    
    // =============================================================
    //                          EVENTS
    // =============================================================
    
    event MintingToggled(bool enabled);
    event PriceUpdated(uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    
    // =============================================================
    //                        CONSTRUCTOR
    // =============================================================
    
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initialBaseURI
    ) ERC721A(_name, _symbol) {
        baseTokenURI = _initialBaseURI;
    }
    
    // =============================================================
    //                      MINTING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Public mint function
     * @param quantity Number of NFTs to mint
     */
    function mint(uint256 quantity) 
        external 
        payable 
        nonReentrant 
    {
        require(mintingEnabled, "Minting is not enabled");
        require(quantity > 0, "Must mint at least 1");
        require(quantity <= MAX_PER_TX, "Exceeds max per transaction");
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(walletMints[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds max per wallet");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");
        
        walletMints[msg.sender] += quantity;
        _mint(msg.sender, quantity);
    }
    
    /**
     * @notice Owner mint for team/giveaways
     * @param to Address to mint to
     * @param quantity Number to mint
     */
    function ownerMint(address to, uint256 quantity) 
        external 
        onlyOwner 
    {
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, quantity);
    }
    
    // =============================================================
    //                      ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Toggle minting on/off
     */
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }
    
    /**
     * @notice Update mint price
     * @param newPrice New price in wei
     */
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit PriceUpdated(newPrice);
    }
    
    /**
     * @notice Set base URI for metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @notice Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // =============================================================
    //                       VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get token URI
     * @param tokenId Token ID
     */
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override 
        returns (string memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length != 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }
    
    /**
     * @notice Get base URI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }
    
    /**
     * @notice Starting token ID (1 instead of 0)
     */
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
    
    /**
     * @notice Get total minted
     */
    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }
    
    /**
     * @notice Check if address can mint quantity
     * @param account Address to check
     * @param quantity Quantity to mint
     */
    function canMint(address account, uint256 quantity) 
        external 
        view 
        returns (bool) 
    {
        if (!mintingEnabled) return false;
        if (quantity == 0 || quantity > MAX_PER_TX) return false;
        if (_totalMinted() + quantity > MAX_SUPPLY) return false;
        if (walletMints[account] + quantity > MAX_PER_WALLET) return false;
        return true;
    }
}
