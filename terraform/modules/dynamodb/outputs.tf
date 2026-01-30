output "tasks_table_name" {
  description = "Tasks DynamoDB table name"
  value       = aws_dynamodb_table.tasks.name
}

output "tasks_table_arn" {
  description = "Tasks DynamoDB table ARN"
  value       = aws_dynamodb_table.tasks.arn
}

output "assignments_table_name" {
  description = "Assignments DynamoDB table name"
  value       = aws_dynamodb_table.assignments.name
}

output "assignments_table_arn" {
  description = "Assignments DynamoDB table ARN"
  value       = aws_dynamodb_table.assignments.arn
}
