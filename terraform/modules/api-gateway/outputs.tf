output "api_id" {
  description = "API Gateway ID"
  value       = aws_api_gateway_rest_api.main.id
}

output "api_endpoint" {
  description = "API Gateway endpoint"
  value       = aws_api_gateway_stage.main.invoke_url
}

output "api_arn" {
  description = "API Gateway ARN"
  value       = aws_api_gateway_rest_api.main.arn
}
