#!/bin/bash

# Quick CORS fix script for immediate resolution
# This script updates the CORS configuration on the running backend without full redeployment

echo "🔧 Quick CORS fix - Enabling universal access (all domains)"

# Check if required environment variables are set
if [ -z "$VM_PUBLIC_IP" ] || [ -z "$VM_USERNAME" ] || [ -z "$VM_PASSWORD" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set: VM_PUBLIC_IP, VM_USERNAME, VM_PASSWORD"
    echo ""
    echo "Example:"
    echo "export VM_PUBLIC_IP=4.206.104.171"
    echo "export VM_USERNAME=your_username"
    echo "export VM_PASSWORD=your_password"
    echo ""
    echo "Then run: ./quick-cors-fix.sh"
    exit 1
fi

echo "📝 Updating CORS configuration on VM $VM_PUBLIC_IP..."

# Update the .env file on the VM with correct CORS settings including the new frontend IP
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    
    # Backup current .env
    cp .env .env.backup-\$(date +%Y%m%d-%H%M%S) &&
    
    # Update CORS_ORIGIN to allow all domains
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=\"*\"|' .env &&
    
    echo '✅ CORS configuration updated in .env file'
    echo 'New CORS_ORIGIN:' &&
    grep CORS_ORIGIN .env
"

if [ $? -ne 0 ]; then
    echo "❌ Failed to update CORS configuration"
    exit 1
fi

# Restart the backend application
echo "🔄 Restarting backend application..."
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    pm2 restart node-backend &&
    echo '✅ Backend restarted successfully'
"

if [ $? -ne 0 ]; then
    echo "❌ Failed to restart backend"
    exit 1
fi

# Wait a moment for the restart to complete
echo "⏳ Waiting for backend to fully restart..."
sleep 8

# Test the CORS configuration with the correct frontend IP
echo "🧪 Testing CORS configuration with frontend IP..."
CORS_TEST_RESULT=$(curl -s -H "Origin: http://4.205.228.59" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     -w "%{http_code}" \
     http://$VM_PUBLIC_IP:5002/api/register)

echo "CORS test response code: $CORS_TEST_RESULT"

# Test basic connectivity
echo "🌐 Testing basic API connectivity..."
HEALTH_TEST=$(curl -s -w "%{http_code}" http://$VM_PUBLIC_IP:5002/api/health)
echo "Health check response code: $HEALTH_TEST"

echo ""
echo "✅ CORS configuration updated and backend restarted!"
echo "🌐 Your frontend at http://4.205.228.59 should now be able to connect to the backend."
echo "📊 Check backend status: ssh $VM_USERNAME@$VM_PUBLIC_IP 'pm2 status'"
echo ""
echo "If you're still having issues, try:"
echo "1. Clear your browser cache and reload the frontend"
echo "2. Check that both VMs are running"
echo "3. Verify network security group rules allow cross-VM communication"
