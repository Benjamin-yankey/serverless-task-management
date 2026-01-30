# Serverless Task Management System

A production-grade serverless task management application built on AWS with role-based access control, email notifications, and secure authentication.

## Architecture

- **Frontend**: React.js with TypeScript hosted on **AWS Amplify**
- **Backend**: AWS Lambda functions with Node.js
- **API**: Amazon API Gateway with Cognito authorizers
- **Database**: Amazon DynamoDB (created by Terraform)
- **Authentication**: AWS Cognito with email domain restrictions
- **Notifications**: Amazon SNS/SES for email notifications
- **Infrastructure**: Terraform for IaC

## Features

### Admin Capabilities

- Create, update, assign, and close tasks
- View all tasks in the system
- Assign tasks to members
- Manage task priorities and due dates

### Member Capabilities

- View assigned tasks
- Update task status
- Receive notifications when assigned tasks

### Security

- Email domain restrictions (@amalitech.com, @amalitechtraining.org)
- Mandatory email verification
- JWT token-based authentication
- IAM role-based access control
- API Gateway authorization

## Prerequisites

- AWS Account (Sandbox environment)
- AWS CLI configured
- Terraform >= 1.0
- Node.js >= 18
- npm or yarn

## Setup Instructions

### 1. Clone and Setup

```bash
git clone <repository-url>
cd serverless-task-management
```

### 2. Configure Variables

Create `terraform/terraform.tfvars` (see `terraform/terraform.tfvars.example`):

```hcl
admin_email           = "your-email@amalitech.com"
cognito_domain_prefix = "task-mgmt-yourname-unique"  # Must be globally unique
```

Optional: use `terraform/environments/dev/terraform.tfvars` or set `TF_VAR_admin_email` and `TF_VAR_cognito_domain_prefix`.

### 3. (Optional) Configure Terraform Backend

To use remote state, create `terraform/environments/dev/backend.tfvars` with your S3 bucket and DynamoDB lock table. If omitted, Terraform uses local state.

### 4. Deploy Infrastructure

```bash
./deploy.sh
```

This script will:

1. Initialize Terraform
2. Plan and apply infrastructure (creates **DynamoDB** tables, **AWS Amplify** app, Lambdas, API Gateway, Cognito, etc.)
3. Build the frontend and deploy it to **AWS Amplify** (zip upload + deployment)
4. Print the **frontend app URL** — open it in your browser; you do **not** need to run the app locally

### 5. Verify Email and SNS

1. Check your email for SES verification link
2. Confirm SNS subscription for notifications

### 6. Use the App

Open the **Frontend app URL** printed at the end of `./deploy.sh` (e.g. `https://main.xxxxx.amplifyapp.com`). No need to run `npm start` locally.

## Usage Guide

### First Time Setup

1. **Sign Up**: Create an account with your @amalitech.com or @amalitechtraining.org email
2. **Verify Email**: Check your email for verification code
3. **Assign Role**: Have an admin add you to the appropriate Cognito group:

```bash
   aws cognito-idp admin-add-user-to-group \
       --user-pool-id <USER_POOL_ID> \
       --username user@amalitech.com \
       --group-name Admins
```

### Creating Tasks (Admin Only)

1. Click "Create Task" button
2. Fill in task details
3. Submit to create

### Assigning Tasks (Admin Only)

1. Open a task card
2. Click "Assign User"
3. Enter member's email
4. User receives notification

### Updating Tasks

1. Open task card
2. Click "Update Status"
3. Select new status
4. Save changes
5. All assigned members receive notification

## Project Structure

```
serverless-task-management/
├── terraform/
│   ├── modules/
│   │   ├── cognito/
│   │   ├── dynamodb/
│   │   ├── lambda/
│   │   ├── api-gateway/
│   │   ├── amplify-frontend/
│   │   ├── iam/
│   │   └── ses/
│   ├── environments/dev/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── lambda/
│   ├── pre-signup/
│   ├── create-task/
│   ├── get-tasks/
│   ├── update-task/
│   └── assign-task/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
├── deploy.sh
├── destroy.sh
└── README.md
```

## API Endpoints

| Method | Endpoint               | Description | Auth           |
| ------ | ---------------------- | ----------- | -------------- |
| POST   | /tasks                 | Create task | Admin          |
| GET    | /tasks                 | List tasks  | All            |
| PUT    | /tasks/{taskId}        | Update task | Assigned users |
| POST   | /tasks/{taskId}/assign | Assign task | Admin          |

## Monitoring and Logs

### CloudWatch Logs

- Lambda logs: `/aws/lambda/<function-name>`
- API Gateway logs: `/aws/apigateway/<api-name>`

### DynamoDB

- Tables: `task-management-tasks-dev`, `task-management-assignments-dev`
- Point-in-time recovery enabled
- Encryption at rest enabled

## Troubleshooting

### Email Domain Not Allowed

Ensure you're using @amalitech.com or @amalitechtraining.org email

### Cannot Create Tasks

Verify you're in the Admins Cognito group

### No Tasks Visible

- Admins: Check CloudWatch logs for Lambda errors
- Members: Ensure you've been assigned tasks

### Notifications Not Received

1. Verify SES email identity
2. Confirm SNS subscription
3. Check spam folder

## Cleanup

To destroy all resources:

```bash
./destroy.sh
```

## Security Best Practices

1. Never commit `.env` files
2. Use unique Cognito domain prefixes
3. Rotate credentials regularly
4. Enable MFA for admin users
5. Review CloudWatch logs regularly
6. Use AWS Organizations for account management

## License

MIT License

## Contributors

[Your Name]
