import { repository } from '@loopback/repository';

import { UrlMappingToShortRedisRepository } from '../repositories/url-mapping-to-short-redis.repository';
import { UrlMappingToShortMongoRepository } from '../repositories/url-mapping-to-short-mongo.repository';


export interface ShortenService {
  shorten(url: string): Promise<string>;
  expand(shortened: string): Promise<string>;
};

export class HashShortenService implements ShortenService {
  constructor(
    @repository(UrlMappingToShortRedisRepository)
    private redisRepository: UrlMappingToShortRedisRepository,
    @repository(UrlMappingToShortMongoRepository)
    private mongoRepository: UrlMappingToShortMongoRepository,
  ) {}

  async shorten(url: string): Promise<string> {
    return 'www.google.com/?q=shorten';
  }

  async expand(shortened: string): Promise<string> {
    return 'www.google.com/?q=expand';
  }
}
