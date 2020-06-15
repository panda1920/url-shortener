import {DefaultKeyValueRepository, juggler} from '@loopback/repository';
import {UrlMappingToShort} from '../models';
import {RedisDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UrlMappingToShortRedisRepository extends DefaultKeyValueRepository<
  UrlMappingToShort
> {
  constructor(
    @inject('datasources.redis') dataSource: RedisDataSource,
  ) {
    super(UrlMappingToShort, dataSource);
  }
}
