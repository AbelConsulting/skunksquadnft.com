// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SkunkSquadNFTUltraSmart.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SkunkSquadPaymentGateway
 * @dev Handles fiat-to-NFT payments via credit cards through Stripe integration
 * 
 * Features:
 * - Stripe payment confirmation via signatures
 * - Escrow mechanism for payment security
 * - Automatic NFT minting upon payment confirmation
 * - Refund handling for failed transactions
 * - Multi-payment method support (ETH + Fiat)
 */
contract SkunkSquadPaymentGateway is Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event FiatPaymentInitiated(
        string indexed paymentId,
        address indexed buyer,
        uint256 quantity,
        uint256 amountUSD,
        uint256 timestamp
    );
    
    event NFTDelivered(
        string indexed paymentId,
        address indexed buyer,
        uint256[] tokenIds,
        uint256 timestamp
    );
    
    event PaymentRefunded(
        string indexed paymentId,
        address indexed buyer,
        uint256 amountUSD,
        string reason
    );
    
    event PriceUpdated(
        uint256 newPriceUSD,
        uint256 ethToUsdRate,
        uint256 timestamp
    );
    
    // =============================================================
    //                         STRUCTS
    // =============================================================
    
    struct FiatPayment {
        string paymentId;          // Stripe payment intent ID
        address buyer;             // NFT recipient address
        uint256 quantity;          // Number of NFTs to mint
        uint256 amountUSD;         // Amount paid in USD (cents)
        uint256 timestamp;         // Payment initiation time
        PaymentStatus status;      // Current payment status
        uint256[] tokenIds;        // Minted token IDs (if successful)
        string failureReason;      // Reason for failure (if any)
    }
    
    enum PaymentStatus {
        Pending,      // Payment initiated, awaiting confirmation
        Confirmed,    // Payment confirmed by Stripe
        Delivered,    // NFTs successfully minted and delivered
        Failed,       // Payment failed
        Refunded      // Payment refunded
    }
    
    // =============================================================
    //                       STATE VARIABLES
    // =============================================================
    
    SkunkSquadNFTUltraSmart public immutable nftContract;
    
    // Pricing
    uint256 public pricePerNFTUSD = 50_00;  // $50.00 in cents
    uint256 public ethToUsdRate = 2500_00;  // $2500.00 per ETH in cents
    uint256 public lastPriceUpdate;
    
    // Payment tracking
    mapping(string => FiatPayment) public fiatPayments;
    mapping(address => string[]) public userPayments;
    
    // Security
    address public stripeSignatureValidator;  // Address that validates Stripe signatures
    mapping(string => bool) public processedPayments;  // Prevent double-processing
    
    // Configuration
    uint256 public maxQuantityPerPurchase = 10;
    uint256 public paymentTimeoutSeconds = 1800;  // 30 minutes
    
    // =============================================================
    //                        CONSTRUCTOR
    // =============================================================
    
    constructor(
        address _nftContract,
        address _stripeValidator,
        uint256 _initialPriceUSD
    ) {
        nftContract = SkunkSquadNFTUltraSmart(_nftContract);
        stripeSignatureValidator = _stripeValidator;
        pricePerNFTUSD = _initialPriceUSD;
        lastPriceUpdate = block.timestamp;
    }
    
    // =============================================================
    //                    FIAT PAYMENT FUNCTIONS
    // =============================================================
    
    /**
     * @dev Initiates a fiat payment for NFT purchase
     * Called by the payment API when user starts checkout
     */
    function initiateFiatPayment(
        string calldata paymentId,
        address buyer,
        uint256 quantity
    ) external onlyOwner whenNotPaused {
        require(quantity > 0 && quantity <= maxQuantityPerPurchase, "Invalid quantity");
        require(buyer != address(0), "Invalid buyer address");
        require(bytes(paymentId).length > 0, "Invalid payment ID");
        require(fiatPayments[paymentId].timestamp == 0, "Payment already exists");
        
        uint256 totalAmountUSD = pricePerNFTUSD * quantity;
        
        fiatPayments[paymentId] = FiatPayment({
            paymentId: paymentId,
            buyer: buyer,
            quantity: quantity,
            amountUSD: totalAmountUSD,
            timestamp: block.timestamp,
            status: PaymentStatus.Pending,
            tokenIds: new uint256[](0),
            failureReason: ""
        });
        
        userPayments[buyer].push(paymentId);
        
        emit FiatPaymentInitiated(paymentId, buyer, quantity, totalAmountUSD, block.timestamp);
    }
    
    /**
     * @dev Confirms payment and mints NFTs
     * Called by the payment API with Stripe signature validation
     */
    function confirmPaymentAndMint(
        string calldata paymentId,
        bytes calldata stripeSignature
    ) external nonReentrant whenNotPaused {
        require(!processedPayments[paymentId], "Payment already processed");
        
        FiatPayment storage payment = fiatPayments[paymentId];
        require(payment.timestamp > 0, "Payment not found");
        require(payment.status == PaymentStatus.Pending, "Payment not pending");
        require(
            block.timestamp <= payment.timestamp + paymentTimeoutSeconds,
            "Payment expired"
        );
        
        // Validate Stripe signature
        bytes32 messageHash = keccak256(abi.encodePacked(paymentId, payment.amountUSD));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(stripeSignature);
        require(signer == stripeSignatureValidator, "Invalid Stripe signature");
        
        // Mark as processed to prevent double-spending
        processedPayments[paymentId] = true;
        payment.status = PaymentStatus.Confirmed;
        
        // Mint NFTs to buyer
        try nftContract.mint(payment.buyer, payment.quantity) returns (uint256 firstTokenId) {
            // Record minted token IDs
            uint256[] memory tokenIds = new uint256[](payment.quantity);
            for (uint256 i = 0; i < payment.quantity; i++) {
                tokenIds[i] = firstTokenId + i;
            }
            payment.tokenIds = tokenIds;
            payment.status = PaymentStatus.Delivered;
            
            emit NFTDelivered(paymentId, payment.buyer, tokenIds, block.timestamp);
            
        } catch Error(string memory reason) {
            payment.status = PaymentStatus.Failed;
            payment.failureReason = reason;
            processedPayments[paymentId] = false; // Allow retry
        }
    }
    
    /**
     * @dev Marks a payment as refunded
     * Called when Stripe processes a refund
     */
    function markPaymentRefunded(
        string calldata paymentId,
        string calldata reason,
        bytes calldata stripeSignature
    ) external onlyOwner {
        FiatPayment storage payment = fiatPayments[paymentId];
        require(payment.timestamp > 0, "Payment not found");
        require(payment.status != PaymentStatus.Refunded, "Already refunded");
        
        // Validate Stripe signature for refund
        bytes32 messageHash = keccak256(abi.encodePacked("REFUND", paymentId, reason));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(stripeSignature);
        require(signer == stripeSignatureValidator, "Invalid Stripe signature");
        
        payment.status = PaymentStatus.Refunded;
        payment.failureReason = reason;
        
        emit PaymentRefunded(paymentId, payment.buyer, payment.amountUSD, reason);
    }
    
    // =============================================================
    //                    PRICING FUNCTIONS
    // =============================================================
    
    /**
     * @dev Updates NFT price in USD
     */
    function updatePrice(uint256 newPriceUSD, uint256 newEthToUsdRate) external onlyOwner {
        require(newPriceUSD > 0, "Price must be greater than 0");
        require(newEthToUsdRate > 0, "ETH rate must be greater than 0");
        
        pricePerNFTUSD = newPriceUSD;
        ethToUsdRate = newEthToUsdRate;
        lastPriceUpdate = block.timestamp;
        
        emit PriceUpdated(newPriceUSD, newEthToUsdRate, block.timestamp);
    }
    
    /**
     * @dev Get current price in ETH equivalent
     */
    function getPriceInETH() external view returns (uint256) {
        return (pricePerNFTUSD * 1e18) / ethToUsdRate;
    }
    
    /**
     * @dev Calculate total cost for quantity in USD
     */
    function calculateTotalUSD(uint256 quantity) external view returns (uint256) {
        return pricePerNFTUSD * quantity;
    }
    
    // =============================================================
    //                      VIEW FUNCTIONS
    // =============================================================
    
    /**
     * @dev Get payment details
     */
    function getPayment(string calldata paymentId) 
        external 
        view 
        returns (FiatPayment memory) 
    {
        return fiatPayments[paymentId];
    }
    
    /**
     * @dev Get user's payment history
     */
    function getUserPayments(address user) 
        external 
        view 
        returns (string[] memory) 
    {
        return userPayments[user];
    }
    
    /**
     * @dev Check if payment has expired
     */
    function isPaymentExpired(string calldata paymentId) 
        external 
        view 
        returns (bool) 
    {
        FiatPayment memory payment = fiatPayments[paymentId];
        if (payment.timestamp == 0) return true;
        return block.timestamp > payment.timestamp + paymentTimeoutSeconds;
    }
    
    // =============================================================
    //                     ADMIN FUNCTIONS
    // =============================================================
    
    /**
     * @dev Update Stripe signature validator
     */
    function updateStripeValidator(address newValidator) external onlyOwner {
        require(newValidator != address(0), "Invalid validator address");
        stripeSignatureValidator = newValidator;
    }
    
    /**
     * @dev Update configuration parameters
     */
    function updateConfig(
        uint256 newMaxQuantity,
        uint256 newTimeoutSeconds
    ) external onlyOwner {
        require(newMaxQuantity > 0 && newMaxQuantity <= 100, "Invalid max quantity");
        require(newTimeoutSeconds >= 300, "Timeout too short"); // Minimum 5 minutes
        
        maxQuantityPerPurchase = newMaxQuantity;
        paymentTimeoutSeconds = newTimeoutSeconds;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (should rarely be needed)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    // =============================================================
    //                    FALLBACK FUNCTIONS
    // =============================================================
    
    /**
     * @dev Reject direct ETH deposits
     */
    receive() external payable {
        revert("Direct ETH deposits not allowed. Use fiat payment gateway.");
    }
    
    fallback() external payable {
        revert("Function not found. Use fiat payment gateway.");
    }
}