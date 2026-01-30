export const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
      userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code' as 'code' | 'link' | undefined,
      userAttributes: {
        email: {
          required: true,
        },
      },
      allowGuestAccess: false,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    REST: {
      TaskAPI: {
        endpoint: process.env.REACT_APP_API_ENDPOINT || '',
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
      },
    },
  },
};

export default awsConfig;
