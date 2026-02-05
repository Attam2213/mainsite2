#!/bin/bash

# Enhanced Update Script for mainsite2
# This script updates the application from git and redeploys

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Ensure we are in the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

log "Starting update process..."

# Check if git is available
if ! command -v git &> /dev/null; then
    error "Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    error "This is not a git repository. Please clone the repository first."
    exit 1
fi

# Store current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    warning "There are uncommitted changes in the repository."
    read -p "Do you want to stash them? (y/N): " STASH_CHANGES
    if [[ "$STASH_CHANGES" =~ ^[Yy]$ ]]; then
        log "Stashing changes..."
        git stash push -m "Auto-stash before update on $(date)"
        STASHED=true
    else
        error "Please commit or stash your changes before updating."
        exit 1
    fi
fi

# Fetch latest changes from remote
log "Fetching latest changes from Git..."
git fetch --all

# Check if there are updates available
LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse origin/$CURRENT_BRANCH)

if [[ "$LOCAL_COMMIT" == "$REMOTE_COMMIT" ]]; then
    success "Already up to date!"
    
    # Restore stashed changes if any
    if [[ "$STASHED" == "true" ]]; then
        log "Restoring stashed changes..."
        git stash pop
    fi
    
    exit 0
fi

log "Updates available. Local: ${LOCAL_COMMIT:0:8}, Remote: ${REMOTE_COMMIT:0:8}"

# Pull latest changes
log "Pulling latest changes..."
git reset --hard origin/$CURRENT_BRANCH
git clean -fd

# Restore stashed changes if any
if [[ "$STASHED" == "true" ]]; then
    log "Restoring stashed changes..."
    git stash pop || warning "Could not restore stashed changes automatically."
fi

# Detect domain name from Nginx config
DOMAIN_NAME=""
if [[ -d "/etc/nginx/sites-enabled" ]]; then
    DOMAIN_NAME=$(ls /etc/nginx/sites-enabled/ 2>/dev/null | grep -v default | head -n 1)
fi

if [[ -z "$DOMAIN_NAME" ]]; then
    warning "Could not detect domain name from Nginx config."
    read -p "Enter your domain name (or press Enter to skip frontend update): " DOMAIN_NAME
fi

# Install dependencies
log "Installing server dependencies..."
cd server
if [[ -f package-lock.json ]]; then
    npm ci --production=false
else
    npm install --production=false
fi

log "Installing client dependencies..."
cd ../client
if [[ -f package-lock.json ]]; then
    npm ci --production=false
else
    npm install --production=false
fi

# Build frontend
log "Building frontend..."
npm run build
success "Frontend built successfully"

# Update backend configuration if needed
log "Checking backend configuration..."
cd ../server

# Check if .env exists, create if not
if [[ ! -f .env ]]; then
    warning "No .env file found. Creating from .env.example if available..."
    if [[ -f .env.example ]]; then
        cp .env.example .env
        warning "Please configure your .env file manually."
    else
        error "No .env.example file found. Please create .env file manually."
    fi
fi

# Check if db.js needs PostgreSQL update
if grep -q "sqlite" db.js 2>/dev/null; then
    warning "SQLite detected in db.js. Consider updating to PostgreSQL for production."
    read -p "Update db.js for PostgreSQL? (y/N): " UPDATE_DB
    if [[ "$UPDATE_DB" =~ ^[Yy]$ ]]; then
        log "Updating db.js for PostgreSQL..."
        cat > db.js <<'EOF'
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;
EOF
        success "db.js updated for PostgreSQL"
    fi
fi

cd ..

# Deploy frontend if domain is available
if [[ -n "$DOMAIN_NAME" ]]; then
    log "Deploying frontend to /var/www/$DOMAIN_NAME..."
    
    # Check if web directory exists
    if [[ -d "/var/www/$DOMAIN_NAME" ]]; then
        # Backup current frontend
        BACKUP_DIR="/var/www/${DOMAIN_NAME}.backup.$(date +%Y%m%d_%H%M%S)"
        log "Creating backup: $BACKUP_DIR"
        sudo cp -r "/var/www/$DOMAIN_NAME" "$BACKUP_DIR"
        
        # Copy new files
        log "Copying new frontend files..."
        sudo cp -r client/dist/* "/var/www/$DOMAIN_NAME/"
        sudo chown -R www-data:www-data "/var/www/$DOMAIN_NAME"
        sudo chmod -R 755 "/var/www/$DOMAIN_NAME"
        
        success "Frontend updated successfully"
    else
        warning "Web directory /var/www/$DOMAIN_NAME does not exist."
        warning "Frontend files were NOT deployed. Run install.sh first."
    fi
else
    warning "No domain name provided. Frontend files were NOT deployed."
fi

# Restart backend
log "Restarting backend..."
if pm2 describe mainsite-server >/dev/null 2>&1; then
    log "Restarting existing PM2 process..."
    pm2 restart mainsite-server
else
    log "Starting new PM2 process..."
    cd server
    pm2 start index.js --name "mainsite-server"
    cd ..
fi

# Save PM2 configuration
pm2 save

# Check if database migration is needed
log "Checking for database migrations..."
cd server
if [[ -f models.js ]]; then
    log "Running database sync..."
    # Run a simple node script to sync database
    node -e "
    const sequelize = require('./db');
    const { User, Service, Invoice, Portfolio, Chat, Message, ChatFile } = require('./models');
    
    sequelize.sync({ alter: true }).then(() => {
        console.log('Database synchronized successfully');
        process.exit(0);
    }).catch(err => {
        console.error('Database sync failed:', err);
        process.exit(1);
    });
    " || warning "Database sync failed. You may need to run it manually."
fi
cd ..

# Test backend health
log "Testing backend health..."
sleep 5  # Wait for backend to start
if curl -f -s "http://localhost:5000/api/user/check" >/dev/null 2>&1; then
    success "Backend is healthy"
else
    warning "Backend health check failed. Check logs with: pm2 logs mainsite-server"
fi

# Create update log
mkdir -p logs
cat > "logs/update-$(date +%Y%m%d_%H%M%S).log" <<EOF
Update completed on: $(date)
Branch: $CURRENT_BRANCH
From commit: ${LOCAL_COMMIT:0:8}
To commit: ${REMOTE_COMMIT:0:8}
Domain: $DOMAIN_NAME
Status: SUCCESS
EOF

# Final status
echo ""
echo "======================================="
echo "   🔄 UPDATE COMPLETED SUCCESSFULLY! 🔄"
echo "======================================="
echo ""
echo "Updated from commit: ${LOCAL_COMMIT:0:8} → ${REMOTE_COMMIT:0:8}"
echo "Branch: $CURRENT_BRANCH"
if [[ -n "$DOMAIN_NAME" ]]; then
    echo "Domain: $DOMAIN_NAME"
fi
echo ""
echo "Useful commands:"
echo "- pm2 logs mainsite-server  # View backend logs"
echo "- pm2 restart mainsite-server  # Restart backend"
echo "- pm2 list  # View all PM2 processes"
echo ""
echo "Update log saved to: logs/update-$(date +%Y%m%d_%H%M%S).log"

# Optional: Send notification (if configured)
if [[ -n "$WEBHOOK_URL" ]]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"🔄 Update completed successfully for $DOMAIN_NAME\"}" \
        >/dev/null 2>&1 || true
fi