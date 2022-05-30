import {User} from '@loopback/authentication-jwt';
import {model, property} from '@loopback/repository';

@model()
export class NewUserRequest extends User {
  @property({
    type: 'string',
    required: true,
    jsonSchema: {format: 'email'},
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {minLength: 8},
  })
  password: string;


  constructor(data?: Partial<NewUserRequest>) {
    super(data);
  }
}

export interface NewUserRequestRelations {
  // describe navigational properties here
}

export type NewUserRequestWithRelations = NewUserRequest & NewUserRequestRelations;
