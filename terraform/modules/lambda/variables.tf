variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "allowed_email_domains" {
  description = "Allowed email domains"
  type        = list(string)
}

variable "pre_signup_lambda_role_arn" {
  description = "Pre-signup Lambda role ARN"
  type        = string
}

variable "create_task_lambda_role_arn" {
  type = string
}

variable "get_tasks_lambda_role_arn" {
  type = string
}

variable "update_task_lambda_role_arn" {
  type = string
}

variable "assign_task_lambda_role_arn" {
  type = string
}

variable "list_users_lambda_role_arn" {
  type = string
}

variable "tasks_table_name" {
  description = "Tasks table name"
  type        = string
}

variable "assignments_table_name" {
  description = "Assignments table name"
  type        = string
}

variable "sns_topic_arn" {
  description = "SNS topic ARN"
  type        = string
}


variable "user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}
