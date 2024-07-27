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
 * Get permissions associated with a user
 */
export const getUserPermissions = (userId: string, db: any) => db
    .selectFrom('UserRole')
    .selectAll()
    .where('userId', '=', userId)
    .select(
        (eb: ExpressionBuilder<DB, 'UserRole'>) => jsonArrayFrom(
            eb.selectFrom('Role')
                .selectAll()
                .whereRef('Role.id', '=', 'UserRole.roleId')
                .select(
                    (eb: ExpressionBuilder<DB, 'Role'>) => jsonArrayFrom(
                        eb.selectFrom('Permission')
                            .select([
                                'Permission.id',
                                'Permission.description',
                                'Permission.action',
                                'Permission.resource'
                            ])
                            .innerJoin('_PermissionToRole', 'Permission.id', '_PermissionToRole.A')
                            .whereRef('_PermissionToRole.B', '=', 'Role.id')
                    ).as('permissions')
                )
        ).as('rolesWithPermissions')
    )
    .execute()
    .then((result: any) => {
        if (result.length === 0) {
            console.log(`User with id "${userId}" was not found in the UserRole table.`);
            return null;
        }
        if (result[0]['rolesWithPermissions'].length === 0) {
            console.log(`User with id "${userId}" has no roles and therefore no permissions.`);
            return null;
        }
        return result[0]['rolesWithPermissions'][0]['permissions'];
    });


export const updateDatabase = ({ table, key, data, db }: { table: string, key: string, data: { [key: string]: any }, db: any }) => db
    .updateTable(table)
    .set(data)
    .where('id', '=', key)
    .executeTakeFirst();

export const appendToDatabase = ({ table, data, db}: { table: string, data: { [key: string]: any }, db: any }) => db
    .insertInto(table)
    .values(data)
    .executeTakeFirst();

/**
 * Query type
 */
builder.queryType({
    fields: (t) => ({
        /**
         * TEMP: Get all trainers
         */
        trainers: t.field({
            type: [TrainerType],
            nullable: true,
            resolve: executeQuery((db, { id }) => db
                .selectFrom('Trainer')
                .selectAll()
                .select(withUsers)
                .execute()
            )
        }),
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