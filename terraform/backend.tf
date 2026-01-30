terraform {
  # # backend "s3" {
  # #   bucket         = "serverless-task-mgmt-bucket"
  # #   key            = "foundation/terraform.tfstate"
  # #   region         = "eu-west-1"
  # #   dynamodb_table = "terraform-state-lock"
  # #   encrypt        = true
  # }

  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "ServerlessTaskManagement"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
