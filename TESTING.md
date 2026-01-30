# Testing Guide

## Prerequisites for Testing

Before running tests, ensure:

1. Infrastructure is deployed
2. Frontend is running
3. You have test accounts ready

## Manual Testing Checklist

### 1. Authentication Tests

#### Test 1.1: Valid Email Domain Signup

**Steps:**

1. Navigate to application
2. Click "Create account"
3. Enter email: `testuser@amalitech.com`
4. Enter password meeting requirements
5. Submit form

**Expected Result:**

- Account created successfully
- Verification code sent to email
- Cannot login until verified

#### Test 1.2: Invalid Email Domain Signup

**Steps:**

1. Click "Create account"
2. Enter email: `testuser@gmail.com`
3. Enter password
4. Submit form

**Expected Result:**

- Error message: "Email domain gmail.com is not allowed"
- Account not created

#### Test 1.3: Email Verification

**Steps:**

1. Create account with valid email
2. Check email for verification code
3. Enter verification code
4. Complete verification

**Expected Result:**

- Account verified successfully
- Can now login

#### Test 1.4: Login with Unverified Account

**Steps:**

1. Create account but don't verify
2. Attempt to login

**Expected Result:**

- Login blocked
- Message prompting to verify email

### 2. Role-Based Access Control Tests

#### Test 2.1: Member Cannot Create Tasks

**Steps:**

1. Login as member user
2. Navigate to dashboard
3. Look for "Create Task" button

**Expected Result:**

- No "Create Task" button visible
- API call returns 403 if attempted

#### Test 2.2: Admin Can Create Tasks

**Steps:**

1. Assign user to Admins group:

```bash
aws cognito-idp admin-add-user-to-group \
    --user-pool-id <USER_POOL_ID> \
    --username admin@amalitech.com \
    --group-name Admins
```

2. Login as admin
3. Click "Create Task" button
4. Fill form and submit

**Expected Result:**

- Task created successfully
- Task visible in dashboard

#### Test 2.3: Member Can Only See Assigned Tasks

**Steps:**

1. Login as admin
2. Create 3 tasks
3. Assign only 1 task to member
4. Login as member
5. View dashboard

**Expected Result:**

- Member sees only 1 assigned task
- Other tasks not visible

### 3. Task Management Tests

#### Test 3.1: Create Task with All Fields

**Steps:**

1. Login as admin
2. Click "Create Task"
3. Fill all fields:
   - Title: "Test Task"
   - Description: "Test Description"
   - Priority: "high"
   - Due Date: Tomorrow's date
4. Submit

**Expected Result:**

- Task created with all fields
- Task appears in dashboard
- All fields displayed correctly

#### Test 3.2: Create Task with Minimum Fields

**Steps:**

1. Login as admin
2. Click "Create Task"
3. Fill only required field (title)
4. Submit

**Expected Result:**

- Task created successfully
- Default values applied (priority: medium, status: open)

#### Test 3.3: Update Task Status

**Steps:**

1. Login as assigned user
2. Open task card
3. Click "Update Status"
4. Change status to "in_progress"
5. Save

**Expected Result:**

- Status updated in database
- Status badge color changes
- Notification sent to admin and other assigned users

#### Test 3.4: Assign Task to User

**Steps:**

1. Login as admin
2. Open task card
3. Click "Assign User"
4. Enter valid user email
5. Submit

**Expected Result:**

- Assignment created in database
- User email appears in "Assigned to" list
- Notification email sent to user

#### Test 3.5: Prevent Duplicate Assignment

**Steps:**

1. Login as admin
2. Assign task to user
3. Attempt to assign same task to same user again

**Expected Result:**

- Error message: "User is already assigned to this task"
- No duplicate assignment created

#### Test 3.6: Cannot Assign to Deactivated User

**Steps:**

1. Deactivate a user in Cognito:

```bash
aws cognito-idp admin-disable-user \
    --user-pool-id <USER_POOL_ID> \
    --username deactivated@amalitech.com
```

2. Login as admin
3. Attempt to assign task to deactivated user

**Expected Result:**

- Error message: "Cannot assign task to deactivated user"
- Assignment not created

### 4. Notification Tests

#### Test 4.1: Task Assignment Notification

**Steps:**

1. Login as admin
2. Create task
3. Assign to member
4. Check member's email

**Expected Result:**

