// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SkunkSquadNFTEnhanced.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title SkunkSquadNFT - Ultra Smart Version
 * @dev Next-generation smart contract with AI-inspired features
 * 
 * New Smart Features:
 * 1. Dynamic Pricing based on demand
 * 2. Advanced Analytics & User Insights
 * 3. Gamification with XP and Achievements
 * 4. Social Features (Referrals, Gifting)
 * 5. Predictive Minting Patterns
 */
contract SkunkSquadNFTUltraSmart is SkunkSquadNFTEnhanced {
    using ECDSA for bytes32;
    
    // =============================================================
    //                     SMART FEATURES STORAGE
    // =============================================================
    
    // Dynamic Pricing
    struct DynamicPricing {
        uint256 basePriceETH;
        uint256 demandMultiplier; // 100 = 1.0x, 150 = 1.5x
        uint256 lastUpdateTime;
        uint256 minPrice;
        uint256 maxPrice;
    }
    
    // User Analytics
    struct UserAnalytics {
        uint256 totalMinted;
        uint256 totalSpent;
        uint256 firstMintTime;
        uint256 lastMintTime;
        uint256 averageTimeBeweenMints;
        uint256 xpPoints;
        uint256[] achievements;
        uint256 referralCount;
        uint256 referralEarnings;
    }
    
    // Predictive Data
    struct MintingPattern {
        uint256 preferredTimeOfDay; // 0-23 hours
        uint256 averageQuantity;
        uint256 priceThreshold;
        bool isWhale; // Mints > 10 NFTs
        uint256 loyaltyScore; // 0-100
    }
    
    // Achievement System
    struct Achievement {
        string name;
        string description;
        uint256 xpReward;
        uint256 requirement;
        bool isActive;
    }
    
    // =============================================================
    //                        STORAGE VARIABLES
    // =============================================================
    
    DynamicPricing public dynamicPricing;
    mapping(address => UserAnalytics) public userAnalytics;
    mapping(address => MintingPattern) public userPatterns;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(uint256 => bool)) public userHasAchievement;
    
    // Social Features
    mapping(address => address) public referredBy;
    mapping(address => address[]) public referrals;
    mapping(address => uint256) public socialXPBonus;
    
    // Advanced Analytics
    uint256 public totalRevenue;
    uint256 public uniqueHolders;
    mapping(uint256 => uint256) public hourlyMints; // hour => count
    mapping(uint256 => uint256) public dailyRevenue; // day => revenue
    
    // Prediction System
    mapping(address => uint256) public predictedNextMint;
    mapping(address => uint256) public predictionAccuracy; // 0-100%
    
    uint256 public constant XP_PER_MINT = 100;
    uint256 public constant REFERRAL_BONUS = 10; // 10% bonus XP
    uint256 public constant ACHIEVEMENT_COUNT = 10;
    
    // =============================================================
    //                           EVENTS
    // =============================================================
    
    event DynamicPriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 demandMultiplier);
    event AchievementUnlocked(address indexed user, uint256 achievementId, string name);
    event XPAwarded(address indexed user, uint256 amount, string reason);
    event ReferralBonus(address indexed referrer, address indexed referred, uint256 bonus);
    event SocialMint(address indexed minter, address indexed referrer, uint256 quantity);
    event PredictionUpdated(address indexed user, uint256 nextMintTime, uint256 confidence);
    event PatternAnalyzed(address indexed user, string behavior);
    
    // =============================================================
    //                        CONSTRUCTOR
    // =============================================================
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        string memory contractURI_,
        string memory unrevealedURI,
        address royaltyRecipient,
        uint96 royaltyFee
    ) SkunkSquadNFTEnhanced(
        name,
        symbol,
        baseURI,
        contractURI_,
        unrevealedURI,
        royaltyRecipient,
        royaltyFee
    ) {
        _initializeSmartFeatures();
    }
    
    function _initializeSmartFeatures() private {
        // Initialize dynamic pricing
        dynamicPricing = DynamicPricing({
            basePriceETH: 0.01 ether,
            demandMultiplier: 100, // 1.0x
            lastUpdateTime: block.timestamp,
            minPrice: 0.005 ether,
            maxPrice: 0.05 ether
        });
        
        // Initialize achievements
        _setupAchievements();
    }
    
    function _setupAchievements() private {
        achievements[1] = Achievement("First Mint", "Mint your first NFT", 50, 1, true);
        achievements[2] = Achievement("Collector", "Own 5 NFTs", 200, 5, true);
        achievements[3] = Achievement("Whale", "Own 20 NFTs", 1000, 20, true);
        achievements[4] = Achievement("Early Bird", "Mint in first 100", 500, 100, true);
        achievements[5] = Achievement("Social Butterfly", "Refer 5 friends", 300, 5, true);
        achievements[6] = Achievement("Speed Demon", "Mint within 1 minute", 150, 1, true);
        achievements[7] = Achievement("Loyalty", "Hold for 30 days", 400, 30, true);
        achievements[8] = Achievement("Big Spender", "Spend 1 ETH total", 800, 1, true);
        achievements[9] = Achievement("Pattern Master", "Consistent minting", 600, 10, true);
        achievements[10] = Achievement("Community Leader", "Refer 20 friends", 1500, 20, true);
    }
    
    // =============================================================
    //                    SMART MINTING FUNCTIONS
    // =============================================================
    
    /**
     * @notice Smart public mint with analytics and XP
     */
    function smartPublicMint(uint256 quantity, address referrer) 
        external 
        payable 
        nonReentrant 
        validPhase(MintPhase.PUBLIC)
        mintCompliance(quantity) 
    {
        uint256 currentPrice = getCurrentSmartPrice();
        if (msg.value < currentPrice * quantity) revert InsufficientPayment();
        
        // Update analytics BEFORE minting
        _updateUserAnalytics(msg.sender, quantity, msg.value);
        
        // Process referral
        if (referrer != address(0) && referrer != msg.sender && referredBy[msg.sender] == address(0)) {
            _processReferral(msg.sender, referrer);
        }
        
        // Mint NFTs
        _mint(msg.sender, quantity);
        
        // Award XP and check achievements
        _awardXP(msg.sender, quantity * XP_PER_MINT, "Minting");
        _checkAndUnlockAchievements(msg.sender);
        
        // Update prediction models
        _updatePredictions(msg.sender);
        
        // Update dynamic pricing
        _updateDynamicPricing(quantity);
        
        // Record global analytics
        _updateGlobalAnalytics(quantity, msg.value);
        
        emit SocialMint(msg.sender, referrer, quantity);
    }
    
    /**
     * @notice Gift NFTs to friends with social XP bonus
     */
    function giftNFT(address recipient, uint256 quantity, string memory message) 
        external 
        payable 
        nonReentrant 
        validPhase(MintPhase.PUBLIC)
        mintCompliance(quantity)
    {
        uint256 currentPrice = getCurrentSmartPrice();
        if (msg.value < currentPrice * quantity) revert InsufficientPayment();
        
        // Mint to recipient
        _mint(recipient, quantity);
        
        // Award XP to both sender and recipient
        _awardXP(msg.sender, quantity * XP_PER_MINT, "Gifting");
        _awardXP(recipient, (quantity * XP_PER_MINT) / 2, "Receiving Gift");
        
        // Update analytics for both users
        _updateUserAnalytics(msg.sender, quantity, msg.value);
        _updateUserAnalytics(recipient, quantity, 0); // Free for recipient
        
        // Social XP bonus for generosity
        socialXPBonus[msg.sender] += quantity * 25;
    }
    
    // =============================================================
    //                    SMART PRICING SYSTEM
    // =============================================================
    
    /**
     * @notice Get current smart price based on demand
     */
    function getCurrentSmartPrice() public view returns (uint256) {
        uint256 basePrice = dynamicPricing.basePriceETH;
        uint256 demandAdjustedPrice = (basePrice * dynamicPricing.demandMultiplier) / 100;
        
        // Time-based adjustments (lower prices during off-peak hours)
        uint256 hour = (block.timestamp / 3600) % 24;
        uint256 timeMultiplier = _getTimeMultiplier(hour);
        
        uint256 finalPrice = (demandAdjustedPrice * timeMultiplier) / 100;
        
        // Ensure price stays within bounds
        if (finalPrice < dynamicPricing.minPrice) return dynamicPricing.minPrice;
        if (finalPrice > dynamicPricing.maxPrice) return dynamicPricing.maxPrice;
        
        return finalPrice;
    }
    
    function _getTimeMultiplier(uint256 hour) internal pure returns (uint256) {
        // Peak hours (6-10 PM UTC): 110% price
        if (hour >= 18 && hour <= 22) return 110;
        // Off-peak hours (2-6 AM UTC): 90% price
        if (hour >= 2 && hour <= 6) return 90;
        // Normal hours: 100% price
        return 100;
    }
    
    function _updateDynamicPricing(uint256 quantity) internal {
        // Increase demand multiplier based on minting activity
        uint256 currentHour = block.timestamp / 3600;
        hourlyMints[currentHour] += quantity;
        
        // If more than 50 mints in current hour, increase price
        if (hourlyMints[currentHour] > 50) {
            uint256 oldMultiplier = dynamicPricing.demandMultiplier;
            dynamicPricing.demandMultiplier = (oldMultiplier * 105) / 100; // 5% increase
            
            // Cap at 200% (2x original price)
            if (dynamicPricing.demandMultiplier > 200) {
                dynamicPricing.demandMultiplier = 200;
            }
            
            emit DynamicPriceUpdated(
                (dynamicPricing.basePriceETH * oldMultiplier) / 100,
                getCurrentSmartPrice(),
                dynamicPricing.demandMultiplier
            );
        }
        
        dynamicPricing.lastUpdateTime = block.timestamp;
    }
    
    // =============================================================
    //                    ANALYTICS & PATTERNS
    // =============================================================
    
    function _updateUserAnalytics(address user, uint256 quantity, uint256 spent) internal {
        UserAnalytics storage analytics = userAnalytics[user];
        
        uint256 currentTime = block.timestamp;
        
        // Update basic stats
        analytics.totalMinted += quantity;
        analytics.totalSpent += spent;
        
        // First mint tracking
        if (analytics.firstMintTime == 0) {
            analytics.firstMintTime = currentTime;
        }
        
        // Calculate average time between mints
        if (analytics.lastMintTime > 0) {
            uint256 timeDiff = currentTime - analytics.lastMintTime;
            analytics.averageTimeBeweenMints = 
                (analytics.averageTimeBeweenMints + timeDiff) / 2;
        }
        
        analytics.lastMintTime = currentTime;
        
        // Update minting patterns
        _updateMintingPattern(user, quantity, currentTime);
    }
    
    function _updateMintingPattern(address user, uint256 quantity, uint256 currentTime) internal {
        MintingPattern storage pattern = userPatterns[user];
        
        // Track preferred time of day
        uint256 hour = (currentTime / 3600) % 24;
        pattern.preferredTimeOfDay = (pattern.preferredTimeOfDay + hour) / 2;
        
        // Track average quantity
        pattern.averageQuantity = (pattern.averageQuantity + quantity) / 2;
        
        // Determine if user is a whale
        if (balanceOf(user) > 10) {
            pattern.isWhale = true;
        }
        
        // Update loyalty score based on consistency
        uint256 consistency = _calculateConsistency(user);
        pattern.loyaltyScore = consistency;
        
        emit PatternAnalyzed(user, pattern.isWhale ? "Whale" : "Regular");
    }
    
    function _calculateConsistency(address user) internal view returns (uint256) {
        UserAnalytics memory analytics = userAnalytics[user];
        
        if (analytics.totalMinted < 2) return 50; // Base score
        
        // Higher score for regular minting patterns
        uint256 timeBetweenMints = analytics.averageTimeBeweenMints;
        
        if (timeBetweenMints > 0 && timeBetweenMints < 7 days) return 90; // Very consistent
        if (timeBetweenMints < 30 days) return 70; // Somewhat consistent
        
        return 30; // Irregular
    }
    
    // =============================================================
    //                    GAMIFICATION SYSTEM
    // =============================================================
    
    function _awardXP(address user, uint256 amount, string memory reason) internal {
        userAnalytics[user].xpPoints += amount;
        
        // Referral bonus
        address referrer = referredBy[user];
        if (referrer != address(0)) {
            uint256 bonus = (amount * REFERRAL_BONUS) / 100;
            userAnalytics[referrer].xpPoints += bonus;
            userAnalytics[referrer].referralEarnings += bonus;
            emit ReferralBonus(referrer, user, bonus);
        }
        
        emit XPAwarded(user, amount, reason);
    }
    
    function _checkAndUnlockAchievements(address user) internal {
        UserAnalytics storage analytics = userAnalytics[user];
        uint256 balance = balanceOf(user);
        
        // Check each achievement
        for (uint256 i = 1; i <= ACHIEVEMENT_COUNT; i++) {
            if (!userHasAchievement[user][i] && achievements[i].isActive) {
                bool unlocked = false;
                
                if (i == 1 && analytics.totalMinted >= 1) unlocked = true; // First Mint
                else if (i == 2 && balance >= 5) unlocked = true; // Collector
                else if (i == 3 && balance >= 20) unlocked = true; // Whale
                else if (i == 4 && _totalMinted() <= 100 && analytics.totalMinted >= 1) unlocked = true; // Early Bird
                else if (i == 5 && analytics.referralCount >= 5) unlocked = true; // Social Butterfly
                else if (i == 8 && analytics.totalSpent >= 1 ether) unlocked = true; // Big Spender
                
                if (unlocked) {
                    userHasAchievement[user][i] = true;
                    analytics.achievements.push(i);
                    analytics.xpPoints += achievements[i].xpReward;
                    
                    emit AchievementUnlocked(user, i, achievements[i].name);
                }
            }
        }
    }
    
    function _processReferral(address user, address referrer) internal {
        referredBy[user] = referrer;
        referrals[referrer].push(user);
        userAnalytics[referrer].referralCount++;
        
        // Bonus XP for successful referral
        _awardXP(referrer, 50, "Referral");
    }
    
    // =============================================================
    //                    PREDICTION SYSTEM
    // =============================================================
    
    function _updatePredictions(address user) internal {
        MintingPattern memory pattern = userPatterns[user];
        
        if (pattern.averageQuantity > 0) {
            // Predict next mint time based on average time between mints
            UserAnalytics memory analytics = userAnalytics[user];
            
            if (analytics.averageTimeBeweenMints > 0) {
                uint256 predictedTime = block.timestamp + analytics.averageTimeBeweenMints;
                predictedNextMint[user] = predictedTime;
                
                // Calculate confidence based on consistency
                uint256 confidence = pattern.loyaltyScore;
                
                emit PredictionUpdated(user, predictedTime, confidence);
            }
        }
    }
    
    function _updateGlobalAnalytics(uint256 quantity, uint256 value) internal {
        totalRevenue += value;
        
        uint256 currentDay = block.timestamp / 1 days;
        dailyRevenue[currentDay] += value;
        
        // Update unique holders count (simplified)
        // In practice, you'd want a more efficient way to track this
    }
    
    // =============================================================
    //                        VIEW FUNCTIONS
    // =============================================================
    
    function getUserAnalytics(address user) external view returns (UserAnalytics memory) {
        return userAnalytics[user];
    }
    
    function getUserPattern(address user) external view returns (MintingPattern memory) {
        return userPatterns[user];
    }
    
    function getPredictedNextMint(address user) external view returns (uint256) {
        return predictedNextMint[user];
    }
    
    function getAchievements(address user) external view returns (uint256[] memory) {
        return userAnalytics[user].achievements;
    }
    
    function getReferrals(address user) external view returns (address[] memory) {
        return referrals[user];
    }
    
    function getHourlyMints(uint256 hour) external view returns (uint256) {
        return hourlyMints[hour];
    }
    
    function getDailyRevenue(uint256 day) external view returns (uint256) {
        return dailyRevenue[day];
    }
    
    // =============================================================
    //                       ADMIN FUNCTIONS
    // =============================================================
    
    function updateDynamicPricing(
        uint256 basePriceETH,
        uint256 minPrice,
        uint256 maxPrice
    ) external onlyOwner {
        require(minPrice <= basePriceETH, "Min price too high");
        require(basePriceETH <= maxPrice, "Max price too low");
        require(minPrice > 0, "Price cannot be zero");
        
        dynamicPricing.basePriceETH = basePriceETH;
        dynamicPricing.minPrice = minPrice;
        dynamicPricing.maxPrice = maxPrice;
    }
    
    function resetDemandMultiplier() external onlyOwner {
        dynamicPricing.demandMultiplier = 100;
    }
    
    function addAchievement(
        uint256 id,
        string memory name,
        string memory description,
        uint256 xpReward,
        uint256 requirement
    ) external onlyOwner {
        achievements[id] = Achievement(name, description, xpReward, requirement, true);
    }
}