import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import { BindingScope } from '@loopback/context';
import {
  AuthenticationComponent,
  AuthenticationBindings,
  registerAuthenticationStrategy,
} from '@loopback/authentication';

import * as mybindings from './mybindings';
import MyUserService from './services/user.service';
import JwtService from './services/jwt.service';
import JwtStrategy from './auth-strategy/jwt.strategy';
import { HashShortenService } from './services/shorten.service';
import { BcryptPasswordHasher } from './services/password-hasher.service';

export {ApplicationConfig};

export class WorkerApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    // add authenticaiton
    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JwtStrategy);

    this.setBindings();

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }

  setBindings() {
    this.bind(mybindings.USER_SERVICE)
      .toClass(MyUserService)
      .inScope(BindingScope.SINGLETON);
    this.bind(mybindings.TOKEN_SERVICE)
      .toClass(JwtService)
      .inScope(BindingScope.SINGLETON);
    this.bind(mybindings.SHORTEN_SERVICE)
      .toClass(HashShortenService)
      .inScope(BindingScope.SINGLETON);
    this.bind(mybindings.PASSWORD_HASHER_SERVICE)
      .toClass(BcryptPasswordHasher)
      .inScope(BindingScope.SINGLETON);

    const secret = process.env.TOKEN_SECRET || 'secret';
    const expire = process.env.TOKEN_EXPRES_IN || '1h';
    this.bind(mybindings.TOKEN_SECRET).to(secret);
    this.bind(mybindings.TOKEN_EXPIRES_IN).to(expire);
  }
}