- Email received with:
  - Subject: "New Task Assigned: [Task Title]"
  - Task details included
  - Clear call to action

#### Test 4.2: Status Update Notification

**Steps:**

1. Create task assigned to User A and User B
2. Login as User A
3. Update task status
4. Check User B's and admin's email

**Expected Result:**

- Both User B and admin receive notification
- Email contains old status and new status
- Updated by information included

#### Test 4.3: Multiple Assignees Notification

**Steps:**

1. Create task
2. Assign to 3 different users
3. Update task status as one user
4. Check all other users' emails

**Expected Result:**

- All assigned users except updater receive notification
- Admin receives notification

### 5. Security Tests

#### Test 5.1: Unauthenticated API Access

**Steps:**

1. Get API endpoint from Terraform outputs
2. Make API call without auth token:

```bash
curl -X GET https://your-api-endpoint/tasks
```

**Expected Result:**

- 401 Unauthorized response
- Error message about missing authentication

#### Test 5.2: Invalid Token Access

**Steps:**

1. Make API call with fake token:

```bash
curl -X GET https://your-api-endpoint/tasks \
  -H "Authorization: Bearer fake-token-123"
```

**Expected Result:**

- 401 Unauthorized response
- Token validation failure

#### Test 5.3: Member Accessing Admin Endpoint

**Steps:**

1. Login as member
2. Get auth token from browser DevTools
3. Attempt to create task via API:

```bash
curl -X POST https://your-api-endpoint/tasks \
  -H "Authorization: Bearer <member-token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Unauthorized Task"}'
```

**Expected Result:**

- 403 Forbidden response
- Error: "Only admins can create tasks"

#### Test 5.4: Cross-User Task Access

**Steps:**

1. Create task assigned to User A
2. Login as User B (not assigned)
3. Attempt to update the task

**Expected Result:**

- 403 Forbidden response
- Error: "You are not assigned to this task"

### 6. Data Validation Tests

#### Test 6.1: Empty Task Title

**Steps:**

1. Login as admin
2. Attempt to create task with empty title

**Expected Result:**

- Frontend validation error
- Task not created

#### Test 6.2: Invalid Email Format

**Steps:**

1. Login as admin
2. Attempt to assign task to "notanemail"

**Expected Result:**

- Frontend validation error
- Assignment not created

#### Test 6.3: Non-existent User Assignment

**Steps:**

1. Login as admin
2. Attempt to assign task to "nonexistent@amalitech.com"

**Expected Result:**

- Error: "User not found"
- Assignment not created

### 7. Performance Tests

#### Test 7.1: Large Task List

**Steps:**

1. Create 50+ tasks
2. Navigate to dashboard
3. Measure load time

**Expected Result:**

- Page loads within 3 seconds
- All tasks visible
- No pagination issues (if not implemented)

#### Test 7.2: Concurrent Updates

**Steps:**

1. Open same task in two browsers
2. Update status in both browsers simultaneously

**Expected Result:**

- Last write wins
- Both updates processed
- No data corruption

## Automated API Testing Script

Create test script:

```bash
cat > test-api.sh << 'SCRIPT'
#!/bin/bash

# Configuration
API_ENDPOINT="<YOUR_API_ENDPOINT>"
ADMIN_TOKEN="<YOUR_ADMIN_TOKEN>"
MEMBER_TOKEN="<YOUR_MEMBER_TOKEN>"

echo "========================================"
echo "Task Management API Test Suite"
echo "========================================"

# Test 1: Create Task (Admin)
echo "Test 1: Create Task (Admin)"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT/tasks" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Task",
    "description": "Created via API test",
    "priority": "high"
  }')
echo "Response: $RESPONSE"
TASK_ID=$(echo $RESPONSE | jq -r '.taskId')
echo "Created Task ID: $TASK_ID"
echo ""

# Test 2: Get All Tasks
echo "Test 2: Get All Tasks (Admin)"
RESPONSE=$(curl -s -X GET "$API_ENDPOINT/tasks" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Response: $RESPONSE"
echo ""

# Test 3: Update Task Status
echo "Test 3: Update Task Status"
RESPONSE=$(curl -s -X PUT "$API_ENDPOINT/tasks/$TASK_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }')
echo "Response: $RESPONSE"
echo ""

# Test 4: Assign Task
echo "Test 4: Assign Task"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT/tasks/$TASK_ID/assign" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "member@amalitech.com"
  }')
echo "Response: $RESPONSE"
echo ""

# Test 5: Member Try to Create Task (Should Fail)
echo "Test 5: Member Try to Create Task (Should Fail)"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT/tasks" \
  -H "Authorization: Bearer $MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Task"
  }')
echo "Response: $RESPONSE"
echo ""

# Test 6: Unauthenticated Access (Should Fail)
echo "Test 6: Unauthenticated Access (Should Fail)"
RESPONSE=$(curl -s -X GET "$API_ENDPOINT/tasks")
echo "Response: $RESPONSE"
echo ""

echo "========================================"
echo "Test Suite Complete"
echo "========================================"
SCRIPT

chmod +x test-api.sh
```

