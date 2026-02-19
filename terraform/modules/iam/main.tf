# Lambda execution role for pre-signup
resource "aws_iam_role" "pre_signup_lambda" {
  name = "${var.project_name}-pre-signup-lambda-${var.environment}"

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

resource "aws_iam_role_policy_attachment" "pre_signup_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.pre_signup_lambda.name
}

# Lambda execution roles for specific task operations (Least Privilege)

# Role for Create Task
resource "aws_iam_role" "create_task_lambda" {
  name = "${var.project_name}-create-task-lambda-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "create_task_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.create_task_lambda.name
}

resource "aws_iam_role_policy" "create_task_dynamodb" {
  name = "${var.project_name}-create-task-dynamodb-${var.environment}"
  role = aws_iam_role.create_task_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["dynamodb:PutItem"]
      Resource = [var.tasks_table_arn]
    }]
  })
}

# Role for Get Tasks
resource "aws_iam_role" "get_tasks_lambda" {
  name = "${var.project_name}-get-tasks-lambda-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "get_tasks_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.get_tasks_lambda.name
}

resource "aws_iam_role_policy" "get_tasks_dynamodb" {
  name = "${var.project_name}-get-tasks-dynamodb-${var.environment}"
  role = aws_iam_role.get_tasks_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["dynamodb:Query", "dynamodb:BatchGetItem"]
      Resource = [var.tasks_table_arn, "${var.tasks_table_arn}/index/*", var.assignments_table_arn, "${var.assignments_table_arn}/index/*"]
    }]
  })
}

# Role for Update Task
resource "aws_iam_role" "update_task_lambda" {
  name = "${var.project_name}-update-task-lambda-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "update_task_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.update_task_lambda.name
}

resource "aws_iam_role_policy" "update_task_dynamodb" {
  name = "${var.project_name}-update-task-dynamodb-${var.environment}"
  role = aws_iam_role.update_task_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:GetItem", "dynamodb:UpdateItem"]
        Resource = [var.tasks_table_arn, var.assignments_table_arn]
      }
    ]
  })
}

resource "aws_iam_role_policy" "update_task_sns" {
  name = "${var.project_name}-update-task-sns-${var.environment}"
  role = aws_iam_role.update_task_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["sns:Publish"]
      Resource = var.sns_topic_arn
    }]
  })
}

# Role for Assign Task
resource "aws_iam_role" "assign_task_lambda" {
  name = "${var.project_name}-assign-task-lambda-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "assign_task_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.assign_task_lambda.name
}

resource "aws_iam_role_policy" "assign_task_dynamodb" {
  name = "${var.project_name}-assign-task-dynamodb-${var.environment}"
  role = aws_iam_role.assign_task_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
        Resource = [var.tasks_table_arn, var.assignments_table_arn]
      }
    ]
  })
}

resource "aws_iam_role_policy" "assign_task_cognito" {
  name = "${var.project_name}-assign-task-cognito-${var.environment}"
  role = aws_iam_role.assign_task_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["cognito-idp:AdminGetUser"]
      Resource = var.cognito_user_pool_arn
    }]
  })
}

resource "aws_iam_role_policy" "assign_task_sns" {
  name = "${var.project_name}-assign-task-sns-${var.environment}"
  role = aws_iam_role.assign_task_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["sns:Publish"]
      Resource = var.sns_topic_arn
    }]
  })
}

# API Gateway CloudWatch role
resource "aws_iam_role" "api_gateway_cloudwatch" {
  name = "${var.project_name}-api-gateway-cloudwatch-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_gateway_cloudwatch" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  role       = aws_iam_role.api_gateway_cloudwatch.name
}

# Role for List Users
resource "aws_iam_role" "list_users_lambda" {
  name = "${var.project_name}-list-users-lambda-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "list_users_lambda_basic" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  role       = aws_iam_role.list_users_lambda.name
}

resource "aws_iam_role_policy" "list_users_cognito" {
  name = "${var.project_name}-list-users-cognito-${var.environment}"
  role = aws_iam_role.list_users_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["cognito-idp:ListUsers", "cognito-idp:AdminListGroupsForUser"]
      Resource = var.cognito_user_pool_arn
    }]
  })
}

# Cognito permission to invoke pre-signup lambda
resource "aws_lambda_permission" "cognito_pre_signup" {
  statement_id  = "AllowExecutionFromCognito"
  action        = "lambda:InvokeFunction"
  function_name = var.pre_signup_lambda_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = var.cognito_user_pool_arn
}
