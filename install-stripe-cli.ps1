#!/usr/bin/env pwsh

<#
.SYNOPSIS
Install Stripe CLI for Windows

.DESCRIPTION
Downloads and installs the Stripe CLI for webhook testing and management
#>

# Create directory for Stripe CLI
$stripeDir = "$env:USERPROFILE\.stripe"
if (!(Test-Path $stripeDir)) {
    New-Item -ItemType Directory -Path $stripeDir -Force
}

Write-Host "🔧 Installing Stripe CLI..." -ForegroundColor Cyan

# Download Stripe CLI
$downloadUrl = "https://github.com/stripe/stripe-cli/releases/latest/download/stripe_1.21.8_windows_x86_64.zip"
$zipPath = "$stripeDir\stripe-cli.zip"
$extractPath = "$stripeDir\stripe-cli"

try {
    Write-Host "📥 Downloading Stripe CLI..." -ForegroundColor Blue
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -UseBasicParsing
    
    Write-Host "📦 Extracting..." -ForegroundColor Blue
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
    
    # Add to PATH for current session
    $stripePath = "$extractPath\stripe.exe"
    if (Test-Path $stripePath) {
        Write-Host "✅ Stripe CLI installed successfully!" -ForegroundColor Green
        Write-Host "📍 Location: $stripePath" -ForegroundColor Blue
        
        # Add to current session PATH
        $env:PATH += ";$extractPath"
        
        Write-Host "🔑 Now you can run: stripe login" -ForegroundColor Yellow
        Write-Host "🎯 Then run: stripe listen --forward-to localhost:3002/webhooks/stripe" -ForegroundColor Yellow
        
        # Test installation
        & $stripePath --version
        
    } else {
        Write-Host "❌ Installation failed. Please download manually from:" -ForegroundColor Red
        Write-Host "   https://github.com/stripe/stripe-cli/releases" -ForegroundColor Blue
    }
    
    # Cleanup
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Manual installation:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/stripe/stripe-cli/releases" -ForegroundColor Blue
    Write-Host "   2. Download stripe_windows_x86_64.zip" -ForegroundColor Blue
    Write-Host "   3. Extract and add to PATH" -ForegroundColor Blue
}

Write-Host "`n📋 Next steps after installation:" -ForegroundColor Magenta
Write-Host "   1. stripe login" -ForegroundColor Blue
Write-Host "   2. stripe listen --forward-to localhost:3002/webhooks/stripe" -ForegroundColor Blue
Write-Host "   3. This will replace your localtunnel setup" -ForegroundColor Blue