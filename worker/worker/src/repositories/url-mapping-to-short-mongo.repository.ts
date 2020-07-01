import {DefaultCrudRepository, DataObject, Options} from '@loopback/repository';
import {UrlMappingToShort, UrlMappingToShortRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

import { v4 } from 'uuid';

export class UrlMappingToShortMongoRepository extends DefaultCrudRepository<
  UrlMappingToShort,
  typeof UrlMappingToShort.prototype.id,
  UrlMappingToShortRelations
> {
  constructor(
    @inject('datasources.mongo') dataSource: MongoDataSource,
  ) {
    super(UrlMappingToShort, dataSource);
  }

  create(entity: DataObject<UrlMappingToShort>, options?: Options): Promise<UrlMappingToShort> {
    entity.id = v4();
    return super.create(entity, options);
  }
}
