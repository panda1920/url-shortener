import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  requestBody,
  RestBindings,
  Response
} from '@loopback/rest';
import {UrlMappingToShort} from '../models';
import {UrlMappingToShortMongoRepository} from '../repositories';
import { inject } from '@loopback/context';

import * as Mybindings from '../mybindings';
import { ShortenService } from '../services/shorten.service';
import * as Myspecs from './specs/request-reqponse';

export class ShortenController {
  constructor(
    @repository(UrlMappingToShortMongoRepository)
    public urlMappingToShortMongoRepository : UrlMappingToShortMongoRepository,
    @inject(Mybindings.SHORTEN_SERVICE)
    public shortenService: ShortenService,
  ) {}

  @post('/shorten', {
    responses: {
      '200': {
        description: 'UrlMappingToShort model instance',
        content: {'application/json': {
          schema: getModelSchemaRef(UrlMappingToShort, { exclude: ['id', 'url'] })
        }},
      },
    },
  })
  async create(
    @requestBody(Myspecs.shortenRequestBodySpec)
    urlMappingToShort: { url: string; },
  ): Promise<{ shortUrl: string; }> {
    const shortUrl = await this.shortenService.shorten(urlMappingToShort.url);
    return { shortUrl: createCompleteShortUrl(shortUrl) };
  }

  @get('/shorten/url/{shortUrl}', {
    responses: { '301': { description: 'Redirecting provided path to real url' } }
  })
  async redirect(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.path.string('shortUrl') shortUrl: string,
  ) {
    let url = await this.shortenService.expand(shortUrl);
    if (!url)
      getClientUrl();
    else {
      url = url.startsWith('http') ? url: 'http://' + url;
      response.redirect(url);
    }
  }
}

function getClientUrl(): string {
  const host = process.env.REDIRECT_DEFAULT_HOST || 'localhost';
  const port = process.env.REDIRECT_DEFAULT_PORT || '8888';
  return `http://${host}:${port}`;
  // figure out what to do when TLS is neccessary
}

function createCompleteShortUrl(shortUrl: string): string {
  const shortenPath = process.env.SHORTEN_PATH || '/shorten';
  return `${getClientUrl()}${shortenPath}/${shortUrl}`;
}
