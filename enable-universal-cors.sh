#!/bin/bash

# Universal CORS enabler - allows all domains to connect
# WARNING: This removes CORS security restrictions - use with caution

echo "🌐 Enabling Universal CORS Access (Allow All Domains)"

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
    echo "Then run: ./enable-universal-cors.sh"
    exit 1
fi

echo "⚠️  WARNING: This will allow ALL domains to access your backend API"
echo "🔓 This removes CORS security restrictions"
echo "📍 Backend VM: $VM_PUBLIC_IP"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "📝 Updating CORS configuration on VM $VM_PUBLIC_IP..."

# Update the .env file on the VM to allow all origins
sshpass -p "$VM_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60 -o ServerAliveCountMax=3 "$VM_USERNAME@$VM_PUBLIC_IP" "
    cd /home/$VM_USERNAME/node-backend &&
    
    # Backup current .env
    cp .env .env.backup-\$(date +%Y%m%d-%H%M%S) &&
    
    # Update CORS_ORIGIN to allow all domains
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=\"*\"|' .env &&
    
    echo '✅ CORS configuration updated to allow ALL domains'
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

# Test the universal CORS configuration
echo "🧪 Testing universal CORS configuration..."

# Test with a random domain
TEST_DOMAINS=("http://example.com" "http://test.local" "https://anydomain.com")

for domain in "${TEST_DOMAINS[@]}"; do
    echo "Testing CORS from: $domain"
    CORS_TEST_RESULT=$(curl -s -H "Origin: $domain" \
         -H "Access-Control-Request-Method: POST" \
         -H "Access-Control-Request-Headers: Content-Type" \
         -X OPTIONS \
         -w "%{http_code}" \
         http://$VM_PUBLIC_IP:5002/api/register 2>/dev/null)
    
    echo "  Response code: $CORS_TEST_RESULT"
done

# Test basic connectivity
echo ""
echo "🌐 Testing basic API connectivity..."
HEALTH_TEST=$(curl -s -w "%{http_code}" http://$VM_PUBLIC_IP:5002/api/health 2>/dev/null)
echo "Health check response code: $HEALTH_TEST"

echo ""
echo "✅ Universal CORS access enabled!"
echo "🌍 ALL domains can now connect to your backend at http://$VM_PUBLIC_IP:5002"
echo "📊 Check backend status: ssh $VM_USERNAME@$VM_PUBLIC_IP 'pm2 status'"
echo ""
echo "⚠️  SECURITY NOTE:"
echo "   - Your API is now accessible from ANY website"
echo "   - This is convenient for development but not recommended for production"
echo "   - Consider restricting CORS origins for production deployments"
echo ""
echo "To revert to restricted CORS, run: ./quick-cors-fix.sh"
