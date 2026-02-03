#!/bin/bash

# Exit on error
set -e

echo "Starting update process..."

# Force git update
echo "Fetching latest changes from Git..."
git fetch --all
git reset --hard origin/main

echo "Installing dependencies..."
npm install --prefix server
npm install --prefix client

echo "Building frontend..."
npm run build --prefix client

# Detect domain name
DOMAIN_NAME=$(ls /etc/nginx/sites-enabled/ | grep -v default | head -n 1)

if [ -n "$DOMAIN_NAME" ]; then
    echo "Found domain: $DOMAIN_NAME"
    echo "Updating frontend files in /var/www/$DOMAIN_NAME..."
    
    # Backup old files (optional, but good for safety)
    # sudo cp -r /var/www/$DOMAIN_NAME /var/www/$DOMAIN_NAME.bak
    
    # Copy new files
    sudo cp -r client/dist/* /var/www/$DOMAIN_NAME/
    sudo chown -R www-data:www-data /var/www/$DOMAIN_NAME
    sudo chmod -R 755 /var/www/$DOMAIN_NAME
    
    echo "Frontend files updated successfully."
else
    echo "WARNING: Could not detect domain name from Nginx config (/etc/nginx/sites-enabled/)."
    echo "Frontend files were NOT copied to /var/www/."
    echo "Please check your Nginx configuration."
fi

echo "Restarting backend..."
pm2 describe mainsite-server > /dev/null 2>&1 && pm2 restart mainsite-server || pm2 start server/index.js --name "mainsite-server"

echo "==================================="
echo "   UPDATE COMPLETE SUCCESSFULLY"
echo "==================================="