## Test Data Setup

```bash
cat > setup-test-data.sh << 'EOF'
#!/bin/bash

# Get Terraform outputs
cd terraform
USER_POOL_ID=$(terraform output -raw user_pool_id)
cd ..

echo "Setting up test data..."

# Create test users
echo "Creating test users..."

# Admin user
aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username admin@amalitech.com \
    --user-attributes Name=email,Value=admin@amalitech.com Name=email_verified,Value=true \
    --temporary-password "TempPass123!" \
    --message-action SUPPRESS

aws cognito-idp admin-add-user-to-group \
    --user-pool-id $USER_POOL_ID \
    --username admin@amalitech.com \
    --group-name Admins

# Member users
for i in {1..3}; do
    aws cognito-idp admin-create-user \
        --user-pool-id $USER_POOL_ID \
        --username "member$i@amalitech.com" \
        --user-attributes Name=email,Value="member$i@amalitech.com" Name=email_verified,Value=true \
        --temporary-password "TempPass123!" \
        --message-action SUPPRESS

    aws cognito-idp admin-add-user-to-group \
        --user-pool-id $USER_POOL_ID \
        --username "member$i@amalitech.com" \
        --group-name Members
done

echo "Test users created!"
echo ""
echo "Users created:"
echo "  - admin@amalitech.com (Admin)"
echo "  - member1@amalitech.com (Member)"
echo "  - member2@amalitech.com (Member)"
echo "  - member3@amalitech.com (Member)"
echo ""
echo "Temporary password for all: TempPass123!"
echo "Users will be prompted to change password on first login"
EOF

chmod +x setup-test-data.sh
```

## Load Testing

```bash
cat > load-test.sh << 'EOF'
#!/bin/bash

# Simple load test using Apache Bench (ab)
# Install: apt-get install apache-bench (Linux) or brew install ab (Mac)

API_ENDPOINT="<YOUR_API_ENDPOINT>"
ADMIN_TOKEN="<YOUR_ADMIN_TOKEN>"

echo "Running load test on GET /tasks endpoint"
echo "100 requests, 10 concurrent"

ab -n 100 -c 10 \
   -H "Authorization: Bearer $ADMIN_TOKEN" \
   "$API_ENDPOINT/tasks"

echo ""
echo "Load test complete!"
EOF

chmod +x load-test.sh
```

## Step 22: CI/CD Pipeline (GitHub Actions)

```bash
mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy Infrastructure

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

env:
  AWS_REGION: us-east-1
  TF_VERSION: 1.5.0

jobs:
  terraform:
    name: Terraform Plan & Apply
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TF_VERSION }}

      - name: Terraform Init
        working-directory: ./terraform
        run: terraform init -backend-config=environments/dev/backend.tfvars

      - name: Terraform Format Check
        working-directory: ./terraform
        run: terraform fmt -check

      - name: Terraform Validate
        working-directory: ./terraform
        run: terraform validate

      - name: Terraform Plan
        working-directory: ./terraform
        run: terraform plan -var-file=environments/dev/terraform.tfvars -out=tfplan

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        working-directory: ./terraform
        run: terraform apply -auto-approve tfplan

  frontend:
    name: Build & Deploy Frontend
    runs-on: ubuntu-latest
    needs: terraform
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build frontend
        working-directory: ./frontend
        env:
          REACT_APP_USER_POOL_ID: ${{ secrets.USER_POOL_ID }}
          REACT_APP_USER_POOL_CLIENT_ID: ${{ secrets.USER_POOL_CLIENT_ID }}
          REACT_APP_API_ENDPOINT: ${{ secrets.API_ENDPOINT }}
          REACT_APP_AWS_REGION: ${{ env.AWS_REGION }}
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      # Optional: Deploy to S3/CloudFront
      # - name: Deploy to S3
      #   run: aws s3 sync ./frontend/build s3://your-bucket-name --delete
EOF

cat > .github/workflows/test.yml << 'EOF'
name: Run Tests

on:
  pull_request:
    branches:
      - main

jobs:
  lint:
    name: Lint Code
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run ESLint
        working-directory: ./frontend
        run: npm run lint --if-present

  terraform-validate:
    name: Validate Terraform
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.5.0

      - name: Terraform Format Check
        working-directory: ./terraform
        run: terraform fmt -check -recursive

      - name: Terraform Init
        working-directory: ./terraform
        run: terraform init -backend=false

      - name: Terraform Validate
        working-directory: ./terraform
        run: terraform validate
EOF
```

