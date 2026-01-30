const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});

const TASKS_TABLE = process.env.TASKS_TABLE;
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE;
const NOTIFICATION_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const taskId = event.pathParameters.taskId;
    const body = JSON.parse(event.body);
    const { status, description, priority } = body;
    
    const userId = event.requestContext.authorizer.claims.sub;
    const userEmail = event.requestContext.authorizer.claims.email;
    const groups = event.requestContext.authorizer.claims['cognito:groups'] || '';
    const isAdmin = groups.includes('Admins');
    
    // Get current task
    const taskResult = await docClient.send(new GetCommand({
      TableName: TASKS_TABLE,
      Key: { taskId }
    }));
    
    if (!taskResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Task not found' })
      };
    }
    
    const task = taskResult.Item;
    
    // Check permissions
    if (!isAdmin) {
      // Check if user is assigned to this task
      const assignmentResult = await docClient.send(new QueryCommand({
        TableName: ASSIGNMENTS_TABLE,
        IndexName: 'TaskIndex',
        KeyConditionExpression: 'taskId = :taskId AND userId = :userId',
        ExpressionAttributeValues: {
          ':taskId': taskId,
          ':userId': userId
        }
      }));
      
      if (!assignmentResult.Items || assignmentResult.Items.length === 0) {
        return {
          statusCode: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'You are not assigned to this task' })
        };
      }
    }
    
    // Build update expression
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    
    if (status) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }
    
    if (description !== undefined && isAdmin) {
      updateExpressions.push('description = :description');
      expressionAttributeValues[':description'] = description;
    }
    
    if (priority && isAdmin) {
      updateExpressions.push('priority = :priority');
      expressionAttributeValues[':priority'] = priority;
    }
    
    updateExpressions.push('updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = Date.now();
    
    // Update task
    const updateResult = await docClient.send(new UpdateCommand({
      TableName: TASKS_TABLE,
      Key: { taskId },
      UpdateExpression: 'SET ' + updateExpressions.join(', '),
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }));
    
    // Send notifications if status changed
    if (status && status !== task.status) {
      // Get all assigned users
      const assignmentsResult = await docClient.send(new QueryCommand({
        TableName: ASSIGNMENTS_TABLE,
        IndexName: 'TaskIndex',
        KeyConditionExpression: 'taskId = :taskId',
        ExpressionAttributeValues: {
          ':taskId': taskId
        }
      }));
      
      const assignedEmails = assignmentsResult.Items.map(a => a.userEmail).filter(e => e !== userEmail);
      
      // Notify assigned members and admin
      if (assignedEmails.length > 0 || task.createdBy) {
        const recipients = [...new Set([...assignedEmails, task.createdBy])];
        
        await snsClient.send(new PublishCommand({
          TopicArn: NOTIFICATION_TOPIC_ARN,
          Subject: `Task Status Updated: ${task.title}`,
          Message: `Task "${task.title}" status has been updated from "${task.status}" to "${status}" by ${userEmail}.
          
Task Details:
- Task ID: ${taskId}
- New Status: ${status}
- Priority: ${task.priority}
- Updated by: ${userEmail}

View task details in the Task Management System.`
        }));
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(updateResult.Attributes)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error', message: error.message })
    };
  }
};
