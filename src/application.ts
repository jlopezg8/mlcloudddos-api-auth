import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  RefreshTokenServiceBindings,
  TokenServiceBindings,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {
  AuthorizationBindings,
  AuthorizationComponent,
  AuthorizationDecision,
  AuthorizationOptions,
  AuthorizationTags
} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MongoDbAtlasDataSource} from './datasources';
import {MyAuthorizationProvider} from './providers';
import {MyUserRepository} from './repositories';
import {MySequence} from './sequence';
import {MyJWTService, MyUserService} from './services';

require('dotenv').config();

export {ApplicationConfig};

export class MlCloudDDoSApiAuthApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    this.mountAuthSystem();

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

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

  private mountAuthSystem() {
    this.component(AuthenticationComponent);
    this.component(JWTAuthenticationComponent);

    this.dataSource(MongoDbAtlasDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.dataSource(MongoDbAtlasDataSource, RefreshTokenServiceBindings.DATASOURCE_NAME);

    this.bind(UserServiceBindings.USER_SERVICE).toClass(MyUserService);
    this.bind(UserServiceBindings.USER_REPOSITORY).toClass(MyUserRepository);

    this.bind(TokenServiceBindings.TOKEN_SECRET).to(process.env.TOKEN_SECRET!);
    this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to('21600'); // 21600 s = 6 h
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(MyJWTService);

    this.bind(RefreshTokenServiceBindings.REFRESH_SECRET).to(process.env.REFRESH_SECRET!);
    this.bind(RefreshTokenServiceBindings.REFRESH_EXPIRES_IN).to('216000'); // 216000 s = 2.5 days

    const authorizationOptions: AuthorizationOptions = {
      // Controls if Allow/Deny vote takes precedence and override other votes
      precedence: AuthorizationDecision.DENY,
      // Default decision if all authorizers vote for ABSTAIN
      defaultDecision: AuthorizationDecision.DENY,
    };
    this.configure(AuthorizationBindings.COMPONENT).to(authorizationOptions);
    this.component(AuthorizationComponent);

    // Adapted from https://github.com/loopbackio/loopback-next/tree/master/packages/authorization#create-authorizer-provider
    this
      .bind('authorizationProviders.my-authorizer-provider')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER);
  }
}
