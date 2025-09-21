#!/bin/bash

# =============================================================================
# SafePsy Docker Management Script
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
STAGING_COMPOSE_FILE="docker-compose.staging.yml"
PROJECT_NAME="safepsy"

# Functions
print_header() {
    echo -e "${BLUE}=============================================================================${NC}"
    echo -e "${BLUE}SafePsy Docker Management${NC}"
    echo -e "${BLUE}=============================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Help function
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start           Start all services"
    echo "  stop            Stop all services"
    echo "  restart         Restart all services"
    echo "  build           Build all images"
    echo "  logs            Show logs for all services"
    echo "  logs [service]  Show logs for specific service"
    echo "  status          Show status of all services"
    echo "  clean           Clean up containers, images, and volumes"
    echo "  staging         Run staging environment"
    echo "  production      Run production environment"
    echo "  health          Check health of all services"
    echo "  backup          Backup database"
    echo "  restore         Restore database from backup"
    echo ""
    echo "Options:"
    echo "  --force         Force operation without confirmation"
    echo "  --no-cache      Build without cache"
    echo "  --follow        Follow logs (for logs command)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs backend --follow"
    echo "  $0 staging start"
    echo "  $0 clean --force"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Start services
start_services() {
    local env=${1:-production}
    local compose_file=$COMPOSE_FILE
    
    if [ "$env" = "staging" ]; then
        compose_file=$STAGING_COMPOSE_FILE
    fi
    
    print_info "Starting SafePsy services ($env environment)..."
    docker-compose -f $compose_file -p $PROJECT_NAME up -d
    print_success "Services started successfully"
}

# Stop services
stop_services() {
    local env=${1:-production}
    local compose_file=$COMPOSE_FILE
    
    if [ "$env" = "staging" ]; then
        compose_file=$STAGING_COMPOSE_FILE
    fi
    
    print_info "Stopping SafePsy services ($env environment)..."
    docker-compose -f $compose_file -p $PROJECT_NAME down
    print_success "Services stopped successfully"
}

# Restart services
restart_services() {
    local env=${1:-production}
    print_info "Restarting SafePsy services ($env environment)..."
    stop_services $env
    start_services $env
    print_success "Services restarted successfully"
}

# Build images
build_images() {
    local env=${1:-production}
    local compose_file=$COMPOSE_FILE
    local build_args=""
    
    if [ "$env" = "staging" ]; then
        compose_file=$STAGING_COMPOSE_FILE
    fi
    
    if [ "$2" = "--no-cache" ]; then
        build_args="--no-cache"
    fi
    
    print_info "Building SafePsy images ($env environment)..."
    docker-compose -f $compose_file -p $PROJECT_NAME build $build_args
    print_success "Images built successfully"
}

# Show logs
show_logs() {
    local env=${1:-production}
    local service=${2:-}
    local compose_file=$COMPOSE_FILE
    local follow=""
    
    if [ "$env" = "staging" ]; then
        compose_file=$STAGING_COMPOSE_FILE
    fi
    
    if [ "$3" = "--follow" ]; then
        follow="-f"
    fi
    
    if [ -n "$service" ]; then
        print_info "Showing logs for $service ($env environment)..."
        docker-compose -f $compose_file -p $PROJECT_NAME logs $follow $service
    else
        print_info "Showing logs for all services ($env environment)..."
        docker-compose -f $compose_file -p $PROJECT_NAME logs $follow
    fi
}

# Show status
show_status() {
    local env=${1:-production}
    local compose_file=$COMPOSE_FILE
    
    if [ "$env" = "staging" ]; then
        compose_file=$STAGING_COMPOSE_FILE
    fi
    
    print_info "SafePsy services status ($env environment):"
    docker-compose -f $compose_file -p $PROJECT_NAME ps
}

# Clean up
clean_up() {
    local force=${1:-}
    
    if [ "$force" != "--force" ]; then
        print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
        read -r response
        if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
            print_info "Cleanup cancelled"
            exit 0
        fi
    fi
    
    print_info "Cleaning up Docker resources..."
    
    # Stop and remove containers
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down --volumes --remove-orphans
    docker-compose -f $STAGING_COMPOSE_FILE -p $PROJECT_NAME down --volumes --remove-orphans
    
    # Remove images
    docker image prune -f
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Health check
health_check() {
    local env=${1:-production}
    local compose_file=$COMPOSE_FILE
    
    if [ "$env" = "staging" ]; then
        compose_file=$STAGING_COMPOSE_FILE
    fi
    
    print_info "Checking health of SafePsy services ($env environment)..."
    
    # Check if services are running
    if ! docker-compose -f $compose_file -p $PROJECT_NAME ps | grep -q "Up"; then
        print_error "No services are running"
        return 1
    fi
    
    # Check individual service health
    services=("backend" "frontend" "ai-chatbot" "mongodb" "redis")
    for service in "${services[@]}"; do
        if docker-compose -f $compose_file -p $PROJECT_NAME ps | grep -q "$service.*Up"; then
            print_success "$service is running"
        else
            print_error "$service is not running"
        fi
    done
}

# Backup database
backup_database() {
    local env=${1:-production}
    local backup_file="safepsy_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    print_info "Creating database backup ($env environment)..."
    
    if [ "$env" = "staging" ]; then
        docker exec safepsy-mongodb-staging mongodump --archive | gzip > $backup_file
    else
        docker exec safepsy-mongodb mongodump --archive | gzip > $backup_file
    fi
    
    print_success "Database backup created: $backup_file"
}

# Restore database
restore_database() {
    local backup_file=$1
    local env=${2:-production}
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_info "Restoring database from $backup_file ($env environment)..."
    
    if [ "$env" = "staging" ]; then
        gunzip -c $backup_file | docker exec -i safepsy-mongodb-staging mongorestore --archive
    else
        gunzip -c $backup_file | docker exec -i safepsy-mongodb mongorestore --archive
    fi
    
    print_success "Database restored successfully"
}

# Main script logic
main() {
    print_header
    
    # Check if Docker is running
    check_docker
    
    # Parse command line arguments
    case "${1:-help}" in
        start)
            start_services $2
            ;;
        stop)
            stop_services $2
            ;;
        restart)
            restart_services $2
            ;;
        build)
            build_images $2 $3
            ;;
        logs)
            show_logs $2 $3 $4
            ;;
        status)
            show_status $2
            ;;
        clean)
            clean_up $2
            ;;
        staging)
            shift
            main $@
            ;;
        production)
            shift
            main $@
            ;;
        health)
            health_check $2
            ;;
        backup)
            backup_database $2
            ;;
        restore)
            restore_database $2 $3
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
