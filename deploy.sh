#!/bin/bash

# Kisan AI Deployment Script
# This script automates the deployment process for the Kisan AI application

set -e  # Exit on any error

echo "🚜 Kisan AI - Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found. Will use local deployment."
        DOCKER_AVAILABLE=false
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is available"
        DOCKER_COMPOSE_AVAILABLE=true
    else
        print_warning "Docker Compose not found"
        DOCKER_COMPOSE_AVAILABLE=false
    fi
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Created .env file from template. Please edit it with your configuration."
        else
            print_error "env.example not found. Please create .env file manually."
            exit 1
        fi
    else
        print_success ".env file already exists"
    fi
    
    # Create necessary directories
    mkdir -p uploads logs whatsapp-sessions
    print_success "Created necessary directories"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}



# Deploy with Docker
deploy_docker() {
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$DOCKER_COMPOSE_AVAILABLE" = true ]; then
        print_status "Deploying with Docker..."
        
        # Stop existing containers
        docker-compose down 2>/dev/null || true
        
        # Build and start containers
        if docker-compose up -d --build; then
            print_success "Docker deployment successful"
            print_status "Application is running at: http://localhost:3000"
            print_status "MongoDB: localhost:27017"
            print_status "Redis: localhost:6379"
        else
            print_error "Docker deployment failed"
            exit 1
        fi
    else
        print_warning "Docker not available, skipping Docker deployment"
        return 1
    fi
}

# Deploy locally
deploy_local() {
    print_status "Deploying locally..."
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is not running. Please start MongoDB first."
        print_status "You can start MongoDB with: sudo systemctl start mongod"
    fi
    
    # Start the application
    print_status "Starting Kisan AI application..."
    print_status "Press Ctrl+C to stop the application"
    
    npm start
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for application to start
    sleep 5
    
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Application is healthy and running"
        print_status "Health check endpoint: http://localhost:3000/health"
    else
        print_warning "Health check failed. Application may still be starting up."
    fi
}

# Main deployment function
main() {
    local deployment_type=${1:-local}
    
    print_status "Starting deployment process..."
    
    check_prerequisites
    setup_environment
    install_dependencies
    
    
    case $deployment_type in
        "docker")
            if deploy_docker; then
                health_check
            else
                print_warning "Falling back to local deployment"
                deploy_local
            fi
            ;;
        "local")
            deploy_local
            ;;
        *)
            print_error "Invalid deployment type. Use 'local' or 'docker'"
            exit 1
            ;;
    esac
}

# Parse command line arguments
case "${1:-}" in
    "docker")
        main "docker"
        ;;
    "local")
        main "local"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [deployment_type]"
        echo ""
        echo "Deployment types:"
        echo "  docker    - Deploy using Docker (requires Docker and Docker Compose)"
        echo "  local     - Deploy locally (default)"
        echo "  help      - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0          # Deploy locally"
        echo "  $0 local    # Deploy locally"
        echo "  $0 docker   # Deploy with Docker"
        echo ""
        echo "Prerequisites:"
        echo "  - Node.js 18+"
        echo "  - npm"
        echo "  - MongoDB (for local deployment)"
        echo "  - Docker & Docker Compose (for Docker deployment)"
        ;;
    *)
        main "local"
        ;;
esac
