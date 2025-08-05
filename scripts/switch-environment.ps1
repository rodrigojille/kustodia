# KUSTODIA ENVIRONMENT SWITCHER
# PowerShell script to safely switch between testnet and mainnet

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("testnet", "mainnet", "status")]
    [string]$Environment
)

$ErrorActionPreference = "Stop"

# Configuration
$PROJECT_ROOT = Split-Path -Parent $PSScriptRoot
$ENV_FILE = Join-Path $PROJECT_ROOT ".env"
$TESTNET_ENV = Join-Path $PROJECT_ROOT ".env.testnet.backup"
$MAINNET_ENV = Join-Path $PROJECT_ROOT ".env.mainnet"
$BACKUP_DIR = Join-Path $PROJECT_ROOT "backups"

# Ensure backup directory exists
if (!(Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
}

function Show-Status {
    Write-Host "🔍 KUSTODIA ENVIRONMENT STATUS" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    if (Test-Path $ENV_FILE) {
        $currentEnv = Get-Content $ENV_FILE | Select-String "BLOCKCHAIN_NETWORK=" | ForEach-Object { $_.ToString().Split("=")[1] }
        if ($currentEnv) {
            $networkEmoji = if ($currentEnv -eq "mainnet") { "🟢" } else { "🟡" }
            Write-Host "$networkEmoji Current Environment: $currentEnv" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Environment not detected in .env file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ No .env file found" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "📁 Available Environment Files:" -ForegroundColor White
    if (Test-Path $TESTNET_ENV) { Write-Host "  ✅ Testnet backup available" -ForegroundColor Green }
    if (Test-Path $MAINNET_ENV) { Write-Host "  ✅ Mainnet config available" -ForegroundColor Green }
    if (!(Test-Path $TESTNET_ENV)) { Write-Host "  ❌ Testnet backup missing" -ForegroundColor Red }
    if (!(Test-Path $MAINNET_ENV)) { Write-Host "  ❌ Mainnet config missing" -ForegroundColor Red }
}

function Backup-CurrentEnv {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = Join-Path $BACKUP_DIR ".env.backup.$timestamp"
    
    if (Test-Path $ENV_FILE) {
        Copy-Item $ENV_FILE $backupFile
        Write-Host "💾 Current .env backed up to: $backupFile" -ForegroundColor Green
    }
}

function Switch-ToTestnet {
    Write-Host "🟡 SWITCHING TO TESTNET ENVIRONMENT" -ForegroundColor Yellow
    Write-Host "====================================" -ForegroundColor Yellow
    
    if (!(Test-Path $TESTNET_ENV)) {
        Write-Host "❌ Testnet environment file not found: $TESTNET_ENV" -ForegroundColor Red
        Write-Host "   Please create the testnet backup file first." -ForegroundColor Red
        exit 1
    }
    
    # Backup current environment
    Backup-CurrentEnv
    
    # Switch to testnet
    Copy-Item $TESTNET_ENV $ENV_FILE
    Write-Host "✅ Switched to TESTNET environment" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🔄 RECOMMENDED NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Restart your backend services" -ForegroundColor White
    Write-Host "2. Restart your frontend application" -ForegroundColor White
    Write-Host "3. Verify testnet connectivity" -ForegroundColor White
    Write-Host "4. Test a small transaction" -ForegroundColor White
}

function Switch-ToMainnet {
    Write-Host "🟢 SWITCHING TO MAINNET ENVIRONMENT" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    
    if (!(Test-Path $MAINNET_ENV)) {
        Write-Host "❌ Mainnet environment file not found: $MAINNET_ENV" -ForegroundColor Red
        Write-Host "   Please create the mainnet config file first." -ForegroundColor Red
        exit 1
    }
    
    # Safety confirmation for mainnet
    Write-Host "⚠️  WARNING: You are switching to MAINNET (PRODUCTION)" -ForegroundColor Red
    Write-Host "   This will use real MXNB tokens and real transactions." -ForegroundColor Red
    $confirmation = Read-Host "   Type 'CONFIRM' to proceed"
    
    if ($confirmation -ne "CONFIRM") {
        Write-Host "❌ Mainnet switch cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    # Backup current environment
    Backup-CurrentEnv
    
    # Switch to mainnet
    Copy-Item $MAINNET_ENV $ENV_FILE
    Write-Host "✅ Switched to MAINNET environment" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🚨 CRITICAL NEXT STEPS:" -ForegroundColor Red
    Write-Host "1. Restart ALL services immediately" -ForegroundColor White
    Write-Host "2. Verify mainnet contract addresses" -ForegroundColor White
    Write-Host "3. Test with SMALL amounts first" -ForegroundColor White
    Write-Host "4. Monitor transactions closely" -ForegroundColor White
    Write-Host "5. Have rollback plan ready" -ForegroundColor White
}

# Main execution
switch ($Environment) {
    "status" { Show-Status }
    "testnet" { Switch-ToTestnet }
    "mainnet" { Switch-ToMainnet }
}

Write-Host ""
Write-Host "🔍 Current Status:" -ForegroundColor Cyan
Show-Status