## Step 23: Monitoring and Alerting

```bash
cat > terraform/modules/monitoring/main.tf << 'EOF'
# CloudWatch Dashboard
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${var.project_name}-dashboard-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", { stat = "Sum" }],
            [".", "Errors", { stat = "Sum" }],
            [".", "Duration", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "Lambda Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum" }],
            [".", "4XXError", { stat = "Sum" }],
            [".", "5XXError", { stat = "Sum" }],
            [".", "Latency", { stat = "Average" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "API Gateway Metrics"
        }
      },
      {
        type = "metric"
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", { stat = "Sum" }],
            [".", "ConsumedWriteCapacityUnits", { stat = "Sum" }]
          ]
          period = 300
          stat   = "Average"
          region = var.aws_region
          title  = "DynamoDB Metrics"
        }
      }
    ]
  })
}

# CloudWatch Alarms

# Lambda Error Alarm
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors lambda errors"
  alarm_actions       = [var.sns_topic_arn]
}

# API Gateway 5XX Errors
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project_name}-api-5xx-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors API Gateway 5XX errors"
  alarm_actions       = [var.sns_topic_arn]
}

# DynamoDB Throttle Alarm
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "${var.project_name}-dynamodb-throttles-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = "300"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "This metric monitors DynamoDB throttles"
  alarm_actions       = [var.sns_topic_arn]
}
EOF

cat > terraform/modules/monitoring/variables.tf << 'EOF'
variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for alarms"
  type        = string
}
EOF

cat > terraform/modules/monitoring/outputs.tf << 'EOF'
output "dashboard_name" {
  description = "CloudWatch dashboard name"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}
EOF
```

Add monitoring to main.tf:

```bash
cat >> terraform/main.tf << 'EOF'

# Monitoring Module
module "monitoring" {
  source = "./modules/monitoring"

  project_name  = var.project_name
  environment   = var.environment
  aws_region    = var.aws_region
  sns_topic_arn = module.ses.sns_topic_arn

  depends_on = [module.lambda, module.api_gateway, module.dynamodb]
}
EOF
```

## Step 24: Backup and Recovery

```bash
cat > backup.sh << 'EOF'
#!/bin/bash

set -e

echo "========================================="
echo "Backup DynamoDB Tables"
echo "========================================="

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_BUCKET="your-backup-bucket"

cd terraform
TASKS_TABLE=$(terraform output -raw tasks_table_name)
ASSIGNMENTS_TABLE=$(terraform output -raw assignments_table_name)
AWS_REGION=$(terraform output -raw aws_region)
cd ..

# Create backups
echo "Creating backup for $TASKS_TABLE..."
aws dynamodb create-backup \
    --table-name $TASKS_TABLE \
    --backup-name "${TASKS_TABLE}-${TIMESTAMP}" \
    --region $AWS_REGION

echo "Creating backup for $ASSIGNMENTS_TABLE..."
aws dynamodb create-backup \
    --table-name $ASSIGNMENTS_TABLE \
    --backup-name "${ASSIGNMENTS_TABLE}-${TIMESTAMP}" \
    --region $AWS_REGION

echo "Backups created successfully!"

# Export to S3 (optional)
echo "Exporting tables to S3..."
aws dynamodb scan --table-name $TASKS_TABLE --region $AWS_REGION > "tasks_${TIMESTAMP}.json"
aws dynamodb scan --table-name $ASSIGNMENTS_TABLE --region $AWS_REGION > "assignments_${TIMESTAMP}.json"

aws s3 cp "tasks_${TIMESTAMP}.json" "s3://${BACKUP_BUCKET}/backups/"
aws s3 cp "assignments_${TIMESTAMP}.json" "s3://${BACKUP_BUCKET}/backups/"

rm "tasks_${TIMESTAMP}.json" "assignments_${TIMESTAMP}.json"

echo "========================================="
echo "Backup Complete!"
echo "========================================="
EOF

chmod +x backup.sh
```

