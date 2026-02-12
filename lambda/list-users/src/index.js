const { CognitoIdentityProviderClient, ListUsersCommand, AdminListGroupsForUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  try {
    const userPoolId = process.env.USER_POOL_ID;
    
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: userPoolId,
      Limit: 60
    });
    
    const usersResponse = await client.send(listUsersCommand);
    
    const usersWithGroups = await Promise.all(
      usersResponse.Users.map(async (user) => {
        try {
          const groupsCommand = new AdminListGroupsForUserCommand({
            UserPoolId: userPoolId,
            Username: user.Username
          });
          const groupsResponse = await client.send(groupsCommand);
          
          const email = user.Attributes.find(attr => attr.Name === 'email')?.Value || '';
          const name = user.Attributes.find(attr => attr.Name === 'name')?.Value || email.split('@')[0];
          
          return {
            username: user.Username,
            email,
            name,
            status: user.UserStatus,
            enabled: user.Enabled,
            groups: groupsResponse.Groups.map(g => g.GroupName),
            createdAt: user.UserCreateDate
          };
        } catch (error) {
          console.error(`Error fetching groups for user ${user.Username}:`, error);
          return null;
        }
      })
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ users: usersWithGroups.filter(u => u !== null) })
    };
  } catch (error) {
    console.error('Error listing users:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Failed to list users' })
    };
  }
};
