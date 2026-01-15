@echo off
REM Script Testing Suite for Windows
REM Tests all deployment scripts for basic functionality

echo Testing Deployment Scripts
echo ==============================
echo.

set PASSED=0
set FAILED=0

echo Checking script files...
echo.

if exist "scripts\setup-production-db.sh" (
    echo    [OK] setup-production-db.sh exists
    set /a PASSED+=1
) else (
    echo    [FAIL] setup-production-db.sh not found
    set /a FAILED+=1
)

if exist "scripts\deploy-contract.sh" (
    echo    [OK] deploy-contract.sh exists
    set /a PASSED+=1
) else (
    echo    [FAIL] deploy-contract.sh not found
    set /a FAILED+=1
)

if exist "scripts\verify-env.sh" (
    echo    [OK] verify-env.sh exists
    set /a PASSED+=1
) else (
    echo    [FAIL] verify-env.sh not found
    set /a FAILED+=1
)

if exist "scripts\pre-deploy.sh" (
    echo    [OK] pre-deploy.sh exists
    set /a PASSED+=1
) else (
    echo    [FAIL] pre-deploy.sh not found
    set /a FAILED+=1
)

echo.
echo Checking dependencies...
echo.

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] node is available
    set /a PASSED+=1
) else (
    echo    [FAIL] node is not available
    set /a FAILED+=1
)

where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] npm is available
    set /a PASSED+=1
) else (
    echo    [FAIL] npm is not available
    set /a FAILED+=1
)

echo.
echo Testing Prisma setup...
echo.

call npx prisma validate >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Prisma schema is valid
    set /a PASSED+=1
) else (
    echo    [FAIL] Prisma schema validation failed
    set /a FAILED+=1
)

if exist "prisma\schema.prisma" (
    echo    [OK] Prisma schema file exists
    set /a PASSED+=1
) else (
    echo    [FAIL] Prisma schema file not found
    set /a FAILED+=1
)

echo.
echo ==============================
echo Test Summary
echo    Passed: %PASSED%
echo    Failed: %FAILED%
echo.

if %FAILED% EQU 0 (
    echo [OK] All tests passed!
    echo.
    echo Next steps:
    echo    1. Set up test database: set DATABASE_URL=postgresql://...
    echo    2. Test database setup: bash scripts/setup-production-db.sh
    echo    3. Test env verification: bash scripts/verify-env.sh
    exit /b 0
) else (
    echo [FAIL] Some tests failed
    exit /b 1
)
