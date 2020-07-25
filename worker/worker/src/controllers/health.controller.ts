import { get } from '@loopback/rest';

export class HealthController {
  construcotr() {}

  @get('/health', {
    responses: {
      '200': {
        description: 'Endpoint intended to respond to HTTP GET healthchecks',
        content: { 'text/plain': { schema: { type: 'string' } } }
      }
    }
  })
  healthCheck() {
    return 'Healthcheck success!';
  }
}
