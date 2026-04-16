#!/bin/bash
# InfraWatch — VPS Install Script for srv1296983
# Run as root from: /root/
# Usage: bash infrawatch_vps_install.sh
#
# What this does:
#   - Clones InfraWatch to /var/www/infrawatch
#   - Installs dependencies
#   - Creates .env (you edit API keys after)
#   - Builds React frontend
#   - Starts backend on PORT 3001 via PM2
#   - Adds nginx server block for app.infrastructureintel.io
#   - Does NOT touch dissensus or any existing config
#
set -e

echo "================================================"
echo " InfraWatch Deploy — $(date)"
echo " Target: app.infrastructureintel.io → :3001"
echo "================================================"

# ── 1. Check Node version ──────────────────────────
echo ""
echo "[ 1/8 ] Checking Node.js version..."
NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 20 ]; then
  echo "Node.js $NODE_VER detected — upgrading to v20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
else
  echo "Node.js $(node --version) ✅"
fi

# ── 2. Install certbot if missing ─────────────────
echo ""
echo "[ 2/8 ] Checking certbot..."
if ! command -v certbot &> /dev/null; then
  echo "Installing certbot..."
  apt install -y certbot python3-certbot-nginx
else
  echo "certbot $(certbot --version 2>&1 | head -1) ✅"
fi

# ── 3. Clone repo ─────────────────────────────────
echo ""
echo "[ 3/8 ] Cloning InfraWatch..."
mkdir -p /var/www/infrawatch
cd /var/www/infrawatch
git clone https://github.com/RunTimeAdmin/InfraWatch.git .
echo "Cloned ✅"

# ── 4. Backend setup ──────────────────────────────
echo ""
echo "[ 4/8 ] Installing backend dependencies..."
cd /var/www/infrawatch/backend
npm install

# Create .env — USER MUST EDIT API KEYS AFTER
cat > .env << 'EOF'
PORT=3001
NODE_ENV=production
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=REPLACE_WITH_YOUR_HELIUS_KEY
VALIDATORS_APP_API_KEY=REPLACE_WITH_YOUR_VALIDATORS_APP_KEY
DATABASE_URL=
REDIS_URL=
EOF
echo ".env created (edit API keys after this script) ✅"

# ── 5. Frontend build ─────────────────────────────
echo ""
echo "[ 5/8 ] Building React frontend..."
cd /var/www/infrawatch/frontend
npm install
cat > .env.production << 'EOF'
VITE_API_URL=https://app.infrastructureintel.io
EOF
npm run build
echo "Frontend built → /var/www/infrawatch/frontend/dist/ ✅"

# ── 6. PM2 start ──────────────────────────────────
echo ""
echo "[ 6/8 ] Starting backend with PM2 on port 3001..."
cd /var/www/infrawatch/backend
pm2 start server.js --name infrawatch-api
pm2 save
echo "PM2 process started ✅"
echo "  → pm2 logs infrawatch-api   (to watch logs)"
echo "  → pm2 status                (to check health)"

# ── 7. Nginx server block ─────────────────────────
echo ""
echo "[ 7/8 ] Adding nginx config for app.infrastructureintel.io..."
cat > /etc/nginx/sites-available/infrawatch << 'NGINXEOF'
server {
    listen 80;
    server_name app.infrastructureintel.io;

    root /var/www/infrawatch/frontend/dist;
    index index.html;

    # REST API → Node :3001
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.io WebSocket → Node :3001
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }

    # React Router fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
NGINXEOF

ln -sf /etc/nginx/sites-available/infrawatch /etc/nginx/sites-enabled/infrawatch
nginx -t && systemctl reload nginx
echo "Nginx config added and reloaded ✅"
echo "  → dissensus config untouched"

# ── 8. Summary ────────────────────────────────────
echo ""
echo "================================================"
echo " INSTALL COMPLETE"
echo "================================================"
echo ""
echo " Next steps:"
echo ""
echo " 1. EDIT API KEYS:"
echo "    nano /var/www/infrawatch/backend/.env"
echo "    → Replace HELIUS_API_KEY and VALIDATORS_APP_API_KEY"
echo "    → Then: pm2 restart infrawatch-api"
echo ""
echo " 2. ADD DNS A RECORD (if not done yet):"
echo "    hPanel → infrastructureintel.io → DNS"
echo "    A  app  →  $(curl -s ifconfig.me)"
echo ""
echo " 3. TEST HTTP (after DNS propagates):"
echo "    curl http://app.infrastructureintel.io/api/network/current"
echo ""
echo " 4. GET SSL CERT:"
echo "    certbot --nginx -d app.infrastructureintel.io"
echo ""
echo " 5. TEST HTTPS:"
echo "    curl https://app.infrastructureintel.io/api/network/current"
echo "    → Open https://app.infrastructureintel.io in browser"
echo ""
echo " PM2 commands:"
echo "    pm2 status"
echo "    pm2 logs infrawatch-api"
echo "    pm2 restart infrawatch-api"
echo "    pm2 monit"
echo ""
echo " Deploy updates after git push:"
echo "    cd /var/www/infrawatch && git pull && cd frontend && npm run build && cd .. && pm2 restart infrawatch-api"
echo "================================================"