// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {UserService} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {compare} from 'bcryptjs';
import {Credentials, MyUser, MyUserWithRelations} from '../models';
import {MyUserRepository} from '../repositories';

export class MyUserService implements UserService<MyUser, Credentials> {
  constructor(
    @repository(MyUserRepository) private userRepository: MyUserRepository,
  ) { }

  async verifyCredentials(credentials: Credentials): Promise<MyUser> {
    const invalidCredentialsError = 'Invalid email or password.';

    const foundUser = await this.userRepository.findOne({
      where: {email: credentials.email},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const credentialsFound = await this.userRepository.findCredentials(
      foundUser.id,
    );
    if (!credentialsFound) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    const passwordMatched = await compare(
      credentials.password,
      credentialsFound.password,
    );
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(user: MyUser): UserProfile {
    return {
      [securityId]: user.id.toString(),
      name: user.username,
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async findUserById(id: string): Promise<MyUserWithRelations> {
    const foundUser = await this.userRepository.findOne({
      where: {id},
    });
    if (!foundUser) {
      throw new HttpErrors.Unauthorized('user not found');
    }
    return foundUser;
  }
}
