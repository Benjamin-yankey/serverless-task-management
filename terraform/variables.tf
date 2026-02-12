variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "task-management"
}

variable "allowed_email_domains" {
  description = "Allowed email domains for signup"
  type        = list(string)
  default     = ["amalitech.com", "amalitechtraining.org"]
}

variable "admin_email" {
  description = "Admin email for SES verification"
  type        = string
}

variable "cognito_domain_prefix" {
  description = "Cognito domain prefix (must be globally unique)"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth client ID (optional)"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret (optional)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "github_client_id" {
  description = "GitHub OAuth client ID (optional)"
  type        = string
  default     = ""
}

variable "github_client_secret" {
  description = "GitHub OAuth client secret (optional)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "callback_urls" {
  description = "OAuth callback URLs"
  type        = list(string)
  default     = ["http://localhost:3000", "http://localhost:3000/"]
}

variable "logout_urls" {
  description = "OAuth logout URLs"
  type        = list(string)
  default     = ["http://localhost:3000", "http://localhost:3000/"]
}
