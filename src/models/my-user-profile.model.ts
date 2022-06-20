import {Model, model, property} from '@loopback/repository';
import {securityId, UserProfile} from '@loopback/security';
import {Role} from './my-user.model';

@model()
export class MyUserProfile extends Model implements UserProfile {
  [securityId]: string;

  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  // https://loopback.io/doc/en/lb4/Model.html#enum-property
  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(Role),
    },
  })
  role: Role;

  [attribute: string]: any;

  constructor(data?: Partial<MyUserProfile>) {
    super(data);
  }
}

export interface MyUserProfileRelations {
  // describe navigational properties here
}

export type MyUserProfileWithRelations = MyUserProfile & MyUserProfileRelations;
