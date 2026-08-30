@echo off
cd /d "%~dp0"
set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo ========================================================
echo   DANG DAY MA NGUON LEN GITHUB (FAMILY FINANCE HUB)
echo ========================================================
echo.

echo [1/3] Adding files...
git add .

echo [2/3] Committing changes...
git commit -m "update: Sync code to GitHub" --allow-empty

echo [3/3] Pushing to GitHub...
echo.
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   [SUCCESS] Da day toan bo ma nguon len GitHub thanh cong!
    echo   Xem tai: https://github.com/alangminhquangdg-code/taichinh
    echo ========================================================
) else (
    echo ========================================================
    echo   [ERROR] Co loi xay ra khi day len GitHub.
    echo   Vui long dang nhap tren trinh duyet neu duoc yeu cau.
    echo ========================================================
)
echo.
pause
