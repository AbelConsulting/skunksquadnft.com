# Convert PNG images to WebP format for better performance
# Requires: Install ImageMagick or use online converter

$assetsPath = "c:\Users\Jewel\Documents\GitHub\skunksquadnft.com\assets"
$pngFiles = Get-ChildItem -Path $assetsPath -Filter "*.png"

Write-Host "Found $($pngFiles.Count) PNG files to convert" -ForegroundColor Cyan
Write-Host ""

# Check if ImageMagick is installed
try {
    $magickVersion = magick --version
    $hasImageMagick = $true
    Write-Host "✅ ImageMagick detected" -ForegroundColor Green
} catch {
    $hasImageMagick = $false
    Write-Host "⚠️  ImageMagick not found" -ForegroundColor Yellow
}

Write-Host ""

if ($hasImageMagick) {
    # Convert using ImageMagick
    foreach ($file in $pngFiles) {
        $outputFile = Join-Path $assetsPath ($file.BaseName + ".webp")
        Write-Host "Converting: $($file.Name) → $($file.BaseName).webp" -ForegroundColor Cyan
        
        # Convert with 85% quality (good balance of size/quality)
        magick convert $file.FullName -quality 85 $outputFile
        
        # Show size comparison
        $originalSize = [math]::Round($file.Length / 1KB, 2)
        $newSize = [math]::Round((Get-Item $outputFile).Length / 1KB, 2)
        $savings = [math]::Round((($file.Length - (Get-Item $outputFile).Length) / $file.Length) * 100, 1)
        
        Write-Host "  Original: $($originalSize)KB → WebP: $($newSize)KB (Saved $savings%)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "✅ Conversion complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Update HTML files to reference .webp instead of .png"
    Write-Host "2. Test images display correctly"
    Write-Host "3. Delete old .png files if satisfied"
    
} else {
    Write-Host "📦 Install ImageMagick to convert automatically:" -ForegroundColor Yellow
    Write-Host "   choco install imagemagick" -ForegroundColor White
    Write-Host ""
    Write-Host "OR use online conversion:" -ForegroundColor Yellow
    Write-Host "   1. Visit https://cloudconvert.com/png-to-webp" -ForegroundColor White
    Write-Host "   2. Upload files from: $assetsPath" -ForegroundColor White
    Write-Host "   3. Download converted .webp files" -ForegroundColor White
    Write-Host "   4. Place them in the same folder" -ForegroundColor White
    Write-Host ""
    
    # List files for easy reference
    Write-Host "Files to convert:" -ForegroundColor Cyan
    foreach ($file in $pngFiles) {
        $sizeKB = [math]::Round($file.Length / 1KB, 2)
        Write-Host "  - $($file.Name) ($sizeKB KB)" -ForegroundColor White
    }
}