## Step 25: Environment Variables Management

```bash
cat > setup-env.sh << 'EOF'
#!/bin/bash

echo "Setting up environment variables..."

# Check if Terraform outputs exist
if [ ! -d "terraform" ]; then
    echo "Error: terraform directory not found"
    exit 1
fi

cd terraform

# Get Terraform outputs
if ! terraform output &> /dev/null; then
    echo "Error: No Terraform outputs found. Please run terraform apply first."
    exit 1
fi

API_ENDPOINT=$(terraform output -raw api_endpoint)
USER_POOL_ID=$(terraform output -raw user_pool_id)
USER_POOL_CLIENT_ID=$(terraform output -raw user_pool_client_id)
AWS_REGION=$(terraform output -raw aws_region)

cd ..

# Create frontend .env
cat > frontend/.env << ENV
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
REACT_APP_API_ENDPOINT=$API_ENDPOINT
REACT_APP_AWS_REGION=$AWS_REGION
ENV

echo "Environment variables configured!"
echo ""
echo "API Endpoint: $API_ENDPOINT"
echo "User Pool ID: $USER_POOL_ID"
echo "User Pool Client ID: $USER_POOL_CLIENT_ID"
echo "AWS Region: $AWS_REGION"
EOF

chmod +x setup-env.sh
```

## Step 26: Quick Start Guide

````bash
cat > QUICKSTART.md << 'EOF'
# Quick Start Guide

## Prerequisites Check
```bash
# Check AWS CLI
aws --version

# Check Terraform
terraform --version

# Check Node.js
node --version
npm --version

# Verify AWS credentials
aws sts get-caller-identity
```

## 5-Minute Setup

### 1. Clone and Configure (2 minutes)
```bash
git clone <your-repo>
cd serverless-task-management

# Edit configuration
nano terraform/environments/dev/terraform.tfvars
# Update: admin_email, cognito_domain_prefix

nano terraform/environments/dev/backend.tfvars
# Update: bucket name
```

### 2. Deploy Infrastructure (2 minutes)
```bash
# Run deployment
./deploy.sh

# Wait for completion and note the outputs
```

### 3. Verify and Test (1 minute)
```bash
# Verify SES email (check inbox)
# Confirm SNS subscription (check inbox)

# Setup environment
./setup-env.sh

# Start frontend
cd frontend
npm install
npm start
```

### 4. Create First Admin User
```bash
# In browser, go to http://localhost:3000
# Sign up with your @amalitech.com email
# Verify email

# Add to admin group
cd terraform
USER_POOL_ID=$(terraform output -raw user_pool_id)
aws cognito-idp admin-add-user-to-group \
    --user-pool-id $USER_POOL_ID \
    --username your-email@amalitech.com \
    --group-name Admins
```

### 5. Start Using

1. Refresh browser
2. Click "Create Task"
3. Fill in task details
4. Assign to a member
5. Done!

## Common Issues

### Issue: "Email domain not allowed"
**Solution:** Ensure you're using @amalitech.com or @amalitechtraining.org

### Issue: "Cognito domain already exists"
**Solution:** Change `cognito_domain_prefix` in terraform.tfvars to something unique

### Issue: Cannot see "Create Task" button
**Solution:** Add yourself to Admins group using the command above

### Issue: Not receiving notifications
**Solution:**
1. Verify SES email identity
2. Check spam folder
3. Confirm SNS subscription

## Next Steps

1. Read full README.md
2. Review TESTING.md for comprehensive tests
3. Set up monitoring dashboard
4. Configure backups
5. Review security best practices

## Support

For issues, contact: your-email@amalitech.com
EOF
````

## Step 27: Final Project Checklist

````bash
cat > CHECKLIST.md << 'EOF'
# Project Completion Checklist

## Before Submission

