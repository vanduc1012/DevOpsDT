@echo off
chcp 65001 >nul
cd /d "D:\Đồ án quản lý dự án\DevOpsDT"

echo Checking git status...
git status

echo.
echo Adding files...
git add .

echo.
echo Committing changes...
git commit -m "update"

echo.
echo Checking remote...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding remote origin...
    git remote add origin https://github.com/vanduc1012/DevOpsDT.git
)

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done!
pause

