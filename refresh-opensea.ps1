# OpenSea NFT Metadata Refresh Script
# This script forces OpenSea to refresh metadata for all your minted NFTs

# Configuration
$CONTRACT = "0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF"  # Your mainnet contract
$TOTAL_SUPPLY = 3  # Based on Etherscan - 3 NFTs minted (tokens 0, 1, 2)
$DELAY_SECONDS = 3   # Delay between requests to avoid rate limiting

Write-Host "🔄 Starting OpenSea metadata refresh..." -ForegroundColor Cyan
Write-Host "Contract: $CONTRACT" -ForegroundColor Yellow
Write-Host "Total NFTs to refresh: $TOTAL_SUPPLY" -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$failCount = 0

for ($i = 0; $i -lt $TOTAL_SUPPLY; $i++) {
    try {
        $url = "https://api.opensea.io/api/v2/chain/ethereum/contract/$CONTRACT/nfts/$i/refresh"
        
        Write-Host "Refreshing NFT #$i..." -NoNewline
        
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers @{
            "accept" = "application/json"
        } -ErrorAction Stop
        
        Write-Host " ✅ Success" -ForegroundColor Green
        $successCount++
        
    } catch {
        Write-Host " ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    # Wait between requests to avoid rate limiting
    if ($i -lt ($TOTAL_SUPPLY - 1)) {
        Start-Sleep -Seconds $DELAY_SECONDS
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Refresh completed!" -ForegroundColor Green
Write-Host "   Success: $successCount" -ForegroundColor Green
Write-Host "   Failed:  $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "⏳ Note: It may take 5-30 minutes for changes to appear on OpenSea" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
