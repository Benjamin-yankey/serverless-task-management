output "app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.frontend.id
}

output "app_arn" {
  description = "Amplify App ARN"
  value       = aws_amplify_app.frontend.arn
}

output "default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.frontend.default_domain
}

output "branch_name" {
  description = "Amplify branch name"
  value       = aws_amplify_branch.main.branch_name
}

# URL format: https://<branch>.<app_id>.amplifyapp.com
output "frontend_url" {
  description = "Frontend app URL (AWS Amplify)"
  value       = "https://${var.branch_name}.${aws_amplify_app.frontend.default_domain}"
}
