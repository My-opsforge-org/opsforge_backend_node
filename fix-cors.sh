#!/bin/bash

# Quick CORS fix script
# This script updates the CORS configuration on the running backend

echo "🔧 Fixing CORS configuration..."

# Check if required environment variables are set
if [ -z "$VM_PUBLIC_IP" ] || [ -z "$VM_USERNAME" ] || [ -z "$VM_PASSWORD" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set: VM_PUBLIC_IP, VM_USERNAME, VM_PASSWORD"
    exit 1
fi

echo "📝 Updating CORS configuration on VM..."

# Update the .env file on the VM with correct CORS settings
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=\"*\"|' .env &&
    echo 'CORS configuration updated in .env file'
"

# Restart the backend application
echo "🔄 Restarting backend application..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    pm2 restart node-backend &&
    echo 'Backend restarted successfully'
"

# Wait a moment for the restart to complete
echo "⏳ Waiting for backend to fully restart..."
sleep 5

# Test the CORS configuration
echo "🧪 Testing CORS configuration..."
curl -H "Origin: http://4.205.228.59" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://$VM_PUBLIC_IP:5002/api/register \
     -v

echo "✅ CORS configuration updated and backend restarted!"
echo "🌐 Your frontend should now be able to connect to the backend."
echo "📊 Check backend status: ssh $VM_USERNAME@$VM_PUBLIC_IP 'pm2 status'"
