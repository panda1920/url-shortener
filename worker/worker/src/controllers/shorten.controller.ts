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
import { authenticate } from '@loopback/authentication';

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

  @authenticate('jwt')
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
    const short = await this.shortenService.shorten(urlMappingToShort.url);
    return { shortUrl: createCompleteShortUrl(short) };
  }

  @get('/shorten/url/{short}', {
    responses: { '301': { description: 'Redirecting provided path to real url' } }
  })
  async redirect(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.path.string('short') short: string,
  ) {
    let url = await this.shortenService.expand(short);
    if (!url)
      response.redirect( createDefaultRedirectUrl() );
    else {
      url = url.startsWith('http') ? url: 'http://' + url;
      response.redirect(url);
    }
  }
}

function createDefaultRedirectUrl(): string {
  const scheme = process.env.REDIRECT_DEFAULT_SCHEME ?? 'http';
  const host = process.env.REDIRECT_DEFAULT_HOST ?? 'localhost';
  const port = process.env.REDIRECT_DEFAULT_PORT ?? '8888';
  const path = process.env.REDIRECT_DEFAULT_PATH ?? '/error';
  return `${scheme}://${host}:${port}${path}`;
}

function createCompleteShortUrl(short: string): string {
  const scheme = process.env.SHORTURL_SCHEME ?? 'http';
  const host = process.env.SHORTURL_HOST ?? 'localhost';
  const port = process.env.SHORTURL_PORT ?? '8888';
  const path = process.env.SHORTURL_PATH ?? '/shorten';

  // want to avoid having host:port notation for production
  const hostPort = (process.env.NODE_ENV === 'production') ? host : `${host}:${port}`;

  return `${scheme}://${hostPort}${path}/${short}`;
}
