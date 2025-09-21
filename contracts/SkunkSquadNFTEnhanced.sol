// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SkunkSquadNFT - Enhanced Version
 * @dev Advanced ERC721A implementation for Skunk Squad NFT collection
 * Features:
 * - Gas-optimized batch minting with ERC721A + extensions
 * - Multi-phase minting system (Presale, Whitelist, Public)
 * - Configurable pricing per phase
 * - Advanced access controls with role-based permissions
 * - Operator filtering for marketplace restrictions
 * - Enhanced security and emergency controls
 * - Comprehensive events and error handling
 * - Gas optimization and storage packing
 */
contract SkunkSquadNFTEnhanced is 
    ERC721A, 
    ERC721AQueryable, 
    ERC721ABurnable,
    Ownable, 
    ReentrancyGuard, 
    Pausable,
    IERC2981 
{
    using Address for address payable;
    using Strings for uint256;
    
    // =============================================================
    //                            ERRORS
    // =============================================================
    
    error InvalidMintPhase();
    error InvalidQuantity();
    error ExceedsMaxSupply();
    error ExceedsWalletLimit();
    error ExceedsTransactionLimit();
    error InsufficientPayment();
    error InvalidMerkleProof();
    error ContractsNotAllowed();
    error AlreadyRevealed();
    error WithdrawalFailed();
    error ArrayLengthMismatch();
    error InvalidRoyaltyFee();
    error InvalidAddress();
    error NoFundsToWithdraw();
    
    // =============================================================
    //                            ENUMS
    // =============================================================
    
    enum MintPhase {
        CLOSED,      // 0: Minting closed
        PRESALE,     // 1: Early access for VIPs
        WHITELIST,   // 2: Whitelist minting
        PUBLIC       // 3: Public minting
    }
    
    // =============================================================
    //                            STRUCTS
    // =============================================================
    
    struct PhaseConfig {
        uint256 price;           // Price per token in wei
        uint256 maxPerWallet;    // Max tokens per wallet
        uint256 maxPerTx;        // Max tokens per transaction
        bytes32 merkleRoot;      // Merkle root for verification (if applicable)
    }
    
    struct MintStats {
        uint256 presaleMinted;
        uint256 whitelistMinted;
        uint256 publicMinted;
    }
    
    // =============================================================
    //                            STORAGE
    // =============================================================
    
    /// @notice Maximum total supply of tokens
    uint256 public constant MAX_SUPPLY = 10000;
    
    /// @notice Reserved tokens for team/giveaways
    uint256 public constant TEAM_RESERVE = 200;
    
    /// @notice Maximum royalty fee (10%)
    uint256 public constant MAX_ROYALTY_FEE = 1000;
    
    /// @notice Current mint phase
    MintPhase public currentPhase = MintPhase.CLOSED;
    
    /// @notice Configuration for each mint phase
    mapping(MintPhase => PhaseConfig) public phaseConfigs;
    
    /// @notice Tracking mints per wallet per phase
    mapping(address => MintStats) public walletMints;
    
    /// @notice Total minted by team
    uint256 public teamMinted;
    
    /// @notice Metadata configurations
    string private _baseTokenURI;
    string private _contractURI;
    string private _unrevealedURI;
    bool public isRevealed = false;
    
    /// @notice Royalty configuration
    address private _royaltyRecipient;
    uint96 private _royaltyFee;
    
    /// @notice Operator filtering for marketplace restrictions
    mapping(address => bool) public blockedOperators;
    bool public operatorFilteringEnabled = true;
    
    /// @notice Emergency controls
    bool public emergencyPaused = false;
    
    // =============================================================
    //                            EVENTS
    // =============================================================
    
    event MintPhaseChanged(MintPhase indexed oldPhase, MintPhase indexed newPhase);
    event PhaseConfigUpdated(MintPhase indexed phase, uint256 price, uint256 maxPerWallet, uint256 maxPerTx);
    event MerkleRootUpdated(MintPhase indexed phase, bytes32 newRoot);
    event BaseURIUpdated(string newBaseURI);
    event ContractURIUpdated(string newContractURI);
    event Revealed(string newBaseURI);
    event RoyaltyUpdated(address recipient, uint96 fee);
    event OperatorBlocked(address indexed operator, bool blocked);
    event OperatorFilteringToggled(bool enabled);
    event EmergencyPauseToggled(bool paused);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    // =============================================================
    //                         CONSTRUCTOR
    // =============================================================
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI_,
        string memory unrevealedURI,
        address royaltyRecipient,
        uint96 royaltyFee
    ) ERC721A(name, symbol) {
        _baseTokenURI = baseURI;
        _contractURI = contractURI_;
        _unrevealedURI = unrevealedURI;
        _setRoyaltyInfo(royaltyRecipient, royaltyFee);
        
        // Initialize default phase configurations
        _initializePhaseConfigs();
    }
    
    // =============================================================
    //                          MODIFIERS
    // =============================================================
    
    modifier mintCompliance(uint256 quantity) {
        if (tx.origin != msg.sender) revert ContractsNotAllowed();
        if (quantity == 0) revert InvalidQuantity();
        if (_totalMinted() + quantity > MAX_SUPPLY) revert ExceedsMaxSupply();
        if (emergencyPaused || paused()) revert InvalidMintPhase();
        _;
    }
    
    modifier validPhase(MintPhase phase) {
        if (currentPhase != phase) revert InvalidMintPhase();
        _;
    }
    
    modifier validAddress(address addr) {
        if (addr == address(0)) revert InvalidAddress();
        _;
    }
    
    // =============================================================
    //                         INITIALIZATION
    // =============================================================
    
    function _initializePhaseConfigs() private {
        // Presale: Higher price, lower limits
        phaseConfigs[MintPhase.PRESALE] = PhaseConfig({
            price: 0.04 ether,
            maxPerWallet: 2,
            maxPerTx: 2,
            merkleRoot: bytes32(0)
        });
        
        // Whitelist: Standard price, moderate limits
        phaseConfigs[MintPhase.WHITELIST] = PhaseConfig({
            price: 0.05 ether,
            maxPerWallet: 3,
            maxPerTx: 3,
            merkleRoot: bytes32(0)
        });
        
        // Public: Standard price, higher limits
        phaseConfigs[MintPhase.PUBLIC] = PhaseConfig({
            price: 0.05 ether,
            maxPerWallet: 10,
            maxPerTx: 5,
            merkleRoot: bytes32(0)
        });
    }
    
    // =============================================================
    //                         MINTING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Mint tokens during presale phase
     * @param quantity Number of tokens to mint
     * @param merkleProof Merkle proof for presale verification
     */
    function presaleMint(uint256 quantity, bytes32[] calldata merkleProof)
        external
        payable
        nonReentrant
        validPhase(MintPhase.PRESALE)
        mintCompliance(quantity)
    {
        PhaseConfig memory config = phaseConfigs[MintPhase.PRESALE];
        MintStats storage stats = walletMints[msg.sender];
        
        if (msg.value < config.price * quantity) revert InsufficientPayment();
        if (quantity > config.maxPerTx) revert ExceedsTransactionLimit();
        if (stats.presaleMinted + quantity > config.maxPerWallet) revert ExceedsWalletLimit();
        
        // Verify presale eligibility
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, config.merkleRoot, leaf)) {
            revert InvalidMerkleProof();
        }
        
        stats.presaleMinted += quantity;
        _mint(msg.sender, quantity);
    }
    
    /**
     * @notice Mint tokens during whitelist phase
     * @param quantity Number of tokens to mint
     * @param merkleProof Merkle proof for whitelist verification
     */
    function whitelistMint(uint256 quantity, bytes32[] calldata merkleProof)
        external
        payable
        nonReentrant
        validPhase(MintPhase.WHITELIST)
        mintCompliance(quantity)
    {
        PhaseConfig memory config = phaseConfigs[MintPhase.WHITELIST];
        MintStats storage stats = walletMints[msg.sender];
        
        if (msg.value < config.price * quantity) revert InsufficientPayment();
        if (quantity > config.maxPerTx) revert ExceedsTransactionLimit();
        if (stats.whitelistMinted + quantity > config.maxPerWallet) revert ExceedsWalletLimit();
        
        // Verify whitelist eligibility
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (!MerkleProof.verify(merkleProof, config.merkleRoot, leaf)) {
            revert InvalidMerkleProof();
        }
        
        stats.whitelistMinted += quantity;
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
        validPhase(MintPhase.PUBLIC)
        mintCompliance(quantity)
    {
        PhaseConfig memory config = phaseConfigs[MintPhase.PUBLIC];
        MintStats storage stats = walletMints[msg.sender];
        
        if (msg.value < config.price * quantity) revert InsufficientPayment();
        if (quantity > config.maxPerTx) revert ExceedsTransactionLimit();
        if (stats.publicMinted + quantity > config.maxPerWallet) revert ExceedsWalletLimit();
        
        stats.publicMinted += quantity;
        _mint(msg.sender, quantity);
    }
    
    /**
     * @notice Owner mint for team allocation and giveaways
     * @param to Address to mint tokens to
     * @param quantity Number of tokens to mint
     */
    function teamMint(address to, uint256 quantity)
        external
        onlyOwner
        validAddress(to)
        mintCompliance(quantity)
    {
        if (teamMinted + quantity > TEAM_RESERVE) revert ExceedsMaxSupply();
        
        teamMinted += quantity;
        _mint(to, quantity);
    }
    
    /**
     * @notice Batch team mint to multiple addresses
     * @param recipients Array of addresses to mint to
     * @param quantities Array of quantities for each recipient
     */
    function batchTeamMint(address[] calldata recipients, uint256[] calldata quantities)
        external
        onlyOwner
    {
        if (recipients.length != quantities.length) revert ArrayLengthMismatch();
        
        uint256 totalQuantity = 0;
        for (uint256 i = 0; i < quantities.length; i++) {
            totalQuantity += quantities[i];
        }
        
        if (teamMinted + totalQuantity > TEAM_RESERVE) revert ExceedsMaxSupply();
        if (_totalMinted() + totalQuantity > MAX_SUPPLY) revert ExceedsMaxSupply();
        
        teamMinted += totalQuantity;
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (quantities[i] > 0) {
                _mint(recipients[i], quantities[i]);
            }
        }
    }
    
    // =============================================================
    //                         ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @notice Set the current mint phase
     * @param newPhase New mint phase
     */
    function setMintPhase(MintPhase newPhase) external onlyOwner {
        MintPhase oldPhase = currentPhase;
        currentPhase = newPhase;
        emit MintPhaseChanged(oldPhase, newPhase);
    }
    
    /**
     * @notice Configure a mint phase
     * @param phase Phase to configure
     * @param price Price per token
     * @param maxPerWallet Max tokens per wallet
     * @param maxPerTx Max tokens per transaction
     */
    function setPhaseConfig(
        MintPhase phase,
        uint256 price,
        uint256 maxPerWallet,
        uint256 maxPerTx
    ) external onlyOwner {
        phaseConfigs[phase] = PhaseConfig({
            price: price,
            maxPerWallet: maxPerWallet,
            maxPerTx: maxPerTx,
            merkleRoot: phaseConfigs[phase].merkleRoot // Preserve existing merkle root
        });
        
        emit PhaseConfigUpdated(phase, price, maxPerWallet, maxPerTx);
    }
    
    /**
     * @notice Set merkle root for a specific phase
     * @param phase Phase to update
     * @param merkleRoot New merkle root
     */
    function setMerkleRoot(MintPhase phase, bytes32 merkleRoot) external onlyOwner {
        phaseConfigs[phase].merkleRoot = merkleRoot;
        emit MerkleRootUpdated(phase, merkleRoot);
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
        if (isRevealed) revert AlreadyRevealed();
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
        _setRoyaltyInfo(recipient, fee);
    }
    
    /**
     * @notice Block/unblock operators for marketplace filtering
     * @param operator Operator address
     * @param blocked Whether to block the operator
     */
    function setOperatorBlocked(address operator, bool blocked) external onlyOwner {
        blockedOperators[operator] = blocked;
        emit OperatorBlocked(operator, blocked);
    }
    
    /**
     * @notice Toggle operator filtering
     * @param enabled Whether operator filtering is enabled
     */
    function setOperatorFilteringEnabled(bool enabled) external onlyOwner {
        operatorFilteringEnabled = enabled;
        emit OperatorFilteringToggled(enabled);
    }
    
    /**
     * @notice Emergency pause toggle
     */
    function toggleEmergencyPause() external onlyOwner {
        emergencyPaused = !emergencyPaused;
        emit EmergencyPauseToggled(emergencyPaused);
    }
    
    /**
     * @notice Pause/unpause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // =============================================================
    //                         WITHDRAWAL
    // =============================================================
    
    /**
     * @notice Withdraw contract balance to multiple recipients
     * @param recipients Array of recipient addresses
     * @param percentages Array of percentages (in basis points, must sum to 10000)
     */
    function withdrawSplit(
        address[] calldata recipients,
        uint256[] calldata percentages
    ) external onlyOwner nonReentrant {
        if (recipients.length != percentages.length) revert ArrayLengthMismatch();
        
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            totalPercentage += percentages[i];
        }
        require(totalPercentage == 10000, "Percentages must sum to 100%");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 amount = (balance * percentages[i]) / 10000;
            payable(recipients[i]).sendValue(amount);
            emit FundsWithdrawn(recipients[i], amount);
        }
    }
    
    /**
     * @notice Simple withdraw to owner
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFundsToWithdraw();
        
        payable(owner()).sendValue(balance);
        emit FundsWithdrawn(owner(), balance);
    }
    
    // =============================================================
    //                         VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @notice Get mint statistics for an address
     * @param account Address to check
     * @return stats Mint statistics
     */
    function getMintStats(address account) external view returns (MintStats memory stats) {
        return walletMints[account];
    }
    
    /**
     * @notice Get remaining mints for an address in current phase
     * @param account Address to check
     * @return remaining Remaining mints available
     */
    function getRemainingMints(address account) external view returns (uint256 remaining) {
        PhaseConfig memory config = phaseConfigs[currentPhase];
        MintStats memory stats = walletMints[account];
        
        uint256 minted = 0;
        if (currentPhase == MintPhase.PRESALE) {
            minted = stats.presaleMinted;
        } else if (currentPhase == MintPhase.WHITELIST) {
            minted = stats.whitelistMinted;
        } else if (currentPhase == MintPhase.PUBLIC) {
            minted = stats.publicMinted;
        }
        
        return minted >= config.maxPerWallet ? 0 : config.maxPerWallet - minted;
    }
    
    /**
     * @notice Check if address is eligible for a specific phase
     * @param account Address to check
     * @param phase Phase to check
     * @param merkleProof Merkle proof (if required)
     * @return eligible Whether address is eligible
     */
    function isEligible(
        address account,
        MintPhase phase,
        bytes32[] calldata merkleProof
    ) external view returns (bool eligible) {
        if (phase == MintPhase.PUBLIC) {
            return true;
        }
        
        PhaseConfig memory config = phaseConfigs[phase];
        if (config.merkleRoot == bytes32(0)) {
            return true;
        }
        
        bytes32 leaf = keccak256(abi.encodePacked(account));
        return MerkleProof.verify(merkleProof, config.merkleRoot, leaf);
    }
    
    /**
     * @notice Get total supply remaining
     * @return remaining Tokens remaining to mint
     */
    function getRemainingSupply() external view returns (uint256 remaining) {
        return MAX_SUPPLY - _totalMinted();
    }
    
    /**
     * @notice Get contract-level metadata URI
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
    function tokenURI(uint256 tokenId) 
        public 
        view 
        virtual 
        override(ERC721A, IERC721A) 
        returns (string memory) 
    {
        if (!_exists(tokenId)) revert URIQueryForNonexistentToken();
        
        if (!isRevealed) {
            return _unrevealedURI;
        }
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length != 0
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }
    
    /**
     * @notice Get base URI
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @notice Starting token ID (1 instead of 0)
     */
    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }
    
    // =============================================================
    //                         ROYALTIES
    // =============================================================
    
    /**
     * @notice Set royalty information internal function
     * @param recipient Address to receive royalties
     * @param fee Royalty fee in basis points
     */
    function _setRoyaltyInfo(address recipient, uint96 fee) internal {
        if (fee > MAX_ROYALTY_FEE) revert InvalidRoyaltyFee();
        if (recipient == address(0)) revert InvalidAddress();
        
        _royaltyRecipient = recipient;
        _royaltyFee = fee;
        emit RoyaltyUpdated(recipient, fee);
    }
    
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
        royaltyAmount = (salePrice * _royaltyFee) / 10000;
    }
    
    // =============================================================
    //                         OPERATOR FILTERING
    // =============================================================
    
    /**
     * @notice Override approve to implement operator filtering
     */
    function approve(address operator, uint256 tokenId) 
        public 
        payable 
        override(ERC721A, IERC721A) 
    {
        if (operatorFilteringEnabled && blockedOperators[operator]) {
            revert("Operator blocked");
        }
        super.approve(operator, tokenId);
    }
    
    /**
     * @notice Override setApprovalForAll to implement operator filtering
     */
    function setApprovalForAll(address operator, bool approved) 
        public 
        override(ERC721A, IERC721A) 
    {
        if (operatorFilteringEnabled && approved && blockedOperators[operator]) {
            revert("Operator blocked");
        }
        super.setApprovalForAll(operator, approved);
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
        override(ERC721A, IERC721A, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}