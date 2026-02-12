#!/bin/bash

# Simple Frontend Build Script
# Just builds the frontend - deploy manually via Amplify Console

set -e

echo "🔨 Building frontend..."

cd frontend
npm install
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Build output: frontend/build/"
echo ""
echo "To deploy:"
echo "1. Go to AWS Amplify Console: https://console.aws.amazon.com/amplify"
echo "2. Select your app: d18mwsdpyy8ssk"
echo "3. Click 'main' branch"
echo "4. Click 'Deploy without Git provider'"
echo "5. Upload the 'frontend/build' folder"
echo ""
echo "Or create a zip and upload:"
echo "  cd frontend/build && zip -r ../deploy.zip . && cd ../.."
echo ""
