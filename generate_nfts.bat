@echo off
REM Skunk Squad NFT Generator - Easy Launch Script
REM This script uses the locally installed Python 3.11

set PYTHON_PATH=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python311\python.exe

echo.
echo ========================================
echo    SKUNK SQUAD NFT GENERATOR
echo ========================================
echo.

if "%1"=="" (
    echo Usage: generate_nfts.bat [number_of_nfts]
    echo Example: generate_nfts.bat 100
    echo         generate_nfts.bat 10000
    echo.
    echo For 10K generation, run: generate_nfts.bat 10000
    pause
    exit /b 1
)

set SUPPLY=%1
echo Generating %SUPPLY% NFTs...
echo Using Python: %PYTHON_PATH%
echo.

"%PYTHON_PATH%" generate.py --supply %SUPPLY% --seed 42 --verbose --name-prefix "Skunk Squad #" --description "Skunk Squad: community-first, generative rarity, and Skunk Works access."

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Generated %SUPPLY% NFTs
    echo Check the 'output' folder for results
    echo ========================================
) else (
    echo.
    echo ========================================
    echo ERROR during generation!
    echo ========================================
)

echo.
pause