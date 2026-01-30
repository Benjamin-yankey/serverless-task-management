variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "branch_name" {
  description = "Amplify branch name (e.g. main)"
  type        = string
  default     = "main"
}
