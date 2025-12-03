# Quick GA4 Setup for SkunkSquad NFT
# This script helps you add your Google Analytics tracking ID

Write-Host ""
Write-Host "🎯 Google Analytics 4 Setup for SkunkSquad" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor DarkGray
Write-Host ""

# Check current status
$analyticsFile = ".\src\js\analytics.js"
$currentContent = Get-Content $analyticsFile -Raw

if ($currentContent -match "GA_MEASUREMENT_ID = '([^']+)'") {
    $currentId = $matches[1]
    Write-Host "Current Measurement ID: " -NoNewline
    if ($currentId -match "G-[A-Z0-9]{10,}") {
        Write-Host $currentId -ForegroundColor Green
        Write-Host "✅ Valid GA4 ID detected!" -ForegroundColor Green
    } else {
        Write-Host $currentId -ForegroundColor Yellow
        Write-Host "⚠️  This is a placeholder - you need to add your real ID" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Could not find GA_MEASUREMENT_ID in analytics.js" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📋 How to get your GA4 Measurement ID:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Visit: " -NoNewline
Write-Host "https://analytics.google.com/" -ForegroundColor Blue
Write-Host "2. Click 'Admin' (gear icon at bottom left)"
Write-Host "3. Under 'Property', click 'Data Streams'"
Write-Host "4. Click your web stream (or create one)"
Write-Host "5. Copy your Measurement ID (format: G-XXXXXXXXXX)"
Write-Host ""

# Prompt for new ID
Write-Host "Enter your GA4 Measurement ID (or press Enter to skip): " -ForegroundColor Yellow -NoNewline
$newId = Read-Host

if ($newId -eq "") {
    Write-Host ""
    Write-Host "⏭️  Skipped. You can update it later in:" -ForegroundColor Yellow
    Write-Host "   $analyticsFile" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 For detailed instructions, see: GA4_SETUP_GUIDE.md" -ForegroundColor Cyan
    exit
}

# Validate format
if ($newId -notmatch "^G-[A-Z0-9]{10,}$") {
    Write-Host ""
    Write-Host "❌ Invalid format! GA4 IDs should look like: G-ABC1234567" -ForegroundColor Red
    Write-Host "   You entered: $newId" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please try again with a valid GA4 Measurement ID." -ForegroundColor Yellow
    exit
}

# Update the file
Write-Host ""
Write-Host "Updating analytics.js..." -ForegroundColor Cyan

try {
    $updatedContent = $currentContent -replace "GA_MEASUREMENT_ID = '[^']+'", "GA_MEASUREMENT_ID = '$newId'"
    Set-Content -Path $analyticsFile -Value $updatedContent -NoNewline
    
    Write-Host "✅ Successfully updated!" -ForegroundColor Green
    Write-Host ""
    Write-Host "New Measurement ID: " -NoNewline
    Write-Host $newId -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 What's tracking now:" -ForegroundColor Cyan
    Write-Host "  ✅ Page views" -ForegroundColor Green
    Write-Host "  ✅ Wallet connections" -ForegroundColor Green
    Write-Host "  ✅ NFT mints (with quantity & price)" -ForegroundColor Green
    Write-Host "  ✅ Button clicks" -ForegroundColor Green
    Write-Host "  ✅ Transaction success/failure" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Test your analytics:" -ForegroundColor Yellow
    Write-Host "  1. Open test-analytics.html in your browser"
    Write-Host "  2. Click the test event buttons"
    Write-Host "  3. Check GA4 Realtime reports"
    Write-Host ""
    Write-Host "🌐 Deploy to production and start collecting data!" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error updating file: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please manually update the file:" -ForegroundColor Yellow
    Write-Host "  File: $analyticsFile" -ForegroundColor White
    Write-Host "  Line 8: GA_MEASUREMENT_ID = '$newId'" -ForegroundColor White
}

Write-Host ""
