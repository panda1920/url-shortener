import {DefaultCrudRepository} from '@loopback/repository';
import {UrlMappingToShort, UrlMappingToShortRelations} from '../models';
import {MongoDataSource} from '../datasources';
import {inject} from '@loopback/core';

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
}
