export const token = {
  description: 'schema that includes only token information',
  type: 'object',
  properties: {
    token: { type: 'string' },
  },
  required: ['token']
};

export const userCredentials = {
  description: 'username and password',
  type: 'object',
  properties: {
    username: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8, maxLength: 32 }
  },
  required: ['username', 'password']
};
