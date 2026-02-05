#!/bin/bash

# Enhanced VDS Installation Script for Ubuntu
# Modified to allow root execution (use at your own risk)
# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
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

log "Starting VDS installation for mainsite2..."

# Root execution warning (proceeding anyway)
if [[ $EUID -eq 0 ]]; then
   warning "Running as root - proceeding with caution"
   warning "Make sure you understand the security risks"
fi

# Get user inputs with validation
get_input() {
    local prompt="$1"
    local var_name="$2"
    local validation_pattern="$3"
    local input=""
    
    while true; do
        read -p "$prompt" input
        if [[ -z "$input" ]]; then
            error "Input cannot be empty"
            continue
        fi
        if [[ -n "$validation_pattern" ]] && ! [[ "$input" =~ $validation_pattern ]]; then
            error "Invalid input format. Please try again."
            continue
        fi
        break
    done
    
    eval "$var_name='$input'"
}

# Domain input
get_input "Enter your domain name (e.g., example.com): " DOMAIN_NAME "^[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"

# Database password input (hidden)
while true; do
    read -s -p "Enter password for database user 'mainsite_user': " DB_PASSWORD
    echo ""
    if [[ ${#DB_PASSWORD} -lt 8 ]]; then
        error "Password must be at least 8 characters long"
        continue
    fi
    read -s -p "Confirm password: " DB_PASSWORD_CONFIRM
    echo ""
    if [[ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]]; then
        error "Passwords do not match"
        continue
    fi
    break
done

# Email for SSL certificate
get_input "Enter your email for SSL certificate: " ADMIN_EMAIL "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"

log "Installation parameters confirmed:"
log "Domain: $DOMAIN_NAME"
log "Email: $ADMIN_EMAIL"
log "Database user: mainsite_user"

# Update system
log "Updating system packages..."
sudo apt-get update -qq
sudo apt-get upgrade -y -qq
success "System updated successfully"

# Install essential packages
log "Installing essential packages..."
sudo apt-get install -y -qq \
    git \
    curl \
    wget \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Node.js 20.x
log "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y -qq nodejs
node_version=$(node --version)
success "Node.js installed: $node_version"

# Install PostgreSQL
log "Installing PostgreSQL..."
sudo apt-get install -y -qq postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
success "PostgreSQL installed and started"

# Install Nginx
log "Installing Nginx..."
sudo apt-get install -y -qq nginx
sudo systemctl enable nginx
success "Nginx installed and enabled"

# Install Certbot
log "Installing Certbot..."
sudo apt-get install -y -qq certbot python3-certbot-nginx
success "Certbot installed"

# Install PM2 globally
log "Installing PM2..."
sudo npm install -g pm2@latest
success "PM2 installed"

# Database Setup
log "Setting up PostgreSQL database..."
cd /tmp

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE mainsite_db;" 2>/dev/null || warning "Database already exists"
sudo -u postgres psql -c "CREATE USER mainsite_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" 2>/dev/null || \
sudo -u postgres psql -c "ALTER USER mainsite_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mainsite_db TO mainsite_user;"

# Return to project directory
cd "$SCRIPT_DIR"
success "Database setup completed"

# Create environment configuration
log "Creating environment configuration..."
cat > server/.env <<EOF
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_NAME=mainsite_db
DB_USER=mainsite_user
DB_PASSWORD=$DB_PASSWORD
DB_HOST=localhost
DB_PORT=5432

# Security
JWT_SECRET=$(openssl rand -base64 64)
BCRYPT_ROUNDS=12

# Client Configuration
CLIENT_URL=https://$DOMAIN_NAME
CLIENT_PORT=3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# SSL/Domain
DOMAIN=$DOMAIN_NAME
ADMIN_EMAIL=$ADMIN_EMAIL
EOF

# Create client environment file
cat > client/.env.production <<EOF
VITE_API_URL=https://$DOMAIN_NAME/api
VITE_CLIENT_URL=https://$DOMAIN_NAME
EOF

success "Environment files created"

# Project Setup
log "Setting up Node.js project..."

# Install server dependencies
log "Installing server dependencies..."
cd server
npm ci --production=false
cd ..

# Install client dependencies
log "Installing client dependencies..."
cd client
npm ci --production=false

# Build frontend
log "Building frontend for production..."
npm run build
success "Frontend built successfully"
cd ..

# Create uploads directory
log "Creating uploads directory..."
sudo mkdir -p /var/www/uploads
sudo chown www-data:www-data /var/www/uploads
sudo chmod 755 /var/www/uploads

# Deploy frontend
log "Deploying frontend..."
sudo mkdir -p "/var/www/$DOMAIN_NAME"
sudo cp -r client/dist/* "/var/www/$DOMAIN_NAME/"
sudo chown -R www-data:www-data "/var/www/$DOMAIN_NAME"
sudo chmod -R 755 "/var/www/$DOMAIN_NAME"
success "Frontend deployed"

# Nginx Configuration
log "Configuring Nginx..."

# Remove default config if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Create Nginx configuration
cat > "nginx-$DOMAIN_NAME.conf" <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    root /var/www/$DOMAIN_NAME;
    index index.html index.htm;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend
    location / {
        try_files \$uri \$uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File uploads
    location /uploads {
        alias /var/www/uploads;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

sudo mv "nginx-$DOMAIN_NAME.conf" "/etc/nginx/sites-available/$DOMAIN_NAME"
sudo ln -sf "/etc/nginx/sites-available/$DOMAIN_NAME" "/etc/nginx/sites-enabled/"

# Test Nginx configuration
sudo nginx -t
success "Nginx configured"

# SSL Certificate
log "Obtaining SSL certificate..."
sudo certbot --nginx -d "$DOMAIN_NAME" -d "www.$DOMAIN_NAME" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect
success "SSL certificate obtained"

# Backend Setup
log "Setting up backend..."
cd server

# Update db.js for PostgreSQL
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

# Start backend with PM2
log "Starting backend with PM2..."
pm2 describe mainsite-server >/dev/null 2>&1 && pm2 restart mainsite-server || pm2 start index.js --name "mainsite-server"
pm2 save
pm2 startup systemd -u $USER --hp $HOME
success "Backend started with PM2"

# Create systemd service for PM2
log "Creating systemd service..."
pm2 startup systemd -u $USER --hp $HOME | grep sudo | bash

# Setup log rotation
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/mainsite >/dev/null <<EOF
/var/www/$DOMAIN_NAME/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Final steps
cd "$SCRIPT_DIR"

# Create deployment info
log "Creating deployment info..."
cat > deployment-info.txt <<EOF
Deployment Information
=======================
Date: $(date)
Domain: $DOMAIN_NAME
Database: PostgreSQL (mainsite_db)
Backend: Node.js + PM2
Frontend: Nginx + SSL
Email: $ADMIN_EMAIL

Access URLs:
- Website: https://$DOMAIN_NAME
- API: https://$DOMAIN_NAME/api

Important Commands:
- View PM2 logs: pm2 logs mainsite-server
- Restart backend: pm2 restart mainsite-server
- Check Nginx: sudo nginx -t
- Renew SSL: sudo certbot renew --dry-run
EOF

# Cleanup
log "Cleaning up..."
sudo apt-get autoremove -y
sudo apt-get autoclean

success "Installation completed successfully!"
echo ""
echo "======================================="
echo "   🎉 DEPLOYMENT COMPLETE! 🎉"
echo "======================================="
echo ""
echo "Your website is live at: https://$DOMAIN_NAME"
echo ""
echo "Important files:"
echo "- Deployment info: $SCRIPT_DIR/deployment-info.txt"
echo "- Environment: server/.env"
echo "- Nginx config: /etc/nginx/sites-available/$DOMAIN_NAME"
echo ""
echo "Useful commands:"
echo "- pm2 logs mainsite-server  # View backend logs"
echo "- pm2 restart mainsite-server  # Restart backend"
echo "- sudo nginx -t  # Test Nginx config"
echo ""
echo "Check deployment-info.txt for more details."