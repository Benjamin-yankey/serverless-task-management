const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TASKS_TABLE = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Check if user is admin
    const groups = event.requestContext.authorizer.claims['cognito:groups'];
    if (!groups || !groups.includes('Admins')) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Only admins can create tasks' })
      };
    }
    
    const body = JSON.parse(event.body);
    const { title, description, priority = 'medium', dueDate } = body;
    
    if (!title || typeof title !== 'string' || title.trim().length < 3 || title.length > 100) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Title must be between 3 and 100 characters' })
      };
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (priority && !validPriorities.includes(priority.toLowerCase())) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Invalid priority. Must be low, medium, or high.' })
      };
    }

    if (description && (typeof description !== 'string' || description.length > 1000)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Description must be less than 1000 characters' })
      };
    }
    
    const taskId = uuidv4();
    const now = Date.now();
    const createdBy = event.requestContext.authorizer.claims.email;
    
    const task = {
      taskId,
      title,
      description: description || '',
      status: 'open',
      priority,
      dueDate: dueDate || null,
      createdBy,
      createdAt: now,
      updatedAt: now,
      assignedTo: []
    };
    
    await docClient.send(new PutCommand({
      TableName: TASKS_TABLE,
      Item: task
    }));
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(task)
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
