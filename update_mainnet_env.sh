#!/bin/bash

# 🚀 KUSTODIA MAINNET ENVIRONMENT VARIABLES UPDATE SCRIPT
# Run this script to update Heroku environment variables for mainnet deployment

echo "🚀 Updating Kustodia Backend Environment Variables for Mainnet..."

# Heroku App Name
APP_NAME="kustodia-backend-f991a7cb1824"

echo "📊 Setting Database Configuration..."
heroku config:set DATABASE_URL="postgres://uchthfr0mvdlnac0:p7986abf93c3b7a0360729b52aec53ae7f0f5cf4af3244cd002a26a7670f566a@c7s7nzkb1hf97-cluster-czn5k6tjg7-ca-east-1-do.amazonaws.com:5432/d6qtm8crafubei" --app $APP_NAME

echo "🔗 Setting Blockchain Configuration (Arbitrum One Mainnet)..."
heroku config:set ETH_RPC_URL="https://arb1.arbitrum.io/rpc" --app $APP_NAME
heroku config:set ARBITRUM_SEPOLIA_RPC_URL="https://arb1.arbitrum.io/rpc" --app $APP_NAME

echo "🌐 Setting Frontend URL..."
heroku config:set FRONTEND_URL="https://kustodia.mx" --app $APP_NAME

echo "🔒 Setting Node Environment..."
heroku config:set NODE_ENV="production" --app $APP_NAME

echo "📧 Setting Email Configuration..."
heroku config:set EMAIL_FROM="no-reply@kustodia.mx" --app $APP_NAME

echo "🏦 Setting Platform Commission Email..."
heroku config:set PLATFORM_COMMISSION_EMAIL="platform-commission@kustodia.com" --app $APP_NAME

echo "⚠️  MANUAL UPDATES REQUIRED:"
echo "   1. UNIVERSAL_ASSET_CONTRACT_ADDRESS=<DEPLOY_NEW_CONTRACT>"
echo "   2. MXNB_CONTRACT_ADDRESS=<DEPLOY_NEW_CONTRACT>"
echo "   3. ESCROW_PRIVATE_KEY=<NEW_PRODUCTION_KEY>"
echo "   4. KUSTODIA_PRIVATE_KEY=<NEW_PRODUCTION_KEY>"
echo "   5. JWT_SECRET=<GENERATE_NEW_256_BIT_SECRET>"
echo "   6. MULTISIG_ADMIN_1_ADDRESS=<NEW_PRODUCTION_ADDRESS>"
echo "   7. MULTISIG_ADMIN_2_ADDRESS=<NEW_PRODUCTION_ADDRESS>"
echo "   8. MULTISIG_ADMIN_1_PRIVATE_KEY=<NEW_PRODUCTION_KEY>"
echo "   9. MULTISIG_ADMIN_2_PRIVATE_KEY=<NEW_PRODUCTION_KEY>"
echo "   10. JUNO_CLIENT_API_KEY=<PRODUCTION_JUNO_KEY>"
echo "   11. JUNO_CLIENT_SECRET=<PRODUCTION_JUNO_SECRET>"
echo "   12. JUNO_WALLET=<PRODUCTION_JUNO_WALLET>"

echo ""
echo "🎯 NETLIFY ENVIRONMENT VARIABLES TO UPDATE:"
echo "   1. NEXT_PUBLIC_API_BASE=https://kustodia-backend-f991a7cb1824.herokuapp.com"
echo "   2. NEXT_PUBLIC_API_URL=https://kustodia-backend-f991a7cb1824.herokuapp.com"
echo "   3. BACKEND_URL=https://kustodia-backend-f991a7cb1824.herokuapp.com"
echo "   4. NEXT_PUBLIC_CHAIN_ID=eip155:42161"
echo "   5. NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://arb1.arbitrum.io/rpc"
echo "   6. NEXT_PUBLIC_MXNB_CONTRACT_ADDRESS=<MAINNET_CONTRACT>"
echo "   7. NEXT_PUBLIC_ESCROW3_CONTRACT_ADDRESS=<MAINNET_CONTRACT>"
echo "   8. NEXT_PUBLIC_PORTAL_API_KEY=<PRODUCTION_PORTAL_KEY>"
echo "   9. NEXT_PUBLIC_PORTAL_CLIENT_ID=<PRODUCTION_PORTAL_CLIENT_ID>"

echo ""
echo "✅ Basic environment variables updated!"
echo "⚠️  Please manually update the variables listed above with production values."
echo "🔐 NEVER commit production private keys to git!"
echo ""
echo "🚀 Ready to deploy to mainnet once all variables are updated!"
