#!/bin/bash
# InfraWatch Deployment Script
# Run from /var/www/infrawatch

set -e

echo "=== InfraWatch Deploy ==="

# Pull latest
echo "[1/4] Pulling latest code..."
git pull origin main

# Backend
echo "[2/4] Installing backend dependencies..."
cd backend
npm install --production

# Frontend
echo "[3/4] Building frontend..."
cd ../frontend
npm install
npm run build

# Restart
echo "[4/4] Restarting backend..."
pm2 restart infrawatch-api

echo "=== Deploy Complete ==="
echo "Dashboard: https://infrastructureintel.io"
