import { BindingKey } from "@loopback/context";

import MyUserService from './services/user.service';
import JwtService from './services/jwt.service';

export const USER_SERVICE = BindingKey.create<MyUserService>('services.user.service');
export const JWT_SERVICE = BindingKey.create<JwtService>('services.jwt.service');

export const TOKEN_SECRET = BindingKey.create<string>('token.secret');
export const TOKEN_EXPIRES_IN = BindingKey.create<string>('token.expires.in');
