#!/bin/bash

echo "Updating project..."
git pull

echo "Installing dependencies..."
npm install --prefix server
npm install --prefix client

echo "Building frontend..."
npm run build --prefix client

# Load domain name from somewhere or ask? 
# For update.sh simplicity, let's assume we can just copy to the dir if we know it.
# Or better, just update the code. But since we moved the files to /var/www/$DOMAIN, we need to update them there too.
# But we don't know the domain name here easily unless we saved it.
# Let's try to find it from nginx config.
DOMAIN_NAME=$(ls /etc/nginx/sites-enabled/ | grep -v default | head -n 1)

if [ -n "$DOMAIN_NAME" ]; then
    echo "Updating frontend files for domain: $DOMAIN_NAME"
    sudo cp -r client/dist/* /var/www/$DOMAIN_NAME/
    sudo chown -R www-data:www-data /var/www/$DOMAIN_NAME
else
    echo "Could not detect domain name from Nginx config. Skipping frontend file update in /var/www."
fi

echo "Restarting backend..."
pm2 restart mainsite-server

echo "Update complete!"
