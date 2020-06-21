import { BindingKey } from "@loopback/context";
import {
  UserService,
  TokenService,
} from '@loopback/authentication';

import { User } from './models';
import { UserCredential } from './types';

export const USER_SERVICE = BindingKey.create<UserService<User, UserCredential>>('services.user.service');
export const TOKEN_SERVICE = BindingKey.create<TokenService>('services.token.service');

export const TOKEN_SECRET = BindingKey.create<string>('token.secret');
export const TOKEN_EXPIRES_IN = BindingKey.create<string>('token.expires.in');
