variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cognito_domain_prefix" {
  description = "Cognito domain prefix"
  type        = string
}

variable "pre_signup_lambda_arn" {
  description = "ARN of pre-signup Lambda function"
  type        = string
}
