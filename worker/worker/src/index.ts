import {ApplicationConfig, WorkerApplication} from './application';
import { UserRepository } from './repositories';
import { User } from './models';
import { PasswordHasherService } from './services/password-hasher.service';
import * as Mybindings from './mybindings';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new WorkerApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  await addTestUser(app);

  return app;
}

async function addTestUser(app: WorkerApplication): Promise<void> {
  if (process.env.NODE_ENV === 'production')
    return;

  const hasher: PasswordHasherService = await app.get(Mybindings.PASSWORD_HASHER_SERVICE);
  const username = 'admin@example.com';
  const password = await hasher.hashPassword('password');
  const testUser = new User({ username, password });
  
  const repo = await app.getRepository(UserRepository);
  const foundUser = await repo.findOne({ where: { username: testUser.username }});
  if (foundUser)
    return;
    
  console.log('Adding test user to database');
  await repo.create(testUser);
}

if (require.main === module) {
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

  // prevent main thread failing when backend DB is not yet online
  const START_ATTEMPT_TIMES = 10;
  const START_ATTEMPT_INTERVAL = 5;

  async function startMain(iterateTimes: number): Promise<void> {
    if (iterateTimes <= 0) {
      console.error('Cannot start the application');
      process.exit(1);
    }

    try {
      await main(config);
    }
    catch(err) {
      console.log(`Failed to start appication; restarting in ${START_ATTEMPT_INTERVAL}s`);
      setTimeout(() => startMain(iterateTimes - 1), START_ATTEMPT_INTERVAL * 1000);
    }
  }

  startMain(START_ATTEMPT_TIMES);
  // main(config).catch(err => {
  //   console.error('Cannot start the application.', err);
  //   process.exit(1);
  // });
}
