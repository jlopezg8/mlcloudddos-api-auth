// Copyright IBM Corp., LoopBack contributors, and jlopezg8 <jlopezg8@gmail.com>
// 2022. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  UserCredentials,
  UserCredentialsRepository,
  UserServiceBindings
} from '@loopback/authentication-jwt';
import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasOneRepositoryFactory,
  juggler,
  repository
} from '@loopback/repository';
import {MyUser, MyUserRelations} from '../models';

export class MyUserRepository extends DefaultCrudRepository<
  MyUser,
  typeof MyUser.prototype.id,
  MyUserRelations
> {
  public readonly userCredentials: HasOneRepositoryFactory<
    UserCredentials,
    typeof MyUser.prototype.id
  >;

  constructor(
    @inject(`datasources.${UserServiceBindings.DATASOURCE_NAME}`)
    dataSource: juggler.DataSource,
    @repository.getter('UserCredentialsRepository')
    userCredentialsRepositoryGetter: Getter<UserCredentialsRepository>,
  ) {
    super(MyUser, dataSource);
    this.userCredentials = this.createHasOneRepositoryFactoryFor(
      'userCredentials',
      userCredentialsRepositoryGetter,
    );
    this.registerInclusionResolver(
      'userCredentials',
      this.userCredentials.inclusionResolver,
    );
  }

  async findCredentials(
    userId: typeof MyUser.prototype.id,
  ): Promise<UserCredentials | undefined> {
    try {
      return await this.userCredentials(userId).get();
    } catch (err) {
      if (err.code === 'ENTITY_NOT_FOUND') {
        return undefined;
      }
      throw err;
    }
  }
}
