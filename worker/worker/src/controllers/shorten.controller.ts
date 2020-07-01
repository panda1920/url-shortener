import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  RestBindings,
  Response
} from '@loopback/rest';
import {UrlMappingToShort} from '../models';
import {UrlMappingToShortMongoRepository} from '../repositories';
import { inject } from '@loopback/context';

import * as Mybindings from '../mybindings';
import { ShortenService } from '../services/shorten.service';

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
        content: {'application/json': {schema: getModelSchemaRef(UrlMappingToShort)}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            title: 'Url shorten request',
            type: 'object',
            properties: {
              url: { type: 'string', }
            },
            required: ['url'],
            additionalProperties: false,
            examples: [{ url: 'www.google.com' }],
          }
        },
      },
    })
    urlMappingToShort: { url: string; },
  ): Promise<{ shortUrl: string; }> {
    // return this.urlMappingToShortMongoRepository.create(urlMappingToShort);
    const shortUrl = await this.shortenService.shorten(urlMappingToShort.url);
    return { shortUrl };
  }

  @get('/shorten/count', {
    responses: {
      '200': {
        description: 'UrlMappingToShort model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.where(UrlMappingToShort) where?: Where<UrlMappingToShort>,
  ): Promise<Count> {
    return this.urlMappingToShortMongoRepository.count(where);
  }

  @get('/shorten', {
    responses: {
      '200': {
        description: 'Array of UrlMappingToShort model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(UrlMappingToShort, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(UrlMappingToShort) filter?: Filter<UrlMappingToShort>,
  ): Promise<UrlMappingToShort[]> {
    return this.urlMappingToShortMongoRepository.find(filter);
  }

  @patch('/shorten', {
    responses: {
      '200': {
        description: 'UrlMappingToShort PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UrlMappingToShort, {partial: true}),
        },
      },
    })
    urlMappingToShort: UrlMappingToShort,
    @param.where(UrlMappingToShort) where?: Where<UrlMappingToShort>,
  ): Promise<Count> {
    return this.urlMappingToShortMongoRepository.updateAll(urlMappingToShort, where);
  }

  @get('/shorten/{id}', {
    responses: {
      '200': {
        description: 'UrlMappingToShort model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(UrlMappingToShort, {includeRelations: true}),
          },
        },
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(UrlMappingToShort, {exclude: 'where'}) filter?: FilterExcludingWhere<UrlMappingToShort>
  ): Promise<UrlMappingToShort> {
    return this.urlMappingToShortMongoRepository.findById(id, filter);
  }

  @patch('/shorten/{id}', {
    responses: {
      '204': {
        description: 'UrlMappingToShort PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UrlMappingToShort, {partial: true}),
        },
      },
    })
    urlMappingToShort: UrlMappingToShort,
  ): Promise<void> {
    await this.urlMappingToShortMongoRepository.updateById(id, urlMappingToShort);
  }

  @put('/shorten/{id}', {
    responses: {
      '204': {
        description: 'UrlMappingToShort PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() urlMappingToShort: UrlMappingToShort,
  ): Promise<void> {
    await this.urlMappingToShortMongoRepository.replaceById(id, urlMappingToShort);
  }

  @del('/shorten/{id}', {
    responses: {
      '204': {
        description: 'UrlMappingToShort DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.urlMappingToShortMongoRepository.deleteById(id);
  }

  @get('/shorten/url/{shortUrl}', {
    responses: { '301': { description: 'Redirecting provided path to real url' } }
  })
  async redirect(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @param.path.string('shortUrl') shortUrl: string,
  ) {
    let url = await this.shortenService.expand(shortUrl);
    console.log(shortUrl);
    console.log(url);
    if (!url)
      response.redirect('https://www.yahoo.com');
    else {
      url = url.startsWith('http') ? url: 'http://' + url;
      response.redirect(url);
    }
  }
}
