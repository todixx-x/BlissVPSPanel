#!/bin/bash

# BlissPanel Installer
# Senior Principal Systems Engineer Edition

set -e

echo "🚀 Starting BlissPanel Installation..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit 1
fi

# 1. Install Dependencies
echo "📦 Installing system dependencies..."
apt-get update
apt-get install -y golang-go docker.io curl git

# 2. Setup BlissPanel Directory
INSTALL_DIR="/opt/blisspanel"
mkdir -p $INSTALL_DIR

# 3. Build Backend
echo "🔨 Building BlissPanel Backend..."
cd backend
go build -o $INSTALL_DIR/blisspanel-backend .
cd ..

# 4. Copy Frontend Assets
echo "🎨 Copying Frontend Assets..."
mkdir -p $INSTALL_DIR/frontend
cp -r frontend/dist $INSTALL_DIR/frontend/

# 5. Create Systemd Service
echo "⚙️ Configuring Systemd Service..."
cat <<EOF > /etc/systemd/system/blisspanel.service
[Unit]
Description=BlissPanel Web Panel
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=$INSTALL_DIR/blisspanel-backend
Restart=always
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

# 6. Reload and Start
systemctl daemon-reload
systemctl enable blisspanel
# systemctl start blisspanel # Don't start automatically in sandbox

echo "✅ BlissPanel installed successfully!"
echo "BlissPanel is configured to run on port 8080."
