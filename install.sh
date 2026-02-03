#!/bin/bash

# Exit on error
set -e

# Update system
echo "Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Install Certbot
echo "Installing Certbot..."
sudo apt-get install -y certbot python3-certbot-nginx

# Install PM2
echo "Installing PM2..."
sudo npm install -g pm2

# Database Setup
echo "Setting up Database..."
sudo -u postgres psql -c "CREATE DATABASE mainsite_db;" || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER mainsite_user WITH ENCRYPTED PASSWORD 'root';" || echo "User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mainsite_db TO mainsite_user;"

# Project Setup
echo "Setting up project..."
# Install dependencies
npm install --prefix server
npm install --prefix client

# Build frontend
echo "Building frontend..."
npm run build --prefix client

# Nginx Config
echo "Configuring Nginx..."
read -p "Enter your domain name (e.g. example.com): " DOMAIN_NAME

# Remove default config if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Create config
# Note: Using $(pwd) assumes script is run from project root
PROJECT_ROOT=$(pwd)

sudo bash -c "cat > /etc/nginx/sites-available/$DOMAIN_NAME <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        root $PROJECT_ROOT/client/dist;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF"

sudo ln -sf /etc/nginx/sites-available/$DOMAIN_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL
echo "Obtaining SSL certificate..."
sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos -m admin@$DOMAIN_NAME

# Start Backend
echo "Starting Backend..."
cd server
pm2 start index.js --name "mainsite-server"
pm2 save
pm2 startup

echo "Installation complete!"
echo "Your website should be live at https://$DOMAIN_NAME"
