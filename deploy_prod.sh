#!/bin/sh
echo "Pulling latest code"
git pull

echo "Running nom build prod"
npm run build:production

echo "Copying build files"
sudo cp -r dist/* /var/www/tinipo-frontend

echo "Deployment done"
