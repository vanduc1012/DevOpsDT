[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Continue"

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Check remote
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/vanduc1012/DevOpsDT.git
} else {
    Write-Host "Remote already configured: $remote" -ForegroundColor Green
}

# Add all changes
Write-Host "`nAdding files..." -ForegroundColor Cyan
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes..." -ForegroundColor Cyan
    git commit -m "update"
    
    Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    Write-Host "`nDone! Changes have been pushed to GitHub." -ForegroundColor Green
} else {
    Write-Host "`nNo changes to commit." -ForegroundColor Yellow
}

