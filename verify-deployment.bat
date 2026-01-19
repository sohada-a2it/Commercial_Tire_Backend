@echo off
echo.
echo ========================================
echo   DEPLOYMENT VERIFICATION CHECKLIST
echo ========================================
echo.

echo Checking build setup...
echo.

REM Check if out folder exists
if exist "out" (
    echo [PASS] out folder exists
) else (
    echo [FAIL] out folder missing - Run: npm run build
    goto :end
)

REM Check if index.html exists
if exist "out\index.html" (
    echo [PASS] index.html found
) else (
    echo [FAIL] index.html missing
    goto :end
)

REM Check if WebP images exist
if exist "public\assets\banner-bg.webp" (
    echo [PASS] WebP images optimized
) else (
    echo [WARN] WebP images missing - Run: npm run optimize-images
)

REM Check if 404.html exists
if exist "out\404.html" (
    echo [PASS] 404.html found
) else (
    echo [WARN] 404.html missing
)

echo.
echo ========================================
echo   DEPLOYMENT READY CHECKLIST
echo ========================================
echo.
echo [ ] No errors in console during build
echo [ ] out folder contains index.html
echo [ ] Images are optimized to WebP
echo [ ] Tested locally with: npm start
echo [ ] Ready to upload out/ folder
echo.
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Upload contents of 'out' folder to your domain
echo 2. Test site in incognito mode
echo 3. Check browser console for errors
echo 4. Run Lighthouse test (target 90+)
echo.
echo ========================================
echo.

:end
pause
