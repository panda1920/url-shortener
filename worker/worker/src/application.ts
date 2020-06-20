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

import * as mybindings from './mybindings';
import MyUserService from './services/user.service';
import JwtService from './services/jwt.service';

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
    this.bind(mybindings.JWT_SERVICE)
      .toClass(JwtService)
      .inScope(BindingScope.SINGLETON);

    const secret = process.env.TOKEN_SECRET || 'secret';
    const expire = process.env.TOKEN_EXPRES_IN || '1h';
    this.bind(mybindings.TOKEN_SECRET).to(secret);
    this.bind(mybindings.TOKEN_EXPIRES_IN).to(expire);
  }
}
