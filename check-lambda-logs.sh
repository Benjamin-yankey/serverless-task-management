#!/bin/bash

echo "Fetching latest CloudWatch logs for assign-task Lambda..."
aws logs tail /aws/lambda/task-management-assign-task-dev --follow --region eu-west-1
