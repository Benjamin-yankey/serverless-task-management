output "pre_signup_lambda_role_arn" {
  description = "Pre-signup Lambda role ARN"
  value       = aws_iam_role.pre_signup_lambda.arn
}

output "create_task_lambda_role_arn" {
  value = aws_iam_role.create_task_lambda.arn
}

output "get_tasks_lambda_role_arn" {
  value = aws_iam_role.get_tasks_lambda.arn
}

output "update_task_lambda_role_arn" {
  value = aws_iam_role.update_task_lambda.arn
}

output "assign_task_lambda_role_arn" {
  value = aws_iam_role.assign_task_lambda.arn
}

output "list_users_lambda_role_arn" {
  value = aws_iam_role.list_users_lambda.arn
}

output "api_gateway_cloudwatch_role_arn" {
  description = "API Gateway CloudWatch role ARN"
  value       = aws_iam_role.api_gateway_cloudwatch.arn
}
