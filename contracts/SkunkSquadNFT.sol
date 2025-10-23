// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SkunkSquadNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;
    Counters.Counter private _tokenIdCounter;

    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public constant PRICE = 0.01 ether;
    bool public revealed = false;
    string private _unrevealedURI;
    string private _baseTokenURI;
    string private _contractURI;

    // Royalty info (EIP-2981)
    address public royaltyRecipient;
    uint96 public royaltyFee; // in basis points (e.g., 250 = 2.5%, 500 = 5%)

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI_,
        string memory unrevealedURI,
        address royaltyRecipient_,
        uint96 royaltyFee_
    ) ERC721(name, symbol) {
        _baseTokenURI = baseURI;
        _contractURI = contractURI_;
        _unrevealedURI = unrevealedURI;
        royaltyRecipient = royaltyRecipient_;
        royaltyFee = royaltyFee_;
    }

    // Mint a single NFT (payable)
    function mintNFT(uint256 quantity) external payable {
        require(_tokenIdCounter.current() + quantity <= MAX_SUPPLY, "Max supply reached");
        require(msg.value >= PRICE * quantity, "Insufficient ETH sent");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            _safeMint(msg.sender, tokenId);
        }
    }

    // Owner can withdraw contract balance
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Reveal the NFT metadata
    function reveal() external onlyOwner {
        revealed = true;
    }

    // Override tokenURI to handle hidden/revealed states
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        if (!revealed) {
            return _unrevealedURI;
        } else {
            return bytes(_baseTokenURI).length > 0
                ? string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"))
                : "";
        }
    }

    // Set base URI (for revealed metadata)
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    // Set unrevealed metadata URI
    function setUnrevealedURI(string memory uri) external onlyOwner {
        _unrevealedURI = uri;
    }

    // Get contract-level metadata (OpenSea)
    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    // Set contract URI (OpenSea collection metadata)
    function setContractURI(string memory uri) external onlyOwner {
        _contractURI = uri;
    }

    // Update royalty information
    function setRoyaltyInfo(address recipient, uint96 fee) external onlyOwner {
        require(recipient != address(0), "Invalid royalty recipient");
        require(fee <= 10000, "Royalty fee too high"); // Max 100%
        royaltyRecipient = recipient;
        royaltyFee = fee;
    }

    // EIP-2981: Royalty standard
    function royaltyInfo(uint256 tokenId, uint256 salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        require(_exists(tokenId), "Token does not exist");
        royaltyAmount = (salePrice * royaltyFee) / 10_000;
        receiver = royaltyRecipient;
    }

    // Override to support EIP-2981
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override 
        returns (bool) 
    {
        return
            interfaceId == 0x2a55205a || // ERC2981 interface ID
            super.supportsInterface(interfaceId);
    }

    // Get current total minted
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Check if token exists (helper function)
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }
}