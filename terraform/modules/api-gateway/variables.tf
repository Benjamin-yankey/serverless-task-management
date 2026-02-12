variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  type        = string
}

variable "create_task_lambda_arn" {
  description = "Create task Lambda ARN"
  type        = string
}

variable "create_task_lambda_invoke_arn" {
  description = "Create task Lambda invoke ARN"
  type        = string
}

variable "get_tasks_lambda_arn" {
  description = "Get tasks Lambda ARN"
  type        = string
}

variable "get_tasks_lambda_invoke_arn" {
  description = "Get tasks Lambda invoke ARN"
  type        = string
}

variable "update_task_lambda_arn" {
  description = "Update task Lambda ARN"
  type        = string
}

variable "update_task_lambda_invoke_arn" {
  description = "Update task Lambda invoke ARN"
  type        = string
}

variable "assign_task_lambda_arn" {
  description = "Assign task Lambda ARN"
  type        = string
}

variable "assign_task_lambda_invoke_arn" {
  description = "Assign task Lambda invoke ARN"
  type        = string
}

variable "list_users_lambda_arn" {
  description = "List users Lambda ARN"
  type        = string
}

variable "list_users_lambda_invoke_arn" {
  description = "List users Lambda invoke ARN"
  type        = string
}

variable "api_gateway_cloudwatch_role_arn" {
  description = "API Gateway CloudWatch role ARN"
  type        = string
}
