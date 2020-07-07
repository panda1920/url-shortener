import {ApplicationConfig, WorkerApplication} from './application';
import { UserRepository } from './repositories';
import { User } from './models';

export * from './application';

function startMain() {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST,
      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };

  // prevent main program from failing by giving some time for DB to startup
  const START_DELAY_SECONDS = 5;
  const delay = (process.env.NODE_ENV === 'production') ? 0 : START_DELAY_SECONDS * 1000;

  setTimeout(() => {
    main(config).catch(err => {
      console.error('Cannot start the application.', err);
      process.exit(1);
    })
  }, delay);
}

export async function main(options: ApplicationConfig = {}) {
  const app = new WorkerApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  await addTestUser(app);

  return app;
}

async function addTestUser(app: WorkerApplication): Promise<void> {
  if (process.env.NODE_ENV === 'production')
    return;

  const username = 'admin@example.com';
  const password = 'password';
  const testUser = new User({ username, password });
  
  const repo = await app.getRepository(UserRepository);
  const foundUser = await repo.findOne({ where: { username }});
  if (foundUser)
    return;

  console.log('Adding test user to database');
  await repo.create(testUser);
}

if (require.main === module) {
  startMain();
}
