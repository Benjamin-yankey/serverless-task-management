resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-user-pool-${var.environment}"
  
  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  
  # Auto-verified attributes
  auto_verified_attributes = ["email"]
  
  # Username attributes
  username_attributes = ["email"]
  
  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  
  # Advanced security configuration
  user_pool_add_ons {
    advanced_security_mode = "AUDIT"
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
    invite_message_template {
      email_message = "Welcome {username}! Your temporary password for Task Management is {####}"
      email_subject = "Task Management Signup"
      sms_message   = "Welcome {username}! Your temporary password for Task Management is {####}"
    }
  }

  device_configuration {
    challenge_required_on_new_device      = true
    device_only_remembered_on_user_prompt = true
  }
  
  # MFA configuration
  mfa_configuration = "OPTIONAL"
  
  software_token_mfa_configuration {
    enabled = true
  }
  
  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
  
  # Schema
  schema {
    name                = "email"
    attribute_data_type = "String"
    mutable             = false
    required            = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
  
  schema {
    name                = "name"
    attribute_data_type = "String"
    mutable             = true
    required           = false
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
  
  schema {
    name                = "role"
    attribute_data_type = "String"
    mutable             = true
    
    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }
  
  # Lambda triggers for email domain validation
  lambda_config {
    pre_sign_up = var.pre_signup_lambda_arn
  }
  
  # User pool policies
  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }
  
  tags = {
    Name = "${var.project_name}-user-pool-${var.environment}"
  }
}

# User pool client
resource "aws_cognito_user_pool_client" "web_client" {
  name         = "${var.project_name}-web-client-${var.environment}"
  user_pool_id = aws_cognito_user_pool.main.id
  
  generate_secret = false
  
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]
  
  # OAuth configuration
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  supported_identity_providers         = concat(
    ["COGNITO"],
    var.google_client_id != "" ? ["Google"] : [],
    var.github_client_id != "" ? ["GitHub"] : []
  )
  
  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
  
  access_token_validity  = 60
  id_token_validity      = 60
  refresh_token_validity = 30
  
  prevent_user_existence_errors = "ENABLED"
  
  read_attributes = [
    "email",
    "email_verified",
    "name",
    "custom:role"
  ]
  
  write_attributes = [
    "email",
    "name"
  ]
}

# User pool domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}

# Admin group
resource "aws_cognito_user_group" "admins" {
  name         = "Admins"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Admin users with full access"
  precedence   = 1
}

# Member group
resource "aws_cognito_user_group" "members" {
  name         = "Members"
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Member users with limited access"
  precedence   = 2
}

# Google Identity Provider
resource "aws_cognito_identity_provider" "google" {
  count         = var.google_client_id != "" ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email openid profile"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}

# GitHub Identity Provider
resource "aws_cognito_identity_provider" "github" {
  count         = var.github_client_id != "" ? 1 : 0
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "GitHub"
  provider_type = "OIDC"

  provider_details = {
    authorize_scopes              = "user:email"
    client_id                     = var.github_client_id
    client_secret                 = var.github_client_secret
    attributes_request_method     = "GET"
    oidc_issuer                   = "https://github.com"
    authorize_url                 = "https://github.com/login/oauth/authorize"
    token_url                     = "https://github.com/login/oauth/access_token"
    attributes_url                = "https://api.github.com/user"
    jwks_uri                      = "https://token.actions.githubusercontent.com/.well-known/jwks"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
  }
}
