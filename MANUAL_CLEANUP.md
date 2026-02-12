# Manual Resource Cleanup Guide

If you don't have Terraform destroy permissions, delete resources manually via AWS Console:

## 1. AWS Amplify
- Go to: https://console.aws.amazon.com/amplify
- Select app: `d18mwsdpyy8ssk`
- Click "Actions" → "Delete app"

## 2. API Gateway
- Go to: https://console.aws.amazon.com/apigateway
- Select: `task-management-api-dev`
- Click "Actions" → "Delete"

## 3. Lambda Functions
- Go to: https://console.aws.amazon.com/lambda
- Delete these functions:
  - `task-management-pre-signup-temp-dev`
  - `task-management-create-task-dev`
  - `task-management-get-tasks-dev`
  - `task-management-update-task-dev`
  - `task-management-assign-task-dev`

## 4. Cognito User Pool
- Go to: https://console.aws.amazon.com/cognito
- Select user pool (check outputs for ID)
- Click "Delete user pool"

## 5. DynamoDB Tables
- Go to: https://console.aws.amazon.com/dynamodb
- Delete tables:
  - `task-management-tasks-dev`
  - `task-management-assignments-dev`

## 6. SNS Topic
- Go to: https://console.aws.amazon.com/sns
- Delete topic: `task-management-notifications-dev`

## 7. SNS Email Identity
- Go to: https://console.aws.amazon.com/sns
- Delete verified email identity

## 8. IAM Roles
- Go to: https://console.aws.amazon.com/iam
- Delete roles starting with `task-management-`

## 9. CloudWatch Log Groups
- Go to: https://console.aws.amazon.com/cloudwatch
- Delete log groups: `/aws/lambda/task-management-*`

## Note
Delete resources in this order to avoid dependency issues. Some resources may take a few minutes to delete.
