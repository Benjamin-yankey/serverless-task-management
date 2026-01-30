# Pre-signup Lambda
data "archive_file" "pre_signup" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/pre-signup/src"
  output_path = "${path.module}/../../../lambda/pre-signup/function.zip"
}

resource "aws_lambda_function" "pre_signup" {
  filename         = data.archive_file.pre_signup.output_path
  function_name    = "${var.project_name}-pre-signup-${var.environment}"
  role            = var.pre_signup_lambda_role_arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.pre_signup.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      ALLOWED_DOMAINS = join(",", var.allowed_email_domains)
    }
  }

  tags = {
    Name = "${var.project_name}-pre-signup-${var.environment}"
  }
}

# Create Task Lambda
data "archive_file" "create_task" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/create-task/src"
  output_path = "${path.module}/../../../lambda/create-task/function.zip"
}

resource "null_resource" "create_task_dependencies" {
  triggers = {
    package_json = filemd5("${path.module}/../../../lambda/create-task/src/package.json")
  }

  provisioner "local-exec" {
    command     = "npm install --production"
    working_dir = abspath("${path.module}/../../../lambda/create-task/src")
  }
}

resource "aws_lambda_function" "create_task" {
  filename         = data.archive_file.create_task.output_path
  function_name    = "${var.project_name}-create-task-${var.environment}"
  role            = var.create_task_lambda_role_arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.create_task.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      TASKS_TABLE = var.tasks_table_name
    }
  }

  depends_on = [null_resource.create_task_dependencies]

  tags = {
    Name = "${var.project_name}-create-task-${var.environment}"
  }
}

# Get Tasks Lambda
data "archive_file" "get_tasks" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/get-tasks/src"
  output_path = "${path.module}/../../../lambda/get-tasks/function.zip"
}

resource "null_resource" "get_tasks_dependencies" {
  triggers = {
    package_json = filemd5("${path.module}/../../../lambda/get-tasks/src/package.json")
  }

  provisioner "local-exec" {
    command     = "npm install --production"
    working_dir = abspath("${path.module}/../../../lambda/get-tasks/src")
  }
}

resource "aws_lambda_function" "get_tasks" {
  filename         = data.archive_file.get_tasks.output_path
  function_name    = "${var.project_name}-get-tasks-${var.environment}"
  role            = var.get_tasks_lambda_role_arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.get_tasks.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      TASKS_TABLE       = var.tasks_table_name
      ASSIGNMENTS_TABLE = var.assignments_table_name
    }
  }

  depends_on = [null_resource.get_tasks_dependencies]

  tags = {
    Name = "${var.project_name}-get-tasks-${var.environment}"
  }
}

# Update Task Lambda
data "archive_file" "update_task" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/update-task/src"
  output_path = "${path.module}/../../../lambda/update-task/function.zip"
}

resource "null_resource" "update_task_dependencies" {
  triggers = {
    package_json = filemd5("${path.module}/../../../lambda/update-task/src/package.json")
  }

  provisioner "local-exec" {
    command     = "npm install --production"
    working_dir = abspath("${path.module}/../../../lambda/update-task/src")
  }
}

resource "aws_lambda_function" "update_task" {
  filename         = data.archive_file.update_task.output_path
  function_name    = "${var.project_name}-update-task-${var.environment}"
  role            = var.update_task_lambda_role_arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.update_task.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      TASKS_TABLE            = var.tasks_table_name
      ASSIGNMENTS_TABLE      = var.assignments_table_name
      NOTIFICATION_TOPIC_ARN = var.sns_topic_arn
    }
  }

  depends_on = [null_resource.update_task_dependencies]

  tags = {
    Name = "${var.project_name}-update-task-${var.environment}"
  }
}

# Assign Task Lambda
data "archive_file" "assign_task" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/assign-task/src"
  output_path = "${path.module}/../../../lambda/assign-task/function.zip"
}

resource "null_resource" "assign_task_dependencies" {
  triggers = {
    package_json = filemd5("${path.module}/../../../lambda/assign-task/src/package.json")
  }

  provisioner "local-exec" {
    command     = "npm install --production"
    working_dir = abspath("${path.module}/../../../lambda/assign-task/src")
  }
}

resource "aws_lambda_function" "assign_task" {
  filename         = data.archive_file.assign_task.output_path
  function_name    = "${var.project_name}-assign-task-${var.environment}"
  role            = var.assign_task_lambda_role_arn
  handler         = "index.handler"
  source_code_hash = data.archive_file.assign_task.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 30
  memory_size     = 256

  environment {
    variables = {
      TASKS_TABLE            = var.tasks_table_name
      ASSIGNMENTS_TABLE      = var.assignments_table_name
      NOTIFICATION_TOPIC_ARN = var.sns_topic_arn
      USER_POOL_ID          = var.user_pool_id
    }
  }

  depends_on = [null_resource.assign_task_dependencies]

  tags = {
    Name = "${var.project_name}-assign-task-${var.environment}"
  }
}
