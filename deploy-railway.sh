#!/bin/bash

# AVRS Platform - Railway Deployment Script
# Deploy AVRS to Railway in 5 minutes

set -e

echo "🚀 AVRS Platform - Railway Deployment"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v railway &> /dev/null; then
    echo -e "${YELLOW}Railway CLI not found. Installing...${NC}"
    npm install -g @railway/cli
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}Git not found. Please install Git.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites OK${NC}"
echo ""

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

echo ""
echo "📦 Creating Railway project..."
railway init --name "avrs-platform"

echo ""
echo "🗄️ Adding PostgreSQL database..."
railway add --service postgresql

echo ""
echo "🚀 Deploying AVRS Platform..."
railway up

echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 30

echo ""
echo "✅ Getting deployment URL..."
RAILWAY_URL=$(railway env | grep RAILWAY_PUBLIC_DOMAIN | cut -d'=' -f2)

echo ""
echo "======================================"
echo -e "${GREEN}✅ AVRS Platform Deployed Successfully!${NC}"
echo "======================================"
echo ""
echo "📍 Application URL: https://${RAILWAY_URL}"
echo "📊 Dashboard: https://${RAILWAY_URL}/dashboard"
echo "📈 Admin: https://${RAILWAY_URL}/admin"
echo ""
echo "🔧 Next Steps:"
echo "1. Visit https://${RAILWAY_URL} to access AVRS"
echo "2. Create your first venture"
echo "3. Launch autonomous operations"
echo "4. Monitor metrics on dashboard"
echo ""
echo "📚 Documentation:"
echo "- README: https://github.com/avrs/platform/blob/main/README.md"
echo "- API: https://github.com/avrs/platform/blob/main/docs/API.md"
echo "- Deployment: https://github.com/avrs/platform/blob/main/DEPLOYMENT.md"
echo ""
echo "🎉 AVRS is now live!"
echo ""
