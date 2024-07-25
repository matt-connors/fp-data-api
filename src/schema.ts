import { builder } from './builder';

export * from './models'
export * from './resolvers'

export const schema = builder.toSchema()