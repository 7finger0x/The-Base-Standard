@echo off
REM Pre-deployment validation script for Windows
REM Run this before deploying to production

setlocal enabledelayedexpansion

echo 🔍 Running pre-deployment checks...

REM Check Node version
echo 📦 Checking Node.js version...
node -v
if errorlevel 1 (
    echo ❌ Node.js not found
    exit /b 1
)

REM Install dependencies
echo 📥 Installing dependencies...
call npm ci
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Type check
echo 🔎 Running TypeScript type check...
call npm run typecheck
if errorlevel 1 (
    echo ❌ TypeScript check failed
    exit /b 1
)
echo ✅ TypeScript check passed

REM Lint
echo 🔍 Running ESLint...
call npm run lint
if errorlevel 1 (
    echo ❌ Lint check failed
    exit /b 1
)
echo ✅ Lint check passed

REM Run tests
echo 🧪 Running tests...
call npm run test:frontend
if errorlevel 1 (
    echo ❌ Tests failed
    exit /b 1
)
echo ✅ Tests passed

REM Build
echo 🏗️  Building application...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✅ Build successful

REM Check environment variables
echo 🔐 Checking environment variables...
if exist .env.example (
    echo ⚠️  Please verify all required environment variables are set
)

REM Prisma check
echo 🗄️  Checking Prisma schema...
call npx prisma validate
if errorlevel 1 (
    echo ❌ Prisma schema invalid
    exit /b 1
)
echo ✅ Prisma schema valid

echo.
echo ✅ All pre-deployment checks passed!
echo 🚀 Ready for deployment
