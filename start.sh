#!/bin/bash

# Multi-Step Invoice Generator - Docker Quick Start Script

set -e

echo "🚀 Starting Multi-Step Invoice Generator with Docker Compose..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found in current directory"
    exit 1
fi

echo "📋 Available commands:"
echo ""
echo "  ./start.sh up           - Start all services"
echo "  ./start.sh up-build     - Start all services with rebuild"
echo "  ./start.sh up-build frontend - Start frontend with rebuild"
echo "  ./start.sh up-build backend  - Start backend with rebuild"
echo "  ./start.sh build        - Rebuild all services (no start)"
echo "  ./start.sh build frontend - Rebuild frontend only"
echo "  ./start.sh build backend  - Rebuild backend only"
echo "  ./start.sh down         - Stop all services"
echo "  ./start.sh restart      - Restart all services"
echo "  ./start.sh logs         - View logs"
echo "  ./start.sh clean        - Clean up (removes volumes)"
echo "  ./start.sh ps           - Show service status"
echo ""

# Get command arguments
COMMAND=${1:-up}
SERVICE=${2:-}

case $COMMAND in
  up)
    echo "🐳 Starting services with docker compose up..."
    echo ""
    docker compose up
    ;;
  up-build)
    if [ -z "$SERVICE" ]; then
      echo "🔨 Starting all services with rebuild..."
      echo ""
      docker compose up -d --build
    else
      echo "🔨 Starting $SERVICE service with rebuild..."
      echo ""
      docker compose up -d --build $SERVICE
    fi
    echo "✅ Services started with rebuild"
    ;;
  build)
    if [ -z "$SERVICE" ]; then
      echo "🔨 Building all services..."
      echo ""
      docker compose build
      echo "✅ All services built"
    elif [ "$SERVICE" = "frontend" ]; then
      echo "🔨 Building frontend service..."
      echo ""
      docker compose build frontend
      echo "✅ Frontend built"
    elif [ "$SERVICE" = "backend" ]; then
      echo "🔨 Building backend service..."
      echo ""
      docker compose build backend
      echo "✅ Backend built"
    else
      echo "❌ Unknown service: $SERVICE"
      echo "Available services: frontend, backend"
      exit 1
    fi
    ;;
  down)
    echo "🛑 Stopping services..."
    docker compose down
    echo "✅ Services stopped"
    ;;
  restart)
    echo "🔄 Restarting services..."
    docker compose restart
    echo "✅ Services restarted"
    ;;
  logs)
    echo "📊 Showing logs (Press Ctrl+C to exit)..."
    docker compose logs -f
    ;;
  ps)
    echo "📋 Service status:"
    docker compose ps
    ;;
  clean)
    echo "🧹 Cleaning up (removing all containers and volumes)..."
    docker compose down -v
    echo "✅ Cleanup complete"
    ;;
  -h|--help|help)
    echo "Usage: ./start.sh [command] [service]"
    echo ""
    echo "Commands:"
    echo "  up           Start all services (default)"
    echo "  up-build     Start all services with rebuild"
    echo "             Use with: frontend or backend to rebuild specific service"
    echo "  build        Build all services without starting"
    echo "             Use with: frontend or backend to build specific service"
    echo "  down         Stop all services"
    echo "  restart      Restart all services"
    echo "  logs         View logs"
    echo "  ps           Show service status"
    echo "  clean        Stop and remove everything (including volumes)"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh up"
    echo "  ./start.sh up-build"
    echo "  ./start.sh build"
    echo "  ./start.sh build frontend"
    echo "  ./start.sh build backend"
    ;;
  *)
    echo "❌ Unknown command: $COMMAND"
    echo "Run './start.sh help' for available commands"
    exit 1
    ;;
esac
