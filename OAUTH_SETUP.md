# OAuth Setup Guide (Google & GitHub)

This guide explains how to enable Google and GitHub sign-in for your Task Management application.

## Prerequisites

- Google Cloud Console account
- GitHub account
- Your Cognito domain URL (from Terraform outputs)

## Step 1: Get Your Cognito Domain

After deploying your infrastructure, get your Cognito domain:

```bash
cd terraform
terraform output
```

Look for the Cognito domain, it will be something like:
`https://task-mgmt-yourname-unique.auth.eu-west-1.amazoncognito.com`

## Step 2: Setup Google OAuth

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Task Management System
   - User support email: your email
   - Developer contact: your email
6. Select **Application type**: Web application
7. Add **Authorized redirect URIs**:
   ```
   https://YOUR-COGNITO-DOMAIN/oauth2/idpresponse
   ```
   Example: `https://task-mgmt-yourname-unique.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse`

8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 2.2 Configure Google OAuth in Terraform

Add to your `terraform/terraform.tfvars`:

```hcl
google_client_id     = "your-google-client-id.apps.googleusercontent.com"
google_client_secret = "your-google-client-secret"
```

## Step 3: Setup GitHub OAuth

### 3.1 Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: Task Management System
   - **Homepage URL**: Your app URL (e.g., `https://main.xxxxx.amplifyapp.com`)
   - **Authorization callback URL**:
     ```
     https://YOUR-COGNITO-DOMAIN/oauth2/idpresponse
     ```
     Example: `https://task-mgmt-yourname-unique.auth.eu-west-1.amazoncognito.com/oauth2/idpresponse`

4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

### 3.2 Configure GitHub OAuth in Terraform

Add to your `terraform/terraform.tfvars`:

```hcl
github_client_id     = "your-github-client-id"
github_client_secret = "your-github-client-secret"
```

## Step 4: Update Callback URLs

Add your frontend URL to `terraform/terraform.tfvars`:

```hcl
callback_urls = [
  "http://localhost:3000",
  "https://main.xxxxx.amplifyapp.com"  # Your Amplify URL
]

logout_urls = [
  "http://localhost:3000",
  "https://main.xxxxx.amplifyapp.com"  # Your Amplify URL
]
```

## Step 5: Update Frontend Environment

Add to `frontend/.env`:

```bash
REACT_APP_COGNITO_DOMAIN=task-mgmt-yourname-unique.auth.eu-west-1.amazoncognito.com
```

## Step 6: Deploy Changes

```bash
# Deploy infrastructure changes
./deploy.sh

# Or just redeploy frontend if infrastructure is already updated
./deploy-frontend.sh
```

## Step 7: Test OAuth Sign-In

1. Open your application
2. Click on the **Google** or **GitHub** button
3. You'll be redirected to the provider's login page
4. After authentication, you'll be redirected back to your app

## Important Notes

### Email Domain Restrictions

- OAuth users must still use `@amalitech.com` or `@amalitechtraining.org` emails
- The pre-signup Lambda will validate the email domain
- Users with other email domains will be rejected

### First-Time OAuth Users

When a user signs in with Google/GitHub for the first time:
1. A new Cognito user is created automatically
2. They are NOT assigned to any group by default
3. An admin must add them to the "Admins" or "Members" group:

```bash
aws cognito-idp admin-add-user-to-group \
    --user-pool-id <USER_POOL_ID> \
    --username user@amalitech.com \
    --group-name Members \
    --region eu-west-1
```

### Troubleshooting

**Error: "redirect_uri_mismatch"**
- Verify the callback URL in Google/GitHub matches exactly with your Cognito domain
- Include `/oauth2/idpresponse` at the end

**Error: "User is not confirmed"**
- OAuth users are auto-confirmed
- If you see this error, check CloudWatch logs for the pre-signup Lambda

**OAuth button does nothing**
- Check browser console for errors
- Verify `REACT_APP_COGNITO_DOMAIN` is set in `.env`
- Ensure you've redeployed the frontend after adding the environment variable

**Users can't access features**
- OAuth users need to be added to Cognito groups manually
- Use the AWS CLI commands above to assign roles

## Security Considerations

1. **Never commit secrets**: Keep `terraform.tfvars` in `.gitignore`
2. **Rotate credentials**: Regularly rotate OAuth client secrets
3. **Use HTTPS**: Always use HTTPS URLs for production
4. **Limit scopes**: Only request necessary OAuth scopes (email, profile)

## Optional: Disable Email/Password Sign-In

If you want to use ONLY OAuth (no email/password):

1. Update the frontend to hide the email/password form
2. Keep the Cognito configuration as-is (it supports both)

## Complete terraform.tfvars Example

```hcl
admin_email           = "admin@amalitech.com"
cognito_domain_prefix = "task-mgmt-yourname-unique"

# OAuth Configuration (optional)
google_client_id     = "123456789.apps.googleusercontent.com"
google_client_secret = "GOCSPX-xxxxxxxxxxxxx"
github_client_id     = "Iv1.xxxxxxxxxxxxx"
github_client_secret = "xxxxxxxxxxxxxxxxxxxxx"

callback_urls = [
  "http://localhost:3000",
  "https://main.d1234567890.amplifyapp.com"
]

logout_urls = [
  "http://localhost:3000",
  "https://main.d1234567890.amplifyapp.com"
]
```

## Support

For issues:
1. Check CloudWatch logs for Lambda functions
2. Verify OAuth credentials in Google/GitHub consoles
3. Ensure callback URLs match exactly
4. Check Cognito User Pool settings in AWS Console
