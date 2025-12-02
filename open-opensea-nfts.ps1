# Quick OpenSea Refresh - Opens all NFT pages
# Click "Refresh Metadata" button on each page that opens

Write-Host "🚀 Opening all your NFTs on OpenSea..." -ForegroundColor Cyan
Write-Host ""

$CONTRACT = "0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF"
$TOTAL_NFTS = 3

Write-Host "✨ Opening $TOTAL_NFTS NFT pages..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 On each page that opens:" -ForegroundColor Green
Write-Host "   1. Click the circular arrow icon (⟳) in top right" -ForegroundColor White
Write-Host "   2. Click 'Refresh metadata'" -ForegroundColor White
Write-Host "   3. Wait for confirmation" -ForegroundColor White
Write-Host ""

Start-Sleep -Seconds 2

for ($i = 0; $i -lt $TOTAL_NFTS; $i++) {
    $url = "https://opensea.io/assets/ethereum/$CONTRACT/$i"
    Write-Host "Opening NFT #$i..." -ForegroundColor Cyan
    Start-Process $url
    Start-Sleep -Seconds 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ All NFT pages opened!" -ForegroundColor Green
Write-Host ""
Write-Host "⚡ NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Click 'Refresh metadata' on each page" -ForegroundColor White
Write-Host "   2. Wait 15-30 minutes" -ForegroundColor White  
Write-Host "   3. Check back and hard refresh (Ctrl+Shift+R)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Also opening your collection page..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "https://opensea.io/assets/ethereum/$CONTRACT"
Write-Host ""
Write-Host "✨ Done! Now click the refresh button on each tab!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
