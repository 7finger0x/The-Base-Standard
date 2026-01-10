@echo off
REM BaseRank Test Runner for Windows
REM Runs all tests across all layers

echo.
echo ====================================
echo BaseRank Protocol - Test Suite Runner
echo ====================================
echo.

set TOTAL=0
set PASSED=0
set FAILED=0

REM 1. Smart Contract Tests
echo [1/4] Testing Smart Contracts (Foundry)
echo -------------------------------------------
cd foundry
call forge test
if %ERRORLEVEL% EQU 0 (
    echo [92m[PASS] Smart Contract Tests[0m
    set /a PASSED+=1
) else (
    echo [91m[FAIL] Smart Contract Tests[0m
    set /a FAILED+=1
)
cd ..
set /a TOTAL+=1
echo.

REM 2. Python Agent Tests
echo [2/4] Testing Python Agent
echo -------------------------------------------
cd apps\agent
if exist requirements-test.txt (
    echo Installing Python test dependencies...
    pip install -q -r requirements-test.txt
)
call pytest -v
if %ERRORLEVEL% EQU 0 (
    echo [92m[PASS] Python Agent Tests[0m
    set /a PASSED+=1
) else (
    echo [91m[FAIL] Python Agent Tests[0m
    set /a FAILED+=1
)
cd ..\..
set /a TOTAL+=1
echo.

REM 3. Indexer Tests
echo [3/4] Testing Indexer
echo -------------------------------------------
cd apps\indexer
call npx vitest run
if %ERRORLEVEL% EQU 0 (
    echo [92m[PASS] Indexer Tests[0m
    set /a PASSED+=1
) else (
    echo [91m[FAIL] Indexer Tests[0m
    set /a FAILED+=1
)
cd ..\..
set /a TOTAL+=1
echo.

REM 4. Frontend Tests
echo [4/4] Testing Frontend
echo -------------------------------------------
call npx vitest run
if %ERRORLEVEL% EQU 0 (
    echo [92m[PASS] Frontend Tests[0m
    set /a PASSED+=1
) else (
    echo [91m[FAIL] Frontend Tests[0m
    set /a FAILED+=1
)
set /a TOTAL+=1
echo.

REM Summary
echo.
echo ====================================
echo Test Summary
echo ====================================
echo Total Test Suites: %TOTAL%
echo Passed: %PASSED%
echo Failed: %FAILED%
echo.

if %FAILED% EQU 0 (
    echo [92mAll tests passed! Ready for production.[0m
    exit /b 0
) else (
    echo [91mSome tests failed. Please review and fix.[0m
    exit /b 1
)
