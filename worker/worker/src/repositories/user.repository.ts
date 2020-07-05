import {DefaultCrudRepository, DataObject, Options} from '@loopback/repository';
import {User, UserRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

import { PasswordHasherService } from '../services/password-hasher.service';
import * as Mybindings from '../mybindings';

import { v4 } from 'uuid';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
    @inject(Mybindings.PASSWORD_HASHER_SERVICE)
    private passwordHasher: PasswordHasherService,
  ) {
    super(User, dataSource);
  }

  async create(entity: DataObject<User>, options?: Options): Promise<User> {
    entity.id = v4();
    entity.password = await this.passwordHasher.hashPassword(entity.password as string);
    return super.create(entity, options);
  }
}
