import {Credentials as CredentialsType} from '@loopback/authentication-jwt';
import {Model, model, property} from '@loopback/repository';

@model()
export class Credentials extends Model implements CredentialsType {
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


  constructor(data?: Partial<Credentials>) {
    super(data);
  }
}

export interface CredentialsRelations {
  // describe navigational properties here
}

export type CredentialsWithRelations = Credentials & CredentialsRelations;
