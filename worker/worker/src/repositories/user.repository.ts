import {DefaultCrudRepository, DataObject, Options} from '@loopback/repository';
import {User, UserRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

import { v4 } from 'uuid';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(User, dataSource);
  }

  create(entity: DataObject<User>, options?: Options): Promise<User> {
    entity.id = v4();
    return super.create(entity, options);
  }
}
