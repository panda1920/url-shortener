import * as schemas from './schemas';

export const loginResponseSpec = {
  '200': {
    description: 'login successful',
    content: {
      'application/json': {
        schema: schemas.token
      }
    }
  }
};

export const loginRequestBodySpec = {
  content: {
    'application/json': {
      schema: schemas.userCredentials
    }
  }
};

export const refreshResponseSpec = {
  '200': {
    description: 'token refresh successful',
    content: {
      'application/json': {
        schema: schemas.token
      }
    }
  }
};
