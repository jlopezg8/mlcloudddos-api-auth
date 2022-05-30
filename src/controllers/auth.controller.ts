// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TokenService, UserService} from '@loopback/authentication';
import {
  Credentials as CredentialsInterface,
  RefreshTokenService,
  RefreshTokenServiceBindings,
  TokenObject,
  TokenServiceBindings,
  User,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {post, requestBody} from '@loopback/rest';
import {Credentials} from '../models';

export class AuthController {
  constructor(
    @inject(RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    private refreshService: RefreshTokenService,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    private tokenService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    private userService: UserService<User, CredentialsInterface>,
  ) { }

  @post('/login', {
    responses: {
      '200': {
        description: 'Access and refresh tokens',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {type: 'string'},
                refreshToken: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({required: true})
    credentials: Credentials,
  ): Promise<TokenObject> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = this.userService.convertToUserProfile(user);
    const accessToken = await this.tokenService.generateToken(userProfile);
    const tokens = await this.refreshService.generateToken(
      userProfile, accessToken);
    return tokens;
  }

  @post('/refresh-token', {
    responses: {
      '200': {
        description: 'New access token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                accessToken: {type: 'string'},
              },
            },
          },
        },
      },
    },
  })
  async refreshToken(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['refreshToken'],
            properties: {
              refreshToken: {type: 'string'},
            },
          }
        },
      },
    })
    refreshGrant: {refreshToken: string},
  ): Promise<TokenObject> {
    return this.refreshService.refreshToken(refreshGrant.refreshToken);
  }
}
