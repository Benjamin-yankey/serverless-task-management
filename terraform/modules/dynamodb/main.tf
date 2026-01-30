resource "aws_dynamodb_table" "tasks" {
  name           = "${var.project_name}-tasks-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "taskId"
  
  attribute {
    name = "taskId"
    type = "S"
  }
  
  attribute {
    name = "status"
    type = "S"
  }
  
  attribute {
    name = "createdAt"
    type = "N"
  }
  
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }
  
  ttl {
    attribute_name = "ttl"
    enabled        = false
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "${var.project_name}-tasks-${var.environment}"
  }
}

resource "aws_dynamodb_table" "assignments" {
  name           = "${var.project_name}-assignments-${var.environment}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "assignmentId"
  
  attribute {
    name = "assignmentId"
    type = "S"
  }
  
  attribute {
    name = "taskId"
    type = "S"
  }
  
  attribute {
    name = "userId"
    type = "S"
  }
  
  global_secondary_index {
    name            = "TaskIndex"
    hash_key        = "taskId"
    range_key       = "userId"
    projection_type = "ALL"
  }
  
  global_secondary_index {
    name            = "UserIndex"
    hash_key        = "userId"
    range_key       = "taskId"
    projection_type = "ALL"
  }
  
  point_in_time_recovery {
    enabled = true
  }
  
  server_side_encryption {
    enabled = true
  }
  
  tags = {
    Name = "${var.project_name}-assignments-${var.environment}"
  }
}
