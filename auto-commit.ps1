# Auto commit and push script
# This script will find the DevOpsDT directory and commit changes

$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path -Parent $scriptPath

# Try to change to script directory
try {
    Set-Location $scriptDir
    Write-Host "Working in: $(Get-Location)" -ForegroundColor Green
} catch {
    Write-Host "Error changing directory: $_" -ForegroundColor Red
    exit 1
}

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Check/Add remote
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Adding remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/vanduc1012/DevOpsDT.git
} else {
    Write-Host "Remote: $remote" -ForegroundColor Green
}

# Add all files
Write-Host "`nAdding all files..." -ForegroundColor Cyan
git add .

# Check for changes
$status = git status --porcelain
if ($status) {
    Write-Host "Committing changes with message 'update'..." -ForegroundColor Cyan
    git commit -m "update"
    
    Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
    git push -u origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ Push failed. You may need to pull first or check your credentials." -ForegroundColor Red
    }
} else {
    Write-Host "`nNo changes to commit." -ForegroundColor Yellow
}

