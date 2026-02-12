#!/bin/bash

# Frontend Deployment Script
set -e

echo "🚀 Starting frontend deployment..."

cd frontend
echo "📦 Installing dependencies..."
npm install

echo "🔨 Building React application..."
npm run build

echo "📤 Preparing deployment package..."
cd build
zip -r ../frontend-build.zip . > /dev/null
cd ..

echo "☁️  Deploying to AWS Amplify..."
cd ../terraform

APP_ID=$(terraform output -raw amplify_app_id 2>/dev/null)
BRANCH_NAME=$(terraform output -raw amplify_branch_name 2>/dev/null)

if [ -z "$APP_ID" ] || [ -z "$BRANCH_NAME" ]; then
    echo "❌ Error: Could not retrieve Amplify configuration"
    exit 1
fi

echo "App ID: $APP_ID"
echo "Branch: $BRANCH_NAME"

# Create deployment
DEPLOYMENT_JSON=$(aws amplify create-deployment \
    --app-id "$APP_ID" \
    --branch-name "$BRANCH_NAME" \
    --output json)

UPLOAD_URL=$(echo "$DEPLOYMENT_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['zipUploadUrl'])")
JOB_ID=$(echo "$DEPLOYMENT_JSON" | python3 -c "import sys, json; print(json.load(sys.stdin)['jobId'])")

echo "Job ID: $JOB_ID"

echo "📤 Uploading build artifacts..."
curl -H "Content-Type: application/zip" \
     --data-binary @../frontend/frontend-build.zip \
     "$UPLOAD_URL"

echo ""
echo "⏳ Waiting for deployment..."
while true; do
    STATUS=$(aws amplify get-job \
        --app-id "$APP_ID" \
        --branch-name "$BRANCH_NAME" \
        --job-id "$JOB_ID" \
        --query 'job.summary.status' \
        --output text)
    
    if [ "$STATUS" = "SUCCEED" ]; then
        echo "✅ Deployment completed!"
        break
    elif [ "$STATUS" = "FAILED" ] || [ "$STATUS" = "CANCELLED" ]; then
        echo "❌ Deployment failed: $STATUS"
        exit 1
    else
        echo "Status: $STATUS"
        sleep 10
    fi
done

FRONTEND_URL=$(terraform output -raw frontend_url 2>/dev/null)
echo ""
echo "✅ Frontend deployed successfully!"
echo "🌐 URL: $FRONTEND_URL"

rm -f ../frontend/frontend-build.zip
cd ..
