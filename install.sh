#!/bin/bash

# Exit on error
set -e

# Ensure we are in the project directory
cd "$(dirname "$0")"

# Update system
echo "Updating system..."
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
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
read -s -p "Enter password for database user 'mainsite_user': " DB_PASSWORD
echo ""
sudo -u postgres psql -c "CREATE DATABASE mainsite_db;" || echo "Database already exists"
sudo -u postgres psql -c "CREATE USER mainsite_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';" || \
sudo -u postgres psql -c "ALTER USER mainsite_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE mainsite_db TO mainsite_user;"

# Create .env file for server
echo "Creating .env file..."
cat > server/.env <<EOF
PORT=5000
DB_NAME=mainsite_db
DB_USER=mainsite_user
DB_PASSWORD=$DB_PASSWORD
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=$(openssl rand -base64 32)
EOF

# Project Setup
echo "Setting up project..."
# Install dependencies
npm install --prefix server
npm install --prefix client

# Build frontend
echo "Building frontend..."
npm run build --prefix client

# Deploy frontend
echo "Deploying frontend..."
sudo mkdir -p /var/www/$DOMAIN_NAME
sudo cp -r client/dist/* /var/www/$DOMAIN_NAME/
sudo chown -R www-data:www-data /var/www/$DOMAIN_NAME
sudo chmod -R 755 /var/www/$DOMAIN_NAME

# Nginx Config
echo "Configuring Nginx..."
read -p "Enter your domain name (e.g. example.com): " DOMAIN_NAME

# Remove default config if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Create config
cat > nginx.conf.temp <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;

    location / {
        root /var/www/$DOMAIN_NAME;
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
EOF

sudo mv nginx.conf.temp /etc/nginx/sites-available/$DOMAIN_NAME
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
