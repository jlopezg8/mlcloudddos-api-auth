// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {authenticate} from '@loopback/authentication';
import {
  User,
  UserRepository,
  UserServiceBindings
} from '@loopback/authentication-jwt';
//import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {HttpErrors, post, requestBody} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {NewUserRequest} from '../models';

export class UserController {
  constructor(
    @inject(UserServiceBindings.USER_REPOSITORY)
    private userRepository: UserRepository,
  ) { }

  @authenticate('jwt')
  //@authorize({resource: 'user', scopes: ['create'], allowedRoles: ['admin']})
  @post('/users', {
    responses: {
      '200': {
        description: 'Created user',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async createUser(
    @requestBody({required: true})
    newUserRequest: NewUserRequest,
  ): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: {email: newUserRequest.email},
    });
    if (foundUser) {
      throw new HttpErrors.BadRequest('a user with this email address already exists');
    }
    const password = await hash(newUserRequest.password, await genSalt());
    delete (newUserRequest as Partial<NewUserRequest>).password;
    const savedUser = await this.userRepository.create(newUserRequest);
    await this.userRepository.userCredentials(savedUser.id).create({password});
    return savedUser;
  }
}
