import {User} from '@loopback/authentication-jwt';
import {model, property} from '@loopback/repository';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@model()
export class MyUser extends User {
  // https://loopback.io/doc/en/lb4/Model.html#enum-property
  @property({
    type: 'string',
    default: Role.USER,
    jsonSchema: {
      enum: Object.values(Role),
    },
  })
  role?: Role;


  constructor(data?: Partial<MyUser>) {
    super(data);
  }
}

export interface MyUserRelations {
  // describe navigational properties here
}

export type MyUserWithRelations = MyUser & MyUserRelations;
