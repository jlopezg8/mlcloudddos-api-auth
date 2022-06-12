// Adapted from https://github.com/loopbackio/loopback-next/tree/master/packages/authorization#create-authorizer-provider

import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer
} from '@loopback/authorization';
import {Provider} from '@loopback/core';

export class MyAuthorizationProvider implements Provider<Authorizer> {
  constructor() { }

  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    const clientRole = authorizationCtx.principals[0].role;
    const allowedRoles = metadata.allowedRoles;
    return allowedRoles?.includes(clientRole)
      ? AuthorizationDecision.ALLOW
      : AuthorizationDecision.DENY;
  }
}
