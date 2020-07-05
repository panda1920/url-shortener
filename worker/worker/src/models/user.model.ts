import {Entity, model, property} from '@loopback/repository';

@model({
  settings: { hiddenProperties: ['password'] }
})
export class User extends Entity {
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
    jsonSchema: {
      format: 'email',
    }
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 8,
      maxLength: 32,
    }
  })
  password: string;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
