@echo off
chcp 65001 >nul
echo ========================================
echo Git Commit and Push Script
echo ========================================
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo [1/4] Checking git status...
git status --short
echo.

echo [2/4] Adding all files...
git add .
echo.

echo [3/4] Committing with message "update"...
git commit -m "update"
if errorlevel 1 (
    echo Warning: No changes to commit or commit failed
    echo.
)

echo [4/4] Checking remote...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding remote origin...
    git remote add origin https://github.com/vanduc1012/DevOpsDT.git
)

echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo.
    echo Error: Push failed. You may need to:
    echo   1. Pull first: git pull origin main --allow-unrelated-histories
    echo   2. Check your GitHub credentials
    echo   3. Make sure you have push access to the repository
) else (
    echo.
    echo ========================================
    echo Success! Changes pushed to GitHub
    echo ========================================
)

echo.
pause

