// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title SkunkSquadNFT
 * @dev ERC721A implementation for Skunk Squad NFT collection
 * Features:
 * - Gas-optimized batch minting with ERC721A
 * - Whitelist minting with Merkle tree verification
 * - Public minting with configurable limits
 * - EIP-2981 royalty standard
 * - Owner functions for team minting and configuration
 */
contract SkunkSquadNFT is ERC721A, Ownable, ReentrancyGuard, IERC2981 {
    
    // =============================================================
    //                            STORAGE
    // =============================================================
    
    /// @notice Maximum total supply of tokens
    uint256 public constant MAX_SUPPLY = 10000;
    
    /// @notice Maximum tokens that can be minted per transaction in public sale
    uint256 public constant MAX_PER_TX = 10;
    
    /// @notice Maximum tokens that can be minted per wallet in whitelist sale
    uint256 public constant MAX_PER_WALLET_WHITELIST = 3;
    
    /// @notice Maximum tokens that can be minted per wallet in public sale
    uint256 public constant MAX_PER_WALLET_PUBLIC = 20;
    
    /// @notice Price per token in wei (0.05 ETH)
    uint256 public constant MINT_PRICE = 0.05 ether;
    
    /// @notice Base URI for token metadata
    string private _baseTokenURI;
    
    /// @notice Contract-level metadata URI
    string private _contractURI;
    
    /// @notice Merkle root for whitelist verification
    bytes32 public merkleRoot;
    
    /// @notice Whether whitelist minting is active
    bool public whitelistMintActive = false;
    
    /// @notice Whether public minting is active
    bool public publicMintActive = false;
    
    /// @notice Whether metadata is revealed
    bool public isRevealed = false;
    
    /// @notice URI for unrevealed metadata
    string private _unrevealedURI;
    
    /// @notice Royalty fee in basis points (250 = 2.5%)
    uint96 private constant ROYALTY_FEE = 250;
    
    /// @notice Address to receive royalties
    address private _royaltyRecipient;
    
    /// @notice Mapping to track whitelist mints per wallet
    mapping(address => uint256) public whitelistMinted;
    
    /// @notice Mapping to track public mints per wallet
    mapping(address => uint256) public publicMinted;
    
    // =============================================================
    //                            EVENTS
    // =============================================================
    
    event WhitelistMintToggled(bool active);
    event PublicMintToggled(bool active);
    event MerkleRootUpdated(bytes32 newRoot);
    event BaseURIUpdated(string newBaseURI);
    event ContractURIUpdated(string newContractURI);
    event Revealed(string newBaseURI);
    event RoyaltyUpdated(address recipient, uint96 fee);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI_,
        string memory unrevealedURI,
        address royaltyRecipient
    ) ERC721A(name, symbol) {
        _baseTokenURI = baseURI;
        _contractURI = contractURI_;
        _unrevealedURI = unrevealedURI;
        _royaltyRecipient = royaltyRecipient;
    }
    
    // =============================================================
    //                          MODIFIERS
    // =============================================================
    
    modifier mintCompliance(uint256 quantity) {
        require(tx.origin == msg.sender, "No contracts allowed");
        require(quantity > 0, "Quantity must be greater than 0");
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        _;
    }
    
    modifier whitelistActive() {
        require(whitelistMintActive, "Whitelist mint not active");
        _;
    }
    
    modifier publicActive() {
        require(publicMintActive, "Public mint not active");
        _;
    }
    
    // =============================================================
    //                         MINTING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Mint tokens during whitelist phase
     * @param quantity Number of tokens to mint
     * @param merkleProof Merkle proof for whitelist verification
     */
    function whitelistMint(uint256 quantity, bytes32[] calldata merkleProof)
        external
        payable
        nonReentrant
        whitelistActive
        mintCompliance(quantity)
    {
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        require(
            whitelistMinted[msg.sender] + quantity <= MAX_PER_WALLET_WHITELIST,
            "Exceeds whitelist limit"
        );
        
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid merkle proof"
        );
        
        whitelistMinted[msg.sender] += quantity;
        _mint(msg.sender, quantity);
    }
    
    /**
     * @notice Mint tokens during public phase
     * @param quantity Number of tokens to mint
     */
    function publicMint(uint256 quantity)
        external
        payable
        nonReentrant
        publicActive
        mintCompliance(quantity)
    {
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");
        require(quantity <= MAX_PER_TX, "Exceeds per transaction limit");
        require(
            publicMinted[msg.sender] + quantity <= MAX_PER_WALLET_PUBLIC,
            "Exceeds wallet limit"
        );
        
        publicMinted[msg.sender] += quantity;
        _mint(msg.sender, quantity);
    }
    
    /**
     * @notice Owner mint for team allocation and giveaways
     * @param to Address to mint tokens to
     * @param quantity Number of tokens to mint
     */
    function ownerMint(address to, uint256 quantity)
        external
        onlyOwner
        mintCompliance(quantity)
    {
        _mint(to, quantity);
    }
    
    /**
     * @notice Batch owner mint to multiple addresses
     * @param recipients Array of addresses to mint to
     * @param quantities Array of quantities for each recipient
     */
    function batchOwnerMint(address[] calldata recipients, uint256[] calldata quantities)
        external
        onlyOwner
    {
        require(recipients.length == quantities.length, "Arrays length mismatch");
        
        uint256 totalQuantity = 0;
        for (uint256 i = 0; i < quantities.length; i++) {
            totalQuantity += quantities[i];
        }
        
        require(_totalMinted() + totalQuantity <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (quantities[i] > 0) {
                _mint(recipients[i], quantities[i]);
            }
        }
    }
    
    // =============================================================
    //                         OWNER FUNCTIONS
    // =============================================================
    
    /**
     * @notice Toggle whitelist minting state
     */
    function toggleWhitelistMint() external onlyOwner {
        whitelistMintActive = !whitelistMintActive;
        emit WhitelistMintToggled(whitelistMintActive);
    }
    
    /**
     * @notice Toggle public minting state
     */
    function togglePublicMint() external onlyOwner {
        publicMintActive = !publicMintActive;
        emit PublicMintToggled(publicMintActive);
    }
    
    /**
     * @notice Set merkle root for whitelist
     * @param newMerkleRoot New merkle root hash
     */
    function setMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(newMerkleRoot);
    }
    
    /**
     * @notice Set base URI for token metadata
     * @param newBaseURI New base URI
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @notice Set contract-level metadata URI
     * @param newContractURI New contract URI
     */
    function setContractURI(string calldata newContractURI) external onlyOwner {
        _contractURI = newContractURI;
        emit ContractURIUpdated(newContractURI);
    }
    
    /**
     * @notice Reveal metadata by setting new base URI
     * @param newBaseURI New base URI for revealed metadata
     */
    function reveal(string calldata newBaseURI) external onlyOwner {
        require(!isRevealed, "Already revealed");
        isRevealed = true;
        _baseTokenURI = newBaseURI;
        emit Revealed(newBaseURI);
    }
    
    /**
     * @notice Set royalty information
     * @param recipient Address to receive royalties
     * @param fee Royalty fee in basis points
     */
    function setRoyaltyInfo(address recipient, uint96 fee) external onlyOwner {
        require(fee <= 1000, "Royalty fee too high"); // Max 10%
        _royaltyRecipient = recipient;
        emit RoyaltyUpdated(recipient, fee);
    }
    
    /**
     * @notice Withdraw contract balance
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @notice Emergency withdraw to specific address
     * @param to Address to send funds to
     */
    function emergencyWithdraw(address to) external onlyOwner nonReentrant {
        require(to != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(to).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get number of tokens minted by address
     * @param owner Address to check
     * @return Number of tokens minted
     */
    function numberMinted(address owner) external view returns (uint256) {
        return _numberMinted(owner);
    }
    
    /**
     * @notice Get total number of tokens minted
     * @return Total minted tokens
     */
    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }
    
    /**
     * @notice Check if address is whitelisted
     * @param account Address to check
     * @param merkleProof Merkle proof for verification
     * @return True if whitelisted
     */
    function isWhitelisted(address account, bytes32[] calldata merkleProof)
        external
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
    /**
     * @notice Get contract-level metadata URI
     * @return Contract metadata URI
     */
    function contractURI() external view returns (string memory) {
        return _contractURI;
    }
    
    // =============================================================
    //                         METADATA
    // =============================================================
    
    /**
     * @notice Get token URI
     * @param tokenId Token ID
     * @return Token metadata URI
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        if (!isRevealed) {
            return _unrevealedURI;
        }
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length != 0
            ? string(abi.encodePacked(baseURI, _toString(tokenId), ".json"))
            : "";
    }
    
    /**
     * @notice Get base URI
     * @return Base URI for token metadata
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Starting token ID
     * @return Token ID to start from (1 instead of 0)
     */
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
    
    // =============================================================
    //                         ROYALTIES
    // =============================================================
    
    /**
     * @notice Get royalty information for token
     * @param tokenId Token ID (unused in this implementation)
     * @param salePrice Sale price of token
     * @return receiver Address to receive royalties
     * @return royaltyAmount Amount of royalties
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        receiver = _royaltyRecipient;
        royaltyAmount = (salePrice * ROYALTY_FEE) / 10000;
    }
    
    // =============================================================
    //                         INTERFACE SUPPORT
    // =============================================================
    
    /**
     * @notice Check interface support
     * @param interfaceId Interface identifier
     * @return True if interface is supported
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721A, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}