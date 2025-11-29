# Script to commit and push changes
$repoPath = "D:\Đồ án quản lý dự án\DevOpsDT"
Set-Location $repoPath

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..."
    git init
}

# Check remote
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "Adding remote origin..."
    git remote add origin https://github.com/vanduc1012/DevOpsDT.git
} else {
    Write-Host "Remote already configured: $remote"
}

# Add all changes
Write-Host "Adding files..."
git add .

# Commit with message
Write-Host "Committing changes..."
git commit -m "update"

# Push to main branch
Write-Host "Pushing to GitHub..."
git push -u origin main

Write-Host "Done!"

