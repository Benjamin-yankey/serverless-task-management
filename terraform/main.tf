# SNS/SES Module (must be created first for notifications)
module "ses" {
  source = "./modules/ses"

  project_name = var.project_name
  environment  = var.environment
  admin_email  = var.admin_email
}

# DynamoDB Module (created on terraform apply)
module "dynamodb" {
  source = "./modules/dynamodb"

  project_name = var.project_name
  environment  = var.environment
}

# Amplify Module for frontend (React hosted on AWS Amplify per lab spec)
module "amplify_frontend" {
  source = "./modules/amplify-frontend"

  project_name = var.project_name
  environment  = var.environment
  branch_name  = "main"
}

# Pre-signup Lambda (temporary, needs to be created before Cognito)
data "archive_file" "pre_signup_temp" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/pre-signup/src"
  output_path = "${path.module}/../lambda/pre-signup/function-temp.zip"
}

resource "aws_iam_role" "pre_signup_temp" {
  name = "${var.project_name}-pre-signup-temp-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "pre_signup_temp_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.pre_signup_temp.name
}

resource "aws_lambda_function" "pre_signup_temp" {
  filename         = data.archive_file.pre_signup_temp.output_path
  function_name    = "${var.project_name}-pre-signup-temp-${var.environment}"
  role             = aws_iam_role.pre_signup_temp.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.pre_signup_temp.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 10

  environment {
    variables = {
      ALLOWED_DOMAINS = join(",", var.allowed_email_domains)
    }
  }
}

# Cognito Module
module "cognito" {
  source = "./modules/cognito"

  project_name          = var.project_name
  environment           = var.environment
  cognito_domain_prefix = var.cognito_domain_prefix
  pre_signup_lambda_arn = aws_lambda_function.pre_signup_temp.arn
  
  # OAuth providers (optional)
  google_client_id     = var.google_client_id
  google_client_secret = var.google_client_secret
  github_client_id     = var.github_client_id
  github_client_secret = var.github_client_secret
  callback_urls        = var.callback_urls
  logout_urls          = var.logout_urls

  depends_on = [aws_lambda_function.pre_signup_temp]
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  project_name           = var.project_name
  environment            = var.environment
  tasks_table_arn        = module.dynamodb.tasks_table_arn
  assignments_table_arn  = module.dynamodb.assignments_table_arn
  sns_topic_arn          = module.ses.sns_topic_arn
  cognito_user_pool_arn  = module.cognito.user_pool_arn
  pre_signup_lambda_name = aws_lambda_function.pre_signup_temp.function_name

  depends_on = [module.cognito]
}

# Lambda Module
module "lambda" {
  source = "./modules/lambda"

  project_name                = var.project_name
  environment                 = var.environment
  allowed_email_domains       = var.allowed_email_domains
  pre_signup_lambda_role_arn  = module.iam.pre_signup_lambda_role_arn
  create_task_lambda_role_arn = module.iam.create_task_lambda_role_arn
  get_tasks_lambda_role_arn   = module.iam.get_tasks_lambda_role_arn
  update_task_lambda_role_arn = module.iam.update_task_lambda_role_arn
  assign_task_lambda_role_arn = module.iam.assign_task_lambda_role_arn
  list_users_lambda_role_arn  = module.iam.list_users_lambda_role_arn
  tasks_table_name            = module.dynamodb.tasks_table_name
  assignments_table_name      = module.dynamodb.assignments_table_name
  sns_topic_arn               = module.ses.sns_topic_arn
  user_pool_id                = module.cognito.user_pool_id

  depends_on = [module.iam, module.dynamodb, module.ses]
}

# API Gateway Module
module "api_gateway" {
  source = "./modules/api-gateway"

  project_name                    = var.project_name
  environment                     = var.environment
  cognito_user_pool_arn           = module.cognito.user_pool_arn
  create_task_lambda_arn          = module.lambda.create_task_lambda_arn
  create_task_lambda_invoke_arn   = module.lambda.create_task_lambda_invoke_arn
  get_tasks_lambda_arn            = module.lambda.get_tasks_lambda_arn
  get_tasks_lambda_invoke_arn     = module.lambda.get_tasks_lambda_invoke_arn
  update_task_lambda_arn          = module.lambda.update_task_lambda_arn
  update_task_lambda_invoke_arn   = module.lambda.update_task_lambda_invoke_arn
  assign_task_lambda_arn          = module.lambda.assign_task_lambda_arn
  assign_task_lambda_invoke_arn   = module.lambda.assign_task_lambda_invoke_arn
  list_users_lambda_arn           = module.lambda.list_users_lambda_arn
  list_users_lambda_invoke_arn    = module.lambda.list_users_lambda_invoke_arn
  api_gateway_cloudwatch_role_arn = module.iam.api_gateway_cloudwatch_role_arn

  depends_on = [module.lambda, module.cognito]
}
