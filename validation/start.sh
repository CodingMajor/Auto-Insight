#!/bin/bash

echo "🚀 Starting Auto-Insights Real-Time Platform..."

# Check if Docker is running
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating data directories..."
mkdir -p data exports logs
mkdir -p backend/data
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
    else
        # Create a basic .env file
        cat > .env << EOF
# Gemini API Key (required for AI explanations)
GEMINI_API_KEY=your_gemini_api_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/auto_insights

# Redis
REDIS_URL=redis://localhost:6379/0

# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
EOF
    fi
    echo "📝 Created .env file. Please update with your GEMINI_API_KEY"
fi

# Start the services
echo "🐳 Starting all services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "🎉 Auto-Insights Real-Time Platform is starting!"
echo ""
echo "📊 Service URLs:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • API Documentation: http://localhost:8000/docs"
echo "   • Flower (Celery Monitoring): http://localhost:5555"
echo "   • MinIO Console: http://localhost:9001"
echo "   • Prometheus: http://localhost:9090"
echo "   • Grafana: http://localhost:3001"
echo ""
echo "🎯 Real-Time Features:"
echo "   • WebSocket connections for live progress updates"
echo "   • Background EDA analysis with step-by-step progress"
echo "   • Real-time AutoML training status"
echo "   • Asynchronous data preprocessing"
echo "   • Live job monitoring with Flower"
echo ""
echo "🔧 Management Commands:"
echo "   • View logs: docker-compose logs -f [service_name]"
echo "   • Stop platform: docker-compose down"
echo "   • Restart services: docker-compose restart"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
timeout=120
counter=0
while ! curl -s http://localhost:8000/health > /dev/null; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Backend failed to start within ${timeout} seconds"
        echo "📋 Check logs with: docker-compose logs backend"
        exit 1
    fi
    counter=$((counter + 2))
    sleep 2
    echo -n "."
done
echo ""

echo "✅ Backend is ready!"
echo "🎯 Real-time functionality is now active!"
echo "   • EDA analysis with live progress updates via WebSocket"
echo "   • AutoML training with real-time status monitoring"
echo "   • Background job processing with Celery workers"
echo "   • Live dashboard updates and notifications"
