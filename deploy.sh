#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="${SCRIPT_DIR}/terraform"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"
BACKEND_CONFIG="${TERRAFORM_DIR}/environments/dev/backend.tfvars"
TFVARS_DEV="${TERRAFORM_DIR}/environments/dev/terraform.tfvars"
TFVARS_ROOT="${TERRAFORM_DIR}/terraform.tfvars"

echo "========================================="
echo "Task Management System Deployment Script"
echo "========================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "Error: Terraform is not installed"
    exit 1
fi

cd "${TERRAFORM_DIR}"

# Initialize Terraform (use backend config only if file exists)
echo "Initializing Terraform..."
if [ -f "${BACKEND_CONFIG}" ]; then
    terraform init -backend-config="${BACKEND_CONFIG}"
else
    echo "No backend config at ${BACKEND_CONFIG} - using local state."
    terraform init
fi

# Plan infrastructure (use tfvars from environments/dev or terraform/terraform.tfvars)
echo "Planning infrastructure..."
if [ -f "${TFVARS_DEV}" ]; then
    terraform plan -var-file="${TFVARS_DEV}" -out=tfplan
elif [ -f "${TFVARS_ROOT}" ]; then
    terraform plan -var-file="${TFVARS_ROOT}" -out=tfplan
else
    if [ -z "${TF_VAR_admin_email}" ] || [ -z "${TF_VAR_cognito_domain_prefix}" ]; then
        echo "Error: Create terraform/terraform.tfvars with admin_email and cognito_domain_prefix (see terraform.tfvars.example), or set:"
        echo "  export TF_VAR_admin_email=your@email.com"
        echo "  export TF_VAR_cognito_domain_prefix=your-unique-prefix"
        exit 1
    fi
    terraform plan -out=tfplan
fi

# Ask for confirmation
read -p "Do you want to apply these changes? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    exit 0
fi

# Apply infrastructure (creates DynamoDB, Amplify, Lambdas, API Gateway, Cognito, etc.)
echo "Applying infrastructure..."
terraform apply tfplan

# Get outputs
echo "Getting Terraform outputs..."
API_ENDPOINT=$(terraform output -raw api_endpoint)
USER_POOL_ID=$(terraform output -raw user_pool_id)
USER_POOL_CLIENT_ID=$(terraform output -raw user_pool_client_id)
AWS_REGION=$(terraform output -raw aws_region)
AMPLIFY_APP_ID=$(terraform output -raw amplify_app_id)
AMPLIFY_BRANCH=$(terraform output -raw amplify_branch_name)
FRONTEND_URL=$(terraform output -raw frontend_url)

cd "${SCRIPT_DIR}"

# Create frontend .env and build
echo "Creating frontend .env and building..."
mkdir -p "${FRONTEND_DIR}"
cat > "${FRONTEND_DIR}/.env" << ENV
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
REACT_APP_API_ENDPOINT=$API_ENDPOINT
REACT_APP_AWS_REGION=$AWS_REGION
ENV

cd "${FRONTEND_DIR}"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
echo "Building frontend..."
npm run build

# Deploy to AWS Amplify (manual deploy: zip + create-deployment + upload + start-deployment)
echo "Deploying frontend to AWS Amplify..."
ZIP_FILE="${SCRIPT_DIR}/build.zip"
( cd build && zip -r -q "${ZIP_FILE}" . )

DEPLOY_JSON=$(aws amplify create-deployment \
  --app-id "${AMPLIFY_APP_ID}" \
  --branch-name "${AMPLIFY_BRANCH}" \
  --output json)
if command -v jq &> /dev/null; then
  JOB_ID=$(echo "${DEPLOY_JSON}" | jq -r '.jobId')
  ZIP_UPLOAD_URL=$(echo "${DEPLOY_JSON}" | jq -r '.zipUploadUrl')
else
  JOB_ID=$(echo "${DEPLOY_JSON}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('jobId',''))")
  ZIP_UPLOAD_URL=$(echo "${DEPLOY_JSON}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('zipUploadUrl',''))")
fi
if [ -z "${JOB_ID}" ] || [ -z "${ZIP_UPLOAD_URL}" ]; then
  echo "Error: Failed to get jobId or zipUploadUrl from Amplify create-deployment"
  exit 1
fi

echo "Uploading build zip to Amplify..."
curl -s -X PUT -T "${ZIP_FILE}" -H "Content-Type: application/zip" "${ZIP_UPLOAD_URL}"

echo "Starting Amplify deployment..."
aws amplify start-deployment \
  --app-id "${AMPLIFY_APP_ID}" \
  --branch-name "${AMPLIFY_BRANCH}" \
  --job-id "${JOB_ID}" \
  --output text

rm -f "${ZIP_FILE}"

echo "Waiting for Amplify deployment to complete (this may take 1–2 minutes)..."
for _ in $(seq 1 24); do
  STATUS=$(aws amplify get-job --app-id "${AMPLIFY_APP_ID}" --branch-name "${AMPLIFY_BRANCH}" --job-id "${JOB_ID}" --query 'job.summary.status' --output text 2>/dev/null || echo "PENDING")
  if [ "${STATUS}" = "SUCCEED" ]; then
    echo "Deployment succeeded."
    break
  fi
  if [ "${STATUS}" = "FAILED" ] || [ "${STATUS}" = "CANCELLED" ]; then
    echo "Deployment failed with status: ${STATUS}"
    exit 1
  fi
  sleep 5
done

cd "${SCRIPT_DIR}"

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo "API Endpoint:         $API_ENDPOINT"
echo "User Pool ID:         $USER_POOL_ID"
echo "User Pool Client ID:  $USER_POOL_CLIENT_ID"
echo ""
echo "Frontend app URL (AWS Amplify):"
echo "  $FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Verify your admin email in AWS SES"
echo "2. Confirm SNS subscription email"
echo "3. Open the app in your browser: $FRONTEND_URL"
echo "========================================="
