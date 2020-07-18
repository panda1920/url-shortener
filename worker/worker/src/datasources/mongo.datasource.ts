import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';

function createMongoUri(): string {
  const protocol = process.env.MONGO_PROTOCOL || 'mongodb';
  const host = process.env.MONGO_HOST || "localhost";
  const port = process.env.MONGO_PORT || "27017";
  const user = process.env.MONGO_USER || 'mongoadmin';
  const password = process.env.MONGO_PASSWORD || 'password';
  const database = process.env.MONGO_DBNAME || "url-shortener";
  const options = process.env.MONGO_OPTIONS || '';

  return `${protocol}://`
    + `${user}:${password}@`
    // mongodb+srv does not accept ports in its uri
    + (protocol === 'mongodb+srv'
      ? `${host}/${database}${options}`
      : `${host}:${port}/${database}${options}`)
}

export const mongoConfig = {
    name: "mongo",
    connector: "mongodb",
    url: createMongoUri(),
    authSource: process.env.MONGO_AUTHDB || 'admin',
    protocol: process.env.MONGO_PROTOCOL || 'mongodb',
    useNewUrlParser: true
};

@lifeCycleObserver('datasource')
export class MongoDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongo';

  constructor(
    @inject('datasources.config.mongo', {optional: true})
    dsConfig: object = mongoConfig,
  ) {
    super(dsConfig);
  }

  /**
   * Start the datasource when application is started
   */
  start(): ValueOrPromise<void> {
    // Add your logic here to be invoked when the application is started
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
