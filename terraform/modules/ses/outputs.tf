output "sns_topic_arn" {
  description = "SNS topic ARN"
  value       = aws_sns_topic.notifications.arn
}

output "ses_email_identity_arn" {
  description = "SES email identity ARN"
  value       = aws_ses_email_identity.admin.arn
}
