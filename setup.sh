#!/bin/bash

# Surprise Moments Platform Setup Script
# This script will set up the entire platform including database, backend, and frontend

set -e  # Exit on any error

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

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL is not installed. You'll need to install it manually or use Docker."
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker is available for containerized setup"
    else
        print_warning "Docker is not installed. You can install it for easier deployment."
    fi
    
    print_success "System requirements check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install server dependencies
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    cd client
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Environment file created from template"
        print_warning "Please edit .env file with your configuration before continuing"
    else
        print_warning "Environment file already exists. Skipping creation."
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if command -v psql &> /dev/null; then
        print_status "Setting up PostgreSQL database..."
        cd server
        npm run db:setup
        cd ..
        print_success "Database setup completed"
    else
        print_warning "PostgreSQL not found. You can set up the database manually or use Docker."
        print_status "To set up with Docker, run: docker-compose up -d postgres"
    fi
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd client
    npm run build
    cd ..
    
    print_success "Frontend built successfully"
}

# Start development servers
start_development() {
    print_status "Starting development servers..."
    
    # Start both frontend and backend in development mode
    npm run dev &
    
    print_success "Development servers started"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:5000"
    print_status "Press Ctrl+C to stop the servers"
    
    # Wait for user to stop
    wait
}

# Docker setup
setup_docker() {
    if command -v docker &> /dev/null; then
        print_status "Setting up Docker containers..."
        
        # Build and start containers
        docker-compose up -d
        
        print_success "Docker containers started"
        print_status "Frontend: http://localhost:3000"
        print_status "Backend API: http://localhost:5000"
        print_status "Database: localhost:5432"
    else
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
}

# Production setup
setup_production() {
    print_status "Setting up for production..."
    
    # Build frontend for production
    build_frontend
    
    # Set production environment
    export NODE_ENV=production
    
    print_success "Production setup completed"
    print_status "You can now deploy the application"
}

# Main setup function
main() {
    echo "🎉 Welcome to Surprise Moments Platform Setup!"
    echo "=============================================="
    echo ""
    
    # Check requirements
    check_requirements
    
    # Install dependencies
    install_dependencies
    
    # Setup environment
    setup_environment
    
    # Ask user for setup type
    echo ""
    echo "Choose your setup type:"
    echo "1) Development setup (with live reload)"
    echo "2) Docker setup (containerized)"
    echo "3) Production setup (build only)"
    echo "4) Database setup only"
    echo "5) Exit"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            setup_database
            start_development
            ;;
        2)
            setup_docker
            ;;
        3)
            setup_database
            setup_production
            ;;
        4)
            setup_database
            ;;
        5)
            print_status "Setup cancelled"
            exit 0
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
}

# Help function
show_help() {
    echo "Surprise Moments Platform Setup Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -d, --docker   Setup with Docker"
    echo "  -p, --prod     Production setup"
    echo "  -db, --db      Database setup only"
    echo ""
    echo "Examples:"
    echo "  $0              Interactive setup"
    echo "  $0 --docker     Docker setup"
    echo "  $0 --prod       Production setup"
    echo "  $0 --db         Database setup only"
}

# Parse command line arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    -d|--docker)
        check_requirements
        install_dependencies
        setup_environment
        setup_docker
        ;;
    -p|--prod)
        check_requirements
        install_dependencies
        setup_environment
        setup_database
        setup_production
        ;;
    -db|--db)
        check_requirements
        setup_database
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
