output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = module.api_gateway.api_endpoint
}

output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = module.cognito.user_pool_client_id
}

output "user_pool_domain" {
  description = "Cognito User Pool Domain"
  value       = module.cognito.user_pool_domain
}

output "tasks_table_name" {
  description = "DynamoDB Tasks table name"
  value       = module.dynamodb.tasks_table_name
}

output "assignments_table_name" {
  description = "DynamoDB Assignments table name"
  value       = module.dynamodb.assignments_table_name
}

output "sns_topic_arn" {
  description = "SNS Topic ARN"
  value       = module.ses.sns_topic_arn
}

output "aws_region" {
  description = "AWS Region"
  value       = var.aws_region
}

output "amplify_app_id" {
  description = "Amplify App ID (for manual deploy)"
  value       = module.amplify_frontend.app_id
}

output "amplify_branch_name" {
  description = "Amplify branch name"
  value       = module.amplify_frontend.branch_name
}

output "frontend_url" {
  description = "Frontend app URL (AWS Amplify)"
  value       = module.amplify_frontend.frontend_url
}
