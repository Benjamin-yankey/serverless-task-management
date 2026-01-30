variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tasks_table_arn" {
  description = "Tasks table ARN"
  type        = string
}

variable "assignments_table_arn" {
  description = "Assignments table ARN"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito user pool ARN"
  type        = string
}

variable "pre_signup_lambda_name" {
  description = "Pre-signup Lambda function name"
  type        = string
}
