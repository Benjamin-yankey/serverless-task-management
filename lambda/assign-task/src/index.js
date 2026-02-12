const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { CognitoIdentityProviderClient, AdminGetUserCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { v4: uuidv4 } = require('uuid');

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const snsClient = new SNSClient({});
const cognitoClient = new CognitoIdentityProviderClient({});

const TASKS_TABLE = process.env.TASKS_TABLE;
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE;
const NOTIFICATION_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN;
const USER_POOL_ID = process.env.USER_POOL_ID;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Check if user is admin
    const groups = event.requestContext.authorizer.claims['cognito:groups'] || '';
    if (!groups.includes('Admins')) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Only admins can assign tasks' })
      };
    }
    
    const taskId = event.pathParameters.taskId;
    const body = JSON.parse(event.body);
    const { userEmail } = body;
    
    if (!userEmail || typeof userEmail !== 'string') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Valid userEmail is required' })
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }
    
    // Get task
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
    
    // Verify user exists in Cognito
    let cognitoUser;
    try {
      cognitoUser = await cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: userEmail
      }));
      
      // Check if user is enabled
      if (!cognitoUser.Enabled) {
        return {
          statusCode: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Cannot assign task to deactivated user' })
        };
      }
    } catch (error) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'User not found' })
      };
    }
    
    const userId = cognitoUser.UserAttributes.find(attr => attr.Name === 'sub')?.Value;
    
    // Check if user is already assigned
    const currentAssignedTo = task.assignedTo || [];
    if (currentAssignedTo.includes(userEmail)) {
      return {
        statusCode: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'User is already assigned to this task' })
      };
    }
    
    // Create assignment
    const assignmentId = uuidv4();
    const assignment = {
      assignmentId,
      taskId,
      userId,
      userEmail,
      assignedAt: Date.now(),
      assignedBy: event.requestContext.authorizer.claims.email
    };
    
    await docClient.send(new PutCommand({
      TableName: ASSIGNMENTS_TABLE,
      Item: assignment
    }));
    
    // Update task's assignedTo array
    await docClient.send(new UpdateCommand({
      TableName: TASKS_TABLE,
      Key: { taskId },
      UpdateExpression: 'SET assignedTo = :assignedTo, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':assignedTo': [...currentAssignedTo, userEmail],
        ':updatedAt': Date.now()
      }
    }));
    
    // Send notification
    await snsClient.send(new PublishCommand({
      TopicArn: NOTIFICATION_TOPIC_ARN,
      Subject: `New Task Assigned: ${task.title}`,
      Message: `You have been assigned a new task: "${task.title}"

Task Details:
- Task ID: ${taskId}
- Description: ${task.description}
- Priority: ${task.priority}
- Status: ${task.status}
- Due Date: ${task.dueDate || 'Not set'}
- Assigned by: ${assignment.assignedBy}

Please log in to the Task Management System to view more details.`,
      MessageAttributes: {
        email: {
          DataType: 'String',
          StringValue: userEmail
        }
      }
    }));
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(assignment)
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
