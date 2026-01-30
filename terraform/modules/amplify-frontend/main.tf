# Amplify App - no repository (manual deploy via CLI zip upload)
resource "aws_amplify_app" "frontend" {
  name        = "${var.project_name}-frontend-${var.environment}"
  description = "Task Management frontend (React) - manual deploy"
  platform    = "WEB"

  # SPA: serve index.html for client-side routes (404 -> index.html)
  custom_rule {
    source = "/<*>"
    status = "404-200"
    target = "/index.html"
  }

  tags = {
    Name = "${var.project_name}-frontend-${var.environment}"
  }
}

# Branch for manual deployments (main)
resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.frontend.id
  branch_name = var.branch_name

  enable_auto_build = false
  stage             = "PRODUCTION"

  tags = {
    Name = "${var.project_name}-${var.branch_name}-${var.environment}"
  }
}
