import { ExpressionBuilder } from 'kysely'
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres'
import { Resource, builder } from '../../builder'

import { TrainerType, UserType } from '../../models'

import { executeQuery, generateAuthScopes } from '../utils'
import { DB } from '../../types'

// https://pothos-graphql.dev/docs/guide/objects
// https://kysely.dev/docs/examples/INSERT/returning-data

// See https://kysely.dev/docs/recipes/relations

/**
 * One-to-many relation between Trainer and User
 */
const withUsers = (eb: ExpressionBuilder<DB, 'Trainer'>) => jsonArrayFrom(
    eb.selectFrom('User')
        .selectAll()
        .whereRef('User.trainerId', '=', 'Trainer.id')
).as('users');

/**
 * Many-to-many relation between Endpoints and Permission
 */
// const withPermission = (eb: ExpressionBuilder<DB, 'Endpoints'>) => jsonArrayFrom(
//     eb.selectFrom('Permission')
//         .select([
//             'Permission.id',
//             'Permission.description',
//             'Permission.action'
//         ])
//         .innerJoin('_EndpointsToPermission', 'Permission.id', '_EndpointsToPermission.B')
//         .whereRef('_EndpointsToPermission.A', '=', 'Endpoints.endpoint')
// ).as('permissions');


/**
 * Query type
 */
builder.queryType({
    fields: (t) => ({
        /**
         * Get user information
         */
        user: t.field({
            type: UserType,
            authScopes: generateAuthScopes({
                resource: 'TEST',
                action: 'VIEW'
            }),
            args: {
                userId: t.arg.string({ required: true }),
            },
            resolve: executeQuery((db, { userId }) => db
                .selectFrom('User')
                .selectAll()
                .where('id', '=', userId)
                .executeTakeFirst()
            )
        }),
        /**
         * Get permissions associated with an endpoint
         */
        // endpoint: t.field({
        //     type: EndpointType,
        //     authScopes: generateAuthScopes({
        //         resource: 'TEST',
        //         action: 'VIEW'
        //     }),
        //     args: {
        //         endpoint: t.arg.string({ required: true }),
        //     },
        //     resolve: executeQuery((db, { endpoint }) => db
        //         .selectFrom('Endpoints')
        //         .selectAll()
        //         .where('endpoint', '=', endpoint)
        //         .select(withPermission)
        //         .executeTakeFirst()
        //     )
        // }),
    })
});



// see https://pothos-graphql.dev/docs/plugins/smart-subscriptions for subscriptions
// see https://pothos-graphql.dev/docs/plugins/scope-auth for auth