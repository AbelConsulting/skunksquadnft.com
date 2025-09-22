#!/usr/bin/env pwsh

<#
.SYNOPSIS
SkunkSquad Webhook Setup Script

.DESCRIPTION
This script helps you set up ngrok for webhook testing and guides you through
the Stripe webhook configuration process.

.EXAMPLE
.\setup-webhook.ps1
#>

# ANSI color codes for PowerShell
$Colors = @{
    Red = "`e[31m"
    Green = "`e[32m"
    Yellow = "`e[33m"
    Blue = "`e[34m"
    Magenta = "`e[35m"
    Cyan = "`e[36m"
    Reset = "`e[0m"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "Reset"
    )
    Write-Host "$($Colors[$Color])$Message$($Colors.Reset)"
}

function Test-NgrokInstalled {
    try {
        $null = Get-Command ngrok -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

function Install-Ngrok {
    Write-ColorOutput "🔧 Installing ngrok..." "Cyan"
    
    # Check if chocolatey is available
    try {
        $null = Get-Command choco -ErrorAction Stop
        Write-ColorOutput "📦 Installing ngrok via Chocolatey..." "Blue"
        choco install ngrok -y
        return $true
    }
    catch {
        Write-ColorOutput "⚠️  Chocolatey not found. Checking for Scoop..." "Yellow"
    }
    
    # Check if scoop is available
    try {
        $null = Get-Command scoop -ErrorAction Stop
        Write-ColorOutput "📦 Installing ngrok via Scoop..." "Blue"
        scoop install ngrok
        return $true
    }
    catch {
        Write-ColorOutput "⚠️  Scoop not found. Manual installation required." "Yellow"
    }
    
    # Manual installation instructions
    Write-ColorOutput "📋 Manual ngrok installation:" "Yellow"
    Write-ColorOutput "   1. Go to: https://ngrok.com/download" "Blue"
    Write-ColorOutput "   2. Download ngrok for Windows" "Blue"
    Write-ColorOutput "   3. Extract ngrok.exe to a folder in your PATH" "Blue"
    Write-ColorOutput "   4. Or place it in this project folder" "Blue"
    Write-ColorOutput "   5. Run this script again" "Blue"
    
    return $false
}

function Start-PaymentServer {
    Write-ColorOutput "🚀 Starting payment server..." "Cyan"
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-ColorOutput "📦 Installing dependencies..." "Yellow"
        npm install
    }
    
    # Start payment server in background
    Write-ColorOutput "💳 Starting payment server on port 3002..." "Green"
    Start-Process -FilePath "npm" -ArgumentList "run", "payment-dev" -NoNewWindow
    
    # Wait a moment for server to start
    Start-Sleep -Seconds 3
}

function Start-NgrokTunnel {
    Write-ColorOutput "🌐 Creating ngrok tunnel..." "Cyan"
    
    # Start ngrok in background and capture output
    $ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", "3002", "--log=stdout" -PassThru -RedirectStandardOutput "ngrok.log" -NoNewWindow
    
    # Wait for ngrok to initialize
    Start-Sleep -Seconds 5
    
    # Try to get the public URL
    try {
        $ngrokApi = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction Stop
        $publicUrl = $ngrokApi.tunnels | Where-Object { $_.public_url -like "https://*" } | Select-Object -First 1 -ExpandProperty public_url
        
        if ($publicUrl) {
            Write-ColorOutput "✅ ngrok tunnel created successfully!" "Green"
            Write-ColorOutput "🔗 Public URL: $publicUrl" "Cyan"
            Write-ColorOutput "📍 Webhook endpoint: $publicUrl/webhooks/stripe" "Cyan"
            return $publicUrl
        }
    }
    catch {
        Write-ColorOutput "⚠️  Could not get ngrok URL from API. Check ngrok.log for details." "Yellow"
    }
    
    return $null
}

function Show-WebhookInstructions {
    param([string]$NgrokUrl)
    
    Write-ColorOutput "`n🔗 STRIPE WEBHOOK SETUP INSTRUCTIONS" "Magenta"
    Write-ColorOutput "===================================" "Magenta"
    
    Write-ColorOutput "`n📋 Step 1: Create Webhook in Stripe Dashboard" "Yellow"
    Write-ColorOutput "   1. Go to: https://dashboard.stripe.com/test/webhooks" "Blue"
    Write-ColorOutput "   2. Click 'Add endpoint'" "Blue"
    Write-ColorOutput "   3. Enter endpoint URL: $NgrokUrl/webhooks/stripe" "Green"
    Write-ColorOutput "   4. Select these events:" "Blue"
    Write-ColorOutput "      ✅ payment_intent.succeeded" "Blue"
    Write-ColorOutput "      ✅ payment_intent.payment_failed" "Blue"
    Write-ColorOutput "      ✅ charge.dispute.created" "Blue"
    Write-ColorOutput "   5. Click 'Add endpoint'" "Blue"
    
    Write-ColorOutput "`n🔑 Step 2: Get Webhook Secret" "Yellow"
    Write-ColorOutput "   1. Click on your new webhook in the list" "Blue"
    Write-ColorOutput "   2. Scroll down to 'Signing secret'" "Blue"
    Write-ColorOutput "   3. Click 'Reveal' and copy the secret (starts with whsec_)" "Blue"
    Write-ColorOutput "   4. Add it to your .env file as STRIPE_WEBHOOK_SECRET" "Blue"
    
    Write-ColorOutput "`n🧪 Step 3: Test Webhook" "Yellow"
    Write-ColorOutput "   1. In Stripe dashboard, click 'Send test webhook'" "Blue"
    Write-ColorOutput "   2. Select 'payment_intent.succeeded'" "Blue"
    Write-ColorOutput "   3. Click 'Send test webhook'" "Blue"
    Write-ColorOutput "   4. Check your payment server logs for confirmation" "Blue"
    
    Write-ColorOutput "`n💡 Your webhook endpoint is ready at:" "Green"
    Write-ColorOutput "   $NgrokUrl/webhooks/stripe" "Cyan"
}

function Main {
    Write-ColorOutput "`n🦨 SkunkSquad Webhook Setup" "Cyan"
    Write-ColorOutput "=========================" "Cyan"
    
    # Check if ngrok is installed
    if (-not (Test-NgrokInstalled)) {
        Write-ColorOutput "❌ ngrok not found. Installing..." "Red"
        if (-not (Install-Ngrok)) {
            Write-ColorOutput "❌ Unable to install ngrok automatically. Please install manually and try again." "Red"
            exit 1
        }
    }
    
    # Verify ngrok is now available
    if (-not (Test-NgrokInstalled)) {
        Write-ColorOutput "❌ ngrok still not available. Please check installation." "Red"
        exit 1
    }
    
    Write-ColorOutput "✅ ngrok is available!" "Green"
    
    # Start payment server
    Start-PaymentServer
    
    # Start ngrok tunnel
    $ngrokUrl = Start-NgrokTunnel
    
    if ($ngrokUrl) {
        Show-WebhookInstructions -NgrokUrl $ngrokUrl
        
        Write-ColorOutput "`n🎯 Next Steps:" "Magenta"
        Write-ColorOutput "   1. Complete webhook setup in Stripe dashboard" "Blue"
        Write-ColorOutput "   2. Add webhook secret to .env file" "Blue"
        Write-ColorOutput "   3. Test webhook delivery" "Blue"
        Write-ColorOutput "   4. Deploy payment gateway contract" "Blue"
        
        Write-ColorOutput "`n⚡ Keep this terminal open to maintain the ngrok tunnel!" "Yellow"
        Write-ColorOutput "📝 Webhook endpoint: $ngrokUrl/webhooks/stripe" "Cyan"
        
        # Keep script running
        Write-ColorOutput "`nPress Ctrl+C to stop ngrok tunnel..." "Yellow"
        try {
            while ($true) {
                Start-Sleep -Seconds 1
            }
        }
        catch {
            Write-ColorOutput "`n🛑 Stopping ngrok tunnel..." "Yellow"
        }
    }
    else {
        Write-ColorOutput "❌ Failed to create ngrok tunnel. Check ngrok.log for errors." "Red"
        exit 1
    }
}

# Run the main function
Main