@echo off
chcp 65001 > nul
echo ========================================================
echo   ĐANG ĐẨY MÃ NGUỒN LÊN GITHUB (FAMILY FINANCE HUB)
echo ========================================================
echo.

"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "update: Dong bo ma nguon ung dung tai chinh" --allow-empty
echo.
echo Đang kết nối và đẩy lên GitHub...
"C:\Program Files\Git\cmd\git.exe" push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   [THÀNH CÔNG] Đã đẩy toàn bộ mã nguồn lên GitHub!
    echo   Xem tại: https://github.com/alangminhquangdg-code/taichinh
    echo ========================================================
) else (
    echo ========================================================
    echo   [LƯU Ý] Nếu đây là lần đầu tiên, vui lòng đăng nhập
    echo   cửa sổ GitHub vừa hiện lên trên màn hình.
    echo ========================================================
)
echo.
pause
