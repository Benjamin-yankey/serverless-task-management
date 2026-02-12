output "pre_signup_lambda_arn" {
  description = "Pre-signup Lambda ARN"
  value       = aws_lambda_function.pre_signup.arn
}

output "pre_signup_lambda_name" {
  description = "Pre-signup Lambda function name"
  value       = aws_lambda_function.pre_signup.function_name
}

output "create_task_lambda_arn" {
  description = "Create task Lambda ARN"
  value       = aws_lambda_function.create_task.arn
}

output "create_task_lambda_invoke_arn" {
  description = "Create task Lambda invoke ARN"
  value       = aws_lambda_function.create_task.invoke_arn
}

output "get_tasks_lambda_arn" {
  description = "Get tasks Lambda ARN"
  value       = aws_lambda_function.get_tasks.arn
}

output "get_tasks_lambda_invoke_arn" {
  description = "Get tasks Lambda invoke ARN"
  value       = aws_lambda_function.get_tasks.invoke_arn
}

output "update_task_lambda_arn" {
  description = "Update task Lambda ARN"
  value       = aws_lambda_function.update_task.arn
}

output "update_task_lambda_invoke_arn" {
  description = "Update task Lambda invoke ARN"
  value       = aws_lambda_function.update_task.invoke_arn
}

output "assign_task_lambda_arn" {
  description = "Assign task Lambda ARN"
  value       = aws_lambda_function.assign_task.arn
}

output "assign_task_lambda_invoke_arn" {
  description = "Assign task Lambda invoke ARN"
  value       = aws_lambda_function.assign_task.invoke_arn
}

output "list_users_lambda_arn" {
  description = "List users Lambda ARN"
  value       = aws_lambda_function.list_users.arn
}

output "list_users_lambda_invoke_arn" {
  description = "List users Lambda invoke ARN"
  value       = aws_lambda_function.list_users.invoke_arn
}
