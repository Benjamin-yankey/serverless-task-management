#!/bin/bash

# Destroy Script - Remove all AWS resources
set -e

echo "⚠️  WARNING: This will destroy all resources!"
echo "This includes:"
echo "  - DynamoDB tables and all data"
echo "  - Lambda functions"
echo "  - API Gateway"
echo "  - Cognito User Pool and users"
echo "  - Amplify app"
echo "  - SNS topics"
echo "  - SNS identities"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Destruction cancelled."
    exit 0
fi

echo ""
echo "🗑️  Starting resource destruction..."

cd terraform

# Determine which tfvars file to use
TFVARS_DEV="environments/dev/terraform.tfvars"
TFVARS_ROOT="terraform.tfvars"

if [ -f "$TFVARS_DEV" ]; then
    TFVARS_FILE="$TFVARS_DEV"
    echo "Using $TFVARS_DEV"
elif [ -f "$TFVARS_ROOT" ]; then
    TFVARS_FILE="$TFVARS_ROOT"
    echo "Using $TFVARS_ROOT"
else
    echo "❌ Error: No terraform.tfvars found"
    echo "Please create terraform/terraform.tfvars or terraform/environments/dev/terraform.tfvars"
    exit 1
fi

echo "📋 Planning destruction..."
terraform plan -destroy -var-file="$TFVARS_FILE"

echo ""
read -p "Proceed with destruction? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo "Destruction cancelled."
    exit 0
fi

echo ""
echo "💥 Destroying resources..."
terraform destroy -auto-approve -var-file="$TFVARS_FILE"

echo ""
echo "✅ All resources destroyed successfully!"
echo ""
echo "Note: Some resources may take a few minutes to fully delete."
echo "Check AWS Console to verify all resources are removed."

cd ..
