# Skunk Squad NFT Generator - PowerShell Version
# Easy launcher for generating NFTs

param(
    [Parameter(Mandatory=$true, Position=0)]
    [int]$Supply,
    
    [int]$Seed = 42,
    
    [switch]$Verbose
)

$PythonPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311\python.exe"

Write-Host ""
Write-Host "========================================"
Write-Host "    SKUNK SQUAD NFT GENERATOR"
Write-Host "========================================"
Write-Host ""

if (-not (Test-Path $PythonPath)) {
    Write-Host "ERROR: Python not found at $PythonPath" -ForegroundColor Red
    Write-Host "Please ensure Python 3.11 is installed properly." -ForegroundColor Red
    exit 1
}

Write-Host "Generating $Supply NFTs..." -ForegroundColor Green
Write-Host "Using Python: $PythonPath"
Write-Host ""

# Build command arguments
$generatorArgs = @(
    "generate.py",
    "--supply", $Supply,
    "--seed", $Seed,
    "--name-prefix", "Skunk Squad #",
    "--description", "Skunk Squad: community-first, generative rarity, and Skunk Works access."
)

if ($Verbose) {
    $generatorArgs += "--verbose"
}

# Execute the generation
try {
    & $PythonPath $generatorArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================"
        Write-Host "SUCCESS! Generated $Supply NFTs" -ForegroundColor Green
        Write-Host "Check the 'output' folder for results" -ForegroundColor Green
        Write-Host "========================================"
        
        # Show output summary
        $imageCount = (Get-ChildItem "output\images" -Filter "*.png" -ErrorAction SilentlyContinue).Count
        $metadataCount = (Get-ChildItem "output\metadata" -Filter "*.json" -ErrorAction SilentlyContinue).Count
        
        Write-Host ""
        Write-Host "Generated Files:"
        Write-Host "  Images: $imageCount"
        Write-Host "  Metadata: $metadataCount"
        
        if (Test-Path "output\manifest.csv") {
            Write-Host "  Manifest: Available"
        }
    } else {
        Write-Host ""
        Write-Host "========================================"
        Write-Host "ERROR during generation!" -ForegroundColor Red
        Write-Host "Exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "========================================"
        exit $LASTEXITCODE
    }
} catch {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "EXCEPTION during generation!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "========================================"
    exit 1
}