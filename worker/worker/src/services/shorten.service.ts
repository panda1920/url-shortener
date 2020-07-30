import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import md5 from 'md5';
import validUrl from 'valid-url';

import { UrlMappingToShortRedisRepository } from '../repositories/url-mapping-to-short-redis.repository';
import { UrlMappingToShortMongoRepository } from '../repositories/url-mapping-to-short-mongo.repository';
import { UrlMappingToShort } from '../models/url-mapping-to-short.model';

export interface ShortenService {
  shorten(url: string): Promise<string>;
  expand(short: string): Promise<string | null>;
};

// implemented interactions with cache/persistent storage
abstract class ShortenServiceStoreImplemented implements ShortenService {
  constructor(
    private redisRepository: UrlMappingToShortRedisRepository,
    private mongoRepository: UrlMappingToShortMongoRepository,
  ) {}

  abstract shorten(url: string): Promise<string>;
  abstract expand(short: string): Promise<string | null>;

  protected async saveSafe(url: string, short: string): Promise<void> {
    await this.save(url, short);
    await this.confirmSaveSuccess(url, short);
  }

  private async save(url: string, short: string): Promise<void> {
    const newMapping = this.createMapping(url, short);
    await this.saveToDB(newMapping);
    await this.saveToCache(short, newMapping);
  }

  private createMapping(url: string, short: string): UrlMappingToShort {
    return new UrlMappingToShort({ url, short });
  }

  private async saveToDB(mapping: UrlMappingToShort): Promise<void> {
    await this.mongoRepository.save(mapping);
  }

  private async saveToCache(short: string, mapping: UrlMappingToShort): Promise<void> {
    await this.redisRepository.set(short, mapping);
  }

  private async confirmSaveSuccess(url: string, short: string): Promise<void> {
    const savedUrl = await this.loadUrl(short);

    if (savedUrl === null) {
      console.error(`Failed to shorten url. ${url} -> ${short}`);
      throw new HttpErrors[500]('Failed to shorten url');
    }
    
    const saveSuccesful = savedUrl === url;
    if (!saveSuccesful) {
      console.error(`Detected conflict. ${short} : ${savedUrl} | ${url}`);
      throw new HttpErrors[500]('Failed to shorten url');
    }
  }

  protected async loadUrl(short: string): Promise<string | null> {
    // get data from cache first
    const response = await this.redisRepository.get(short);
    if (response)
      return response.url;
    
    // only reach for mongo when cache miss
    const result  = await this.mongoRepository.find({ where: { short }})
    if (result.length < 1)
      return null;
      
    const url = result[0].url;
    this.saveToCache(short, this.createMapping(url, short));
    return url;
  }

  protected async loadShort(url: string): Promise<string | null> {
    const result  = await this.mongoRepository.find({ where: { url }})
    if (result.length < 1)
      return null;

    return result[0].short;
  }

  // implementation of validation/normalization helpers

  protected validateUrl(url: string): void {
    if (validUrl.isWebUri(url))
      return;

    const error = new HttpErrors[400]('Invalid url');
    error.reason = 'url';
    throw error;
  }

  protected normalizeUrl(url: string): string {
    return this.hasScheme(url) ? url : 'http://' + url;
  }

  private hasScheme(url: string): boolean {
    const schemePattern = /^[a-zA-Z]+:\/\/.*/g;
    return schemePattern.exec(url) !== null;
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
    const normalized = this.normalizeUrl(url);
    this.validateUrl(normalized);

    let short = await this.loadShort(normalized);
    if (!short)
      short = await this.generateShort(normalized);

    return short;
  }

  async expand(short: string): Promise<string | null> {
    return await this.loadUrl(short);
  }

  private async generateShort(url: string): Promise<string> {
    const truncatedHashedUrl = md5(url).slice(0, this.BITS_USED / 4);
    const decimalRepresentation = parseInt(truncatedHashedUrl, 16);
    const short = this.convertNumberToShort(decimalRepresentation);
    await this.saveSafe(url, short);

    return short;
  }

  private convertNumberToShort(n: number) {
    const base = this.CHARACTERS_USED.length;
    let short = '';
    
    while (n > 0) {
      const remainder = n % base;
      short = this.CHARACTERS_USED.charAt(remainder) + short;
      n = Math.floor(n / base);
    }

    return short;
  }
}
