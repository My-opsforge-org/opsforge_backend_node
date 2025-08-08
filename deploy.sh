#!/bin/bash

# Node.js Backend Deployment Script
# This script can be used to manually deploy the Node.js backend to the VM

set -e

echo "🚀 Starting Node.js Backend Deployment..."

# Check if required environment variables are set
if [ -z "$VM_PUBLIC_IP" ] || [ -z "$VM_USERNAME" ] || [ -z "$VM_PASSWORD" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set: VM_PUBLIC_IP, VM_USERNAME, VM_PASSWORD"
    exit 1
fi

# Test SSH connection first
echo "🔍 Testing SSH connection to VM..."
if ! sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ServerAliveInterval=30 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    echo "❌ SSH connection failed!"
    echo "Please check:"
    echo "1. VM is running and accessible"
    echo "2. IP address is correct: $VM_PUBLIC_IP"
    echo "3. Username and password are correct"
    echo "4. SSH service is running on VM"
    echo "5. Firewall allows SSH connections (port 22)"
    exit 1
fi
echo "✅ SSH connection successful!"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test

# Create logs directory
mkdir -p logs

# Deploy to VM
echo "🖥️  Deploying to VM..."

# Clean and create directory on VM
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    rm -rf /home/$VM_USERNAME/node-backend &&
    mkdir -p /home/$VM_USERNAME/node-backend
"

# Copy code to VM
echo "📁 Copying code to VM..."
sshpass -p "$VM_PASSWORD" scp -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 -r . "$VM_USERNAME@$VM_PUBLIC_IP:/home/$VM_USERNAME/node-backend"

# Install Node.js and dependencies on VM
echo "🔧 Installing Node.js and dependencies on VM..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - &&
    sudo apt-get install -y nodejs &&
    npm ci --production &&
    sudo npm install -g pm2
"

# Create environment file on VM
echo "⚙️  Creating environment file on VM..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    cat > .env << 'EOF'
NODE_ENV=production
PORT=5002
POSTGRES_HOST=$POSTGRES_HOST
POSTGRES_PORT=$POSTGRES_PORT
POSTGRES_DB=$POSTGRES_DB
POSTGRES_USER=$POSTGRES_USER
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET_KEY=$JWT_SECRET_KEY
CORS_ORIGIN=http://localhost:3000,http://4.205.220.45,http://your-frontend-domain.com
EOF"

# Run database migrations
echo "🗄️  Running database migrations..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    export POSTGRES_HOST='$POSTGRES_HOST' &&
    export POSTGRES_PORT='$POSTGRES_PORT' &&
    export POSTGRES_DB='$POSTGRES_DB' &&
    export POSTGRES_USER='$POSTGRES_USER' &&
    export POSTGRES_PASSWORD='$POSTGRES_PASSWORD' &&
    npx sequelize-cli db:migrate
"

# Start application with PM2
echo "🚀 Starting application with PM2..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    pm2 delete node-backend || true &&
    pm2 start ecosystem.config.js --env production &&
    pm2 save &&
    pm2 startup
"

# Check deployment status
echo "✅ Checking deployment status..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    pm2 status &&
    curl -f http://localhost:5002 || echo 'App not responding yet'
"

echo "🎉 Deployment completed!"
echo "📊 Check PM2 status: ssh $VM_USERNAME@$VM_PUBLIC_IP 'pm2 status'"
echo "📝 Check logs: ssh $VM_USERNAME@$VM_PUBLIC_IP 'pm2 logs node-backend'"
echo "🌐 App URL: http://$VM_PUBLIC_IP:5002" 