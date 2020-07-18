import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import md5 from 'md5';

import { UrlMappingToShortRedisRepository } from '../repositories/url-mapping-to-short-redis.repository';
import { UrlMappingToShortMongoRepository } from '../repositories/url-mapping-to-short-mongo.repository';
import { UrlMappingToShort } from '../models/url-mapping-to-short.model';

export interface ShortenService {
  shorten(url: string): Promise<string>;
  expand(shortUrl: string): Promise<string | null>;
};

// implemented interactions with cache/persistent storage
abstract class ShortenServiceStoreImplemented implements ShortenService {
  constructor(
    private redisRepository: UrlMappingToShortRedisRepository,
    private mongoRepository: UrlMappingToShortMongoRepository,
  ) {}

  abstract shorten(url: string): Promise<string>;
  abstract expand(shortUrl: string): Promise<string | null>;

  protected async saveSafe(url: string, shortUrl: string): Promise<void> {
    await this.save(url, shortUrl);
    const savedUrl = await this.loadUrl(shortUrl);

    if (savedUrl === null) {
      console.error(`Failed to shorten url. ${url} -> ${shortUrl}`);
      throw new HttpErrors[500]('Failed to shorten url');
    }
    
    const saveSuccesful = savedUrl === url;
    if (!saveSuccesful) {
      console.error(`Detected conflict. ${shortUrl} : ${savedUrl} | ${url}`);
      throw new HttpErrors[500]('Failed to shorten url');
    }
  }

  protected async save(url: string, shortUrl: string): Promise<void> {
    const newMapping = new UrlMappingToShort({ url, shortUrl });
    await this.mongoRepository.save(newMapping);
    await this.saveCache(url, shortUrl);
  }

  protected async saveCache(url: string, shortUrl: string): Promise<void> {
    const newMapping = new UrlMappingToShort({ url, shortUrl });
    await this.redisRepository.set(shortUrl, newMapping);
  }

  protected async loadUrl(shortUrl: string): Promise<string | null> {
    // get data from cache first
    const response = await this.redisRepository.get(shortUrl);
    if (response)
      return response.url;
    
    // only get from mongoo when cache miss
    const result  = await this.mongoRepository.find({ where: { shortUrl }})
    if (result.length < 1)
      return null;
      
    this.saveCache(result[0].url, shortUrl);
    return result[0].url;
  }

  protected async loadShort(url: string): Promise<string | null> {
    const result  = await this.mongoRepository.find({ where: { url }})
    if (result.length < 1)
      return null;

    return result[0].shortUrl;
  }
}

// one implementation of shortening algorithm
export class HashShortenService extends ShortenServiceStoreImplemented {
  // 281 trillion numbers can be represented with 8 character of 64 base
  // log base 2 of that is exactly 48 bits
  private readonly CHARACTERS_USED = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.';
  private readonly BITS_USED = 48;

  constructor(
    @repository(UrlMappingToShortRedisRepository)
    redisRepository: UrlMappingToShortRedisRepository,
    @repository(UrlMappingToShortMongoRepository)
    mongoRepository: UrlMappingToShortMongoRepository,
  ) {
    super(redisRepository, mongoRepository);
  }

  async shorten(url: string): Promise<string> {
    let shortUrl = await this.loadShort(url);
    if (!shortUrl)
      shortUrl = await this.generateShort(url);

    return shortUrl;
  }

  async expand(shortUrl: string): Promise<string | null> {
    return await this.loadUrl(shortUrl);
  }

  private async generateShort(url: string): Promise<string> {
    const trimmedHash = md5(url).slice(0, this.BITS_USED / 4);
    const decimalRepresentation = parseInt(trimmedHash, 16);
    const shortUrl = this.convertNumberToShortUrl(decimalRepresentation);
    await this.saveSafe(url, shortUrl);

    return shortUrl;
  }

  private convertNumberToShortUrl(n: number) {
    const base = this.CHARACTERS_USED.length;
    let shortUrl = '';
    
    while (n > 0) {
      const remainder = n % base;
      shortUrl = this.CHARACTERS_USED.charAt(remainder) + shortUrl;
      n = Math.floor(n / base);
    }

    return shortUrl;
  }
}
