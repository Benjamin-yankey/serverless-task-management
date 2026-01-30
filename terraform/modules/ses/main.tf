# SNS Topic for notifications
resource "aws_sns_topic" "notifications" {
  name = "${var.project_name}-notifications-${var.environment}"

  tags = {
    Name = "${var.project_name}-notifications-${var.environment}"
  }
}

# SNS Topic Policy
resource "aws_sns_topic_policy" "notifications" {
  arn = aws_sns_topic.notifications.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "SNS:Publish"
        Resource = aws_sns_topic.notifications.arn
      }
    ]
  })
}

# SES Email Identity (for sending emails)
resource "aws_ses_email_identity" "admin" {
  email = var.admin_email
}

# SNS Email Subscription for admin
resource "aws_sns_topic_subscription" "admin_email" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "email"
  endpoint  = var.admin_email
}
