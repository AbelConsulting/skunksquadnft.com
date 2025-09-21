// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISkunkSquadNFT {
    function publicMint(uint256 quantity) external payable;
}

/**
 * @title TestMaliciousContract
 * @dev Test contract to verify the "no contracts" security feature
 */
contract TestMaliciousContract {
    ISkunkSquadNFT public immutable skunkSquad;
    
    constructor(address _skunkSquad) {
        skunkSquad = ISkunkSquadNFT(_skunkSquad);
    }
    
    function attemptMint() external payable {
        skunkSquad.publicMint{value: msg.value}(1);
    }
}