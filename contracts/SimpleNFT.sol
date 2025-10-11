// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";

contract SimpleNFT is ERC721A {
    string private _baseTokenURI;
    uint256 public constant MAX_SUPPLY = 10000;
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721A(name, symbol) {
        _baseTokenURI = baseURI;
    }
    
    function mint(uint256 quantity) external payable {
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Exceeds max supply");
        _mint(msg.sender, quantity);
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}