@echo off
echo Starting Auto-Insights Platform...

REM Check if Docker is running
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed or not running. Please install Docker Desktop.
    pause
    exit /b 1
)

REM Create necessary directories
if not exist "data" mkdir data
if not exist "exports" mkdir exports
if not exist "logs" mkdir logs

REM Copy environment file if it doesn't exist
if not exist ".env" (
    copy ".env.example" ".env"
    echo Created .env file from template. Please update with your API keys.
)

REM Start the services
echo Starting services with Docker Compose...
docker-compose up -d

REM Wait for services to be ready
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo Checking service status...
docker-compose ps

echo.
echo ========================================
echo Auto-Insights Platform is starting!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo MinIO Console: http://localhost:9001
echo Prometheus: http://localhost:9090
echo Grafana: http://localhost:3001
echo.
echo Default Grafana credentials: admin/admin
echo Default MinIO credentials: minioadmin/minioadmin
echo.
echo To stop the platform, run: docker-compose down
echo To view logs, run: docker-compose logs -f
echo.
pause
