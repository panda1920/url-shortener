import {
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  ValueOrPromise,
} from '@loopback/core';
import {juggler} from '@loopback/repository';

export const mongoConfig = {
    name: "mongo",
    connector: "mongodb",
    url: "",
    host: process.env.MONGO_HOST || "localhost",
    port: process.env.MONGO_PORT || "27017",
    user: process.env.MONGO_USER || null,
    password: process.env.MONGO_PASSWORD || null,
    database: process.env.MONGO_DBNAME || "url-shortener",
    authSource: process.env.MONGO_AUTHDB || "admin",
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
