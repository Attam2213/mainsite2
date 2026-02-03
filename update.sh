#!/bin/bash

echo "Updating project..."
git pull

echo "Installing dependencies..."
npm install --prefix server
npm install --prefix client

echo "Building frontend..."
npm run build --prefix client

echo "Restarting backend..."
pm2 restart mainsite-server

echo "Update complete!"
