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
  Response,
  RestBindings,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
import { inject } from '@loopback/context';
import { TokenService, UserService, authenticate, AuthenticationBindings } from '@loopback/authentication';
import { UserProfile } from '@loopback/security';

import * as mybindings from '../mybindings';
import { UserCredential, Token } from '../types';
import {
  loginResponseSpec,
  loginRequestBodySpec,
  refreshResponseSpec
} from './specs/request-reqponse';
import { securityRequirement } from './specs/security';
import { respondWithError } from './controller.utils';

export class UserControllerController {
  constructor(
    @repository(UserRepository)
    public userRepository : UserRepository,
    @inject(mybindings.USER_SERVICE)
    public userService: UserService<User, UserCredential>,
    @inject(mybindings.TOKEN_SERVICE)
    public tokenService: TokenService,
    @inject(AuthenticationBindings.CURRENT_USER, { optional: true })
    public currentProfile: UserProfile
  ) {}

  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(User, { exclude: ['password'] })}},
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    return await this.userRepository.create(user);
  }

  // @authenticate('jwt')
  // @get('/users/count', {
  //   responses: {
  //     '200': {
  //       description: 'User model count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async count(
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.count(where);
  // }

  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(User, {includeRelations: true}),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  // @patch('/users', {
  //   responses: {
  //     '200': {
  //       description: 'User PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(User, {partial: true}),
  //       },
  //     },
  //   })
  //   user: User,
  //   @param.where(User) where?: Where<User>,
  // ): Promise<Count> {
  //   return this.userRepository.updateAll(user, where);
  // }

  // @get('/users/{id}', {
  //   responses: {
  //     '200': {
  //       description: 'User model instance',
  //       content: {
  //         'application/json': {
  //           schema: getModelSchemaRef(User, {includeRelations: true}),
  //         },
  //       },
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  // ): Promise<User> {
  //   return this.userRepository.findById(id, filter);
  // }

  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @post('/users/login', { responses: loginResponseSpec })
  async login(
    @requestBody(loginRequestBodySpec) credential: UserCredential,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<void> {
    try {
      const user = await this.userService.verifyCredentials(credential);
      const profile = this.userService.convertToUserProfile(user);
      const token = await this.tokenService.generateToken(profile);
      response.status(200).send({ token });
    }
    catch(e) {
      respondWithError(response, e);
    }
  }

  @authenticate('jwt')
  @get('/users/refresh', {
    security: [securityRequirement],
    responses: refreshResponseSpec
  })
  async refresh(): Promise<Token> {
    const token = await this.tokenService.generateToken(this.currentProfile);

    return { token };
  }
}
