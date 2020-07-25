import { get } from '@loopback/rest';

export class HealthController {
  construcotr() {}

  @get('/', {
    responses: {
      '200': {
        description: 'Just a simple api endpoint to respond to HTTP GET healthchecks',
        content: { 'text/plain': { schema: { type: 'string' } } }
      }
    }
  })
  healthCheck() {
    return 'Healthcheck success!';
  }
}
