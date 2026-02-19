const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, BatchGetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TASKS_TABLE = process.env.TASKS_TABLE;
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE;

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const userId = event.requestContext.authorizer.claims.sub;
    const userEmail = event.requestContext.authorizer.claims.email;
    const groups = event.requestContext.authorizer.claims['cognito:groups'] || '';
    const isAdmin = groups.includes('Admins');
    
    if (isAdmin) {
      // Admins can see all tasks - query by status
      const statuses = ['open', 'in-progress', 'completed', 'closed'];
      const queryPromises = statuses.map(status =>
        docClient.send(new QueryCommand({
          TableName: TASKS_TABLE,
          IndexName: 'StatusIndex',
          KeyConditionExpression: '#status = :status',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':status': status
          }
        }))
      );
      
      const results = await Promise.all(queryPromises);
      const tasks = results.flatMap(result => result.Items || []);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          tasks,
          count: tasks.length
        })
      };
    } else {
      // Members can only see assigned tasks
      const assignmentsResult = await docClient.send(new QueryCommand({
        TableName: ASSIGNMENTS_TABLE,
        IndexName: 'UserIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }));
      
      const taskIds = assignmentsResult.Items.map(a => a.taskId);
      
      if (taskIds.length === 0) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            tasks: [],
            count: 0
          })
        };
      }
      
      // Fetch all assigned tasks using BatchGet
      const batchSize = 100;
      const tasks = [];
      
      for (let i = 0; i < taskIds.length; i += batchSize) {
        const batch = taskIds.slice(i, i + batchSize);
        const result = await docClient.send(new BatchGetCommand({
          RequestItems: {
            [TASKS_TABLE]: {
              Keys: batch.map(taskId => ({ taskId }))
            }
          }
        }));
        tasks.push(...(result.Responses[TASKS_TABLE] || []));
      }
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          tasks,
          count: tasks.length
        })
      };
    }
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