### Infrastructure
- [ ] All Terraform modules created and tested
- [ ] Backend state configuration set up
- [ ] All resources tagged appropriately
- [ ] IAM roles follow least privilege principle
- [ ] Encryption enabled for DynamoDB and logs
- [ ] CloudWatch logging configured
- [ ] Monitoring dashboard created
- [ ] Alarms set up for critical metrics

### Security
- [ ] Cognito email domain restrictions working
- [ ] Email verification mandatory
- [ ] API Gateway has Cognito authorizer
- [ ] Role-based access control tested
- [ ] No hardcoded credentials in code
- [ ] Environment variables properly managed
- [ ] CORS configured correctly
- [ ] All endpoints require authentication

### Functionality
- [ ] Admins can create tasks
- [ ] Admins can assign tasks
- [ ] Members can view assigned tasks only
- [ ] Members can update task status
- [ ] Email notifications working for:
  - [ ] Task assignment
  - [ ] Status updates
- [ ] Duplicate assignments prevented
- [ ] Deactivated users cannot be assigned
- [ ] Task status updates notify all assigned users

### Frontend
- [ ] Authentication flow works
- [ ] Dashboard displays correctly
- [ ] Task creation form validates input
- [ ] Task cards show all information
- [ ] Status updates reflect immediately
- [ ] Assignment feature works for admins
- [ ] Member view shows only assigned tasks
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Responsive design works

### Testing
- [ ] All manual tests passed
- [ ] API endpoints tested
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Notification delivery tested
- [ ] Edge cases handled
- [ ] Error scenarios tested

### Documentation
- [ ] README.md complete
- [ ] QUICKSTART.md created
- [ ] TESTING.md comprehensive
- [ ] Code comments added
- [ ] API documentation included
- [ ] Architecture diagram created (optional)
- [ ] Deployment instructions clear

### Code Quality
- [ ] Code follows best practices
- [ ] No console.logs in production code
- [ ] Error handling comprehensive
- [ ] Input validation implemented
- [ ] TypeScript types defined (frontend)
- [ ] Lambda functions optimized
- [ ] DRY principle followed

### Deployment
- [ ] Terraform apply successful
- [ ] All outputs captured
- [ ] Frontend builds successfully
- [ ] No deployment errors
- [ ] Rollback plan documented

### Cleanup Scripts
- [ ] destroy.sh works correctly
- [ ] All resources cleaned up properly
- [ ] No orphaned resources

## Submission Requirements

- [ ] Git repository clean and organized
- [ ] .gitignore properly configured
- [ ] No sensitive data in repository
- [ ] Clear commit messages
- [ ] Branch structure appropriate
- [ ] README references your AWS sandbox account

## Bonus Features (Optional)

- [ ] CI/CD pipeline configured
- [ ] Automated backups scheduled
- [ ] Load testing performed
- [ ] Performance optimization done
- [ ] Additional security hardening
- [ ] Cost optimization implemented
- [ ] Multi-environment setup (dev/prod)
- [ ] Custom domain configured
- [ ] SSL/TLS certificates

## Final Verification

Before submission, run:
```bash
# Full test cycle
./deploy.sh
./setup-test-data.sh
./test-api.sh

# Manual testing
# - Test authentication
# - Test all user roles
# - Test notifications
# - Test error scenarios

# Cleanup (if needed)
./destroy.sh
```

## Submission Checklist

- [ ] Code pushed to repository
- [ ] README includes AWS account info
- [ ] All documentation complete
- [ ] Screenshots/demo video prepared
- [ ] Terraform state cleaned up
- [ ] AWS resources tagged with your name
- [ ] Cost estimates documented
- [ ] Submitted before deadline (Feb 20, 2026)

Good luck! 🚀
EOF
````

This completes the comprehensive step-by-step guide! You now have:

1. ✅ Complete Terraform infrastructure
2. ✅ All Lambda functions
3. ✅ React frontend with TypeScript
4. ✅ Authentication and authorization
5. ✅ Email notifications
6. ✅ Comprehensive testing guide
7. ✅ Deployment scripts
8. ✅ Monitoring and alerting
9. ✅ CI/CD pipeline
10. ✅ Documentation

**Next Steps:**

1. Review all files created
2. Update terraform.tfvars with your details
3. Run `./deploy.sh`
4. Follow QUICKSTART.md
5. Complete CHECKLIST.md before submission

Need help with any specific part or want to add additional features?
