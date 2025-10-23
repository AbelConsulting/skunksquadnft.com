// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SkunkSquadNFT2025 is ERC721A, Ownable, ReentrancyGuard {
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
    event OwnerMint(address indexed to, uint256 quantity);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initialBaseURI
    ) ERC721A(_name, _symbol) {
        baseTokenURI = _initialBaseURI;
    }

    function mint(uint256 quantity) external payable nonReentrant {
        uint256 totalMinted = _totalMinted();
        require(mintingEnabled, "Minting is not enabled");
        require(quantity > 0 && quantity <= MAX_PER_TX, "Invalid quantity");
        require(totalMinted + quantity <= MAX_SUPPLY, "Exceeds max supply");
        require(walletMints[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds max per wallet");
        require(msg.value >= mintPrice * quantity, "Insufficient payment");

        unchecked {
            walletMints[msg.sender] += quantity;
        }
        _mint(msg.sender, quantity);
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(quantity <= MAX_PER_TX, "Exceeds max per transaction");
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, quantity);
        emit OwnerMint(to, quantity);
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

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        string memory baseURI = _baseURI();
        require(bytes(baseURI).length > 0, "Base URI not set");
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 1;
    }

    function totalMinted() external view returns (uint256) {
        return _totalMinted();
    }

    function canMint(address account, uint256 quantity) external view returns (bool) {
        uint256 totalMinted = _totalMinted();
        return (
            mintingEnabled &&
            quantity > 0 &&
            quantity <= MAX_PER_TX &&
            totalMinted + quantity <= MAX_SUPPLY &&
            walletMints[account] + quantity <= MAX_PER_WALLET
        );
    }
}