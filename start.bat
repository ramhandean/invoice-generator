@echo off
REM Multi-Step Invoice Generator - Docker Quick Start Script (Windows)

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting Multi-Step Invoice Generator with Docker Compose...
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop for Windows first.
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed
echo.

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml not found in current directory
    exit /b 1
)

echo 📋 Available commands:
echo.
echo   start.bat up            - Start all services
echo   start.bat up-build      - Start all services with rebuild
echo   start.bat up-build frontend - Start frontend with rebuild
echo   start.bat up-build backend  - Start backend with rebuild
echo   start.bat build         - Rebuild all services (no start)
echo   start.bat build frontend - Rebuild frontend only
echo   start.bat build backend  - Rebuild backend only
echo   start.bat down          - Stop all services
echo   start.bat restart       - Restart all services
echo   start.bat logs          - View logs
echo   start.bat clean         - Clean up (removes volumes)
echo   start.bat ps            - Show service status
echo.

REM Get command arguments
set COMMAND=%1
if "%COMMAND%"="" set COMMAND=up
set SERVICE=%2

if "%COMMAND%"=="up" (
    echo 🐳 Starting services with docker-compose up...
    echo.
    docker-compose up
) else if "%COMMAND%"=="up-build" (
    if "%SERVICE%"=="" (
        echo 🔨 Starting all services with rebuild...
        echo.
        docker-compose up -d --build
    ) else (
        echo 🔨 Starting %SERVICE% service with rebuild...
        echo.
        docker-compose up -d --build %SERVICE%
    )
    echo ✅ Services started with rebuild
) else if "%COMMAND%"=="build" (
    if "%SERVICE%"=="" (
        echo 🔨 Building all services...
        echo.
        docker-compose build
        echo ✅ All services built
    ) else if "%SERVICE%"=="frontend" (
        echo 🔨 Building frontend service...
        echo.
        docker-compose build frontend
        echo ✅ Frontend built
    ) else if "%SERVICE%"=="backend" (
        echo 🔨 Building backend service...
        echo.
        docker-compose build backend
        echo ✅ Backend built
    ) else (
        echo ❌ Unknown service: %SERVICE%
        echo Available services: frontend, backend
        exit /b 1
    )
) else if "%COMMAND%"=="down" (
    echo 🛑 Stopping services...
    docker-compose down
    echo ✅ Services stopped
) else if "%COMMAND%"=="restart" (
    echo 🔄 Restarting services...
    docker-compose restart
    echo ✅ Services restarted
) else if "%COMMAND%"=="logs" (
    echo 📊 Showing logs (Press Ctrl+C to exit)...
    docker-compose logs -f
) else if "%COMMAND%"=="ps" (
    echo 📋 Service status:
    docker-compose ps
) else if "%COMMAND%"=="clean" (
    echo 🧹 Cleaning up (removing all containers and volumes)...
    docker-compose down -v
    echo ✅ Cleanup complete
) else if "%COMMAND%"=="-h" (
    goto :help
) else if "%COMMAND%"=="--help" (
    goto :help
) else if "%COMMAND%"=="help" (
    goto :help
) else (
    echo ❌ Unknown command: %COMMAND%
    echo Run "start.bat help" for available commands
    exit /b 1
)

goto :eof

:help
echo Usage: start.bat [command] [service]
echo.
echo Commands:
echo   up           Start all services (default)
echo   up-build     Start all services with rebuild
echo              Use with: frontend or backend to rebuild specific service
echo   build        Build all services without starting
echo              Use with: frontend or backend to build specific service
echo   down         Stop all services
echo   restart      Restart all services
echo   logs         View logs
echo   ps           Show service status
echo   clean        Stop and remove everything (including volumes)
echo   help         Show this help message
echo.
echo Examples:
echo   start.bat up
echo   start.bat up-build
echo   start.bat build
echo   start.bat build frontend
echo   start.bat build backend
exit /b 0
