import {Entity, model, property} from '@loopback/repository';

@model()
export class UrlMappingToShort extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  url: string;

  @property({
    type: 'string',
    required: true,
  })
  shortened: string;


  constructor(data?: Partial<UrlMappingToShort>) {
    super(data);
  }
}

export interface UrlMappingToShortRelations {
  // describe navigational properties here
}

export type UrlMappingToShortWithRelations = UrlMappingToShort & UrlMappingToShortRelations;
