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
