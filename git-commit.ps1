# Git commit and push script
$ErrorActionPreference = "Stop"

# Change to DevOpsDT directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..."
    git init
    git branch -M main
}

# Check if remote exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "Adding remote origin..."
    git remote add origin https://github.com/vanduc1012/DevOpsDT.git
} else {
    Write-Host "Remote origin already exists"
}

# Add all files
Write-Host "Adding files..."
git add .

# Commit
Write-Host "Committing changes..."
git commit -m "update"

# Push to remote
Write-Host "Pushing to remote..."
git push -u origin main

Write-Host "Done!"

